import "server-only";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { deleteAttempt, deleteExpiredSessions, deleteSession, findUserByName, findUserBySession, getAttempt, insertSession, insertUser, mutateStore, setAttempt } from "./db";
import type { Member } from "./model";
import { requireThat } from "./domain";

const COOKIE = "pasos-session";
const digest = (token: string) => createHash("sha256").update(token).digest("hex");

export function createUser(name: string, password: string, role: Member["role"], id = randomUUID()) {
  requireThat(name.length >= 2 && name.length <= 40, "El nombre de acceso debe tener entre 2 y 40 caracteres.");
  requireThat(password.length >= (role === "parent" ? 10 : 6) && password.length <= 128, role === "parent" ? "La contraseña necesita entre 10 y 128 caracteres." : "La clave infantil necesita entre 6 y 128 caracteres.");
  requireThat(!findUserByName(name), "Ese nombre de acceso ya está utilizado.");
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  insertUser({ id, name, role, password: `${salt}:${hash}` });
  return { id, name, role };
}

export async function currentUser(): Promise<Member | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  return findUserBySession(digest(token), Date.now());
}

export function verifyLogin(name: string, password: string): Member {
  const key = name.toLowerCase();
  const attempt = getAttempt(key);
  requireThat(!attempt || attempt.until < Date.now() || attempt.count < 5, "Demasiados intentos. Espera 15 minutos antes de volver a probar.");
  const user = findUserByName(name);
  const [salt, hash] = (user?.password || `00000000000000000000000000000000:${"0".repeat(128)}`).split(":");
  const valid = timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(hash, "hex"));
  if (!valid || !user) {
    const count = attempt && attempt.until > Date.now() ? attempt.count + 1 : 1;
    mutateStore(() => setAttempt(key, count, Date.now() + 15 * 60_000));
    requireThat(false, "El nombre o la clave no son correctos.");
  }
  mutateStore(() => deleteAttempt(key));
  return { id: user.id, name: user.name, role: user.role };
}

export async function openSession(user: Member) {
  const token = randomBytes(32).toString("hex");
  const ttl = 7 * 24 * 60 * 60;
  mutateStore(() => {
    deleteExpiredSessions(Date.now());
    insertSession(digest(token), user.id, Date.now() + ttl * 1000);
  });
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.COOKIE_SECURE === "true", path: "/", maxAge: ttl });
}

export async function closeSession() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) mutateStore(() => deleteSession(digest(token)));
  store.delete(COOKIE);
}
