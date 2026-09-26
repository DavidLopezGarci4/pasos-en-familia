import "server-only";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Child, Family, Member } from "./model";
import { xpForLevel } from "./model";

type UserRecord = Member & { password: string };
type SessionRecord = { token: string; userId: string; expires: number };
type AttemptRecord = { name: string; count: number; until: number };
type Store = { family: string | null; users: UserRecord[]; sessions: SessionRecord[]; attempts: AttemptRecord[] };

const directory = process.env.FAMILY_DATA_DIR || path.join(process.cwd(), "data");
const file = path.join(directory, "family.json");
mkdirSync(directory, { recursive: true, mode: 0o700 });

function emptyStore(): Store {
  return { family: null, users: [], sessions: [], attempts: [] };
}

function loadStore(): Store {
  if (!existsSync(file)) return emptyStore();
  try {
    return { ...emptyStore(), ...JSON.parse(readFileSync(file, "utf8")) } as Store;
  } catch {
    throw new Error("No se puede leer el almacenamiento de la familia.");
  }
}

let store = loadStore();

function refresh() {
  store = loadStore();
}

function persist() {
  const temporary = `${file}.tmp`;
  writeFileSync(temporary, JSON.stringify(store), { encoding: "utf8", mode: 0o600 });
  renameSync(temporary, file);
}

function normalizeChild(child: Child): Child {
  const pet = child.pet
    ? {
        ...child.pet,
        happiness: child.pet.happiness ?? 80,
        fullness: child.pet.fullness ?? 80,
        energy: child.pet.energy ?? 3,
        maxEnergy: child.pet.maxEnergy ?? 5,
        equippedAccessories: child.pet.equippedAccessories || [],
        unlockedItems: child.pet.unlockedItems || [],
      }
    : null;

  return {
    ...child,
    level: child.level ?? 1,
    xp: child.xp ?? 0,
    xpToNext: child.xpToNext ?? xpForLevel(child.level ?? 1),
    pet,
  };
}


function normalizeFamily(value: Family): Family {
  return {
    ...value,
    children: (value.children || []).map(normalizeChild),
    tasks: (value.tasks || []).map(task => ({
      ...task,
      childIds: task.childIds?.length ? task.childIds : task.childId ? [task.childId] : [],
      childId: task.childId || task.childIds?.[0] || "",
      autoApprove: task.autoApprove ?? false,
      cue: task.cue || "Cuando llegue el momento acordado",
      firstStep: task.firstStep || `Empezar por ${task.title.toLowerCase()}`,
      checklist: task.checklist || [],
    })),
    quests: value.quests || [],
  };
}

export function transaction<T>(run: () => T): T {
  const backup = JSON.parse(JSON.stringify(store)) as Store;
  try {
    const result = run();
    persist();
    return result;
  } catch (error) {
    store = backup;
    persist();
    throw error;
  }
}

export function readFamily(): Family | null {
  refresh();
  return store.family ? normalizeFamily(JSON.parse(store.family) as Family) : null;
}

export function saveFamily(family: Family) {
  store.family = JSON.stringify(normalizeFamily(family));
}

export function findUserByName(name: string): UserRecord | undefined {
  refresh();
  return store.users.find(user => user.name.toLowerCase() === name.toLowerCase());
}

export function insertUser(user: UserRecord) {
  store.users.push(user);
}

export function deleteUser(userId: string) {
  refresh();
  store.users = store.users.filter(user => user.id !== userId);
  store.sessions = store.sessions.filter(session => session.userId !== userId);
}

export function listUsers(): Member[] {
  refresh();
  return store.users.map(({ id, name, role }) => ({ id, name, role }));
}

export function findUserBySession(token: string, now: number): Member | null {
  refresh();
  const session = store.sessions.find(item => item.token === token && item.expires > now);
  const user = session && store.users.find(item => item.id === session.userId);
  return user ? { id: user.id, name: user.name, role: user.role } : null;
}

export function getAttempt(name: string): AttemptRecord | undefined {
  refresh();
  return store.attempts.find(attempt => attempt.name === name);
}

export function mutateStore<T>(run: () => T): T {
  const result = run();
  persist();
  return result;
}

export function setAttempt(name: string, count: number, until: number) {
  const existing = store.attempts.find(attempt => attempt.name === name);
  if (existing) {
    existing.count = count;
    existing.until = until;
  } else {
    store.attempts.push({ name, count, until });
  }
}

export function deleteAttempt(name: string) {
  store.attempts = store.attempts.filter(attempt => attempt.name !== name);
}

export function deleteExpiredSessions(now: number) {
  store.sessions = store.sessions.filter(session => session.expires >= now);
}

export function insertSession(token: string, userId: string, expires: number) {
  store.sessions.push({ token, userId, expires });
}

export function deleteSession(token: string) {
  store.sessions = store.sessions.filter(session => session.token !== token);
}
