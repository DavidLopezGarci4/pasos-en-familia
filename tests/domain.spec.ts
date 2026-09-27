import { test, expect } from "@playwright/test";
import { addPoints, reviewRequest, submitTask, publicFamily, editTask, deleteTask, editReward, deleteReward, feedPet, playPet, buyPetItem, togglePetAccessory, contributeToProject, createFamilyProject } from "../src/lib/domain";
import { dayKey, taskRequest, type Family, type Member } from "../src/lib/model";

const parent: Member = { id: "p1", name: "Adulto", role: "parent" };
function fixture(): Family {
  return { name: "Familia", settings: { negativeEnabled: true, acceptable: 60, target: 85, timezone: "Europe/Madrid" }, children: [
    { id: "c1", name: "Ana", age: 10, avatar: "🦊", score: 50, balance: 20, goal: "Organizarme", level: 1, xp: 0, xpToNext: 50, pet: null },
    { id: "c2", name: "Leo", age: 12, avatar: "🐼", score: 50, balance: 0, goal: "Colaborar", level: 1, xp: 0, xpToNext: 50, pet: null },
  ], tasks: [{ id: "t1", childId: "c1", childIds: ["c1"], title: "Mochila", points: 5, frequency: "daily", autoApprove: false, cue: "Después de cenar", firstStep: "Abrir la agenda", active: true, checklist: [] }], rewards: [{ id: "rw1", title: "Cine", description: "Peli en casa", cost: 30, emoji: "🍿", active: true }], requests: [], entries: [], messages: [], quests: [] };
}


test("los límites 0–100 conservan el saldo y el movimiento efectivo", () => {
  const family = fixture();
  const child = family.children[0];
  addPoints(family, child, -100, "Ajuste", parent);
  expect(child.score).toBe(0);
  expect(child.balance).toBe(20);
  expect(family.entries[0].delta).toBe(-50);
  addPoints(family, child, 80, "Avance", parent);
  addPoints(family, child, 40, "Otro avance", parent);
  expect(child.score).toBe(100);
  expect(child.balance).toBe(140);
  expect(family.entries[0].delta).toBe(20);
  expect(family.entries[0].balanceDelta).toBe(40);
});

test("se rechazan puntos negativos desactivados y modificaciones infantiles", () => {
  const family = fixture();
  family.settings.negativeEnabled = false;
  expect(() => addPoints(family, family.children[0], -5, "Motivo", parent)).toThrow("desactivados");
  expect(() => addPoints(family, family.children[0], 5, "Motivo", { id: "c1", name: "Ana", role: "child" })).toThrow("Solo los padres");
  expect(family.children[0].score).toBe(50);
});

test("una tarea no puede puntuarse dos veces ni enviarse por otro hijo", () => {
  const family = fixture();
  expect(() => submitTask(family, "t1", { id: "c2", name: "Leo", role: "child" }, false)).toThrow("otro perfil");
  submitTask(family, "t1", { id: "c1", name: "Ana", role: "child" }, false);
  const request = family.requests[0];
  reviewRequest(family, request.id, "approved", "Buen paso", parent);
  expect(family.children[0].score).toBe(55);
  expect(() => reviewRequest(family, request.id, "approved", "", parent)).toThrow("ya se ha revisado");
  expect(() => submitTask(family, "t1", parent, true)).toThrow("ya está enviada");
  expect(family.children[0].balance).toBe(25);
});

test("una rutina automática se puede asignar a varios hijos y solo suma al completarla", () => {
  const family = fixture();
  family.tasks[0] = { ...family.tasks[0], childIds: ["c1", "c2"], autoApprove: true };
  submitTask(family, "t1", { id: "c1", name: "Ana", role: "child" }, false);
  expect(family.requests[0].status).toBe("approved");
  expect(family.children[0].balance).toBe(25);
  submitTask(family, "t1", { id: "c2", name: "Leo", role: "child" }, false);
  expect(family.requests[0].childId).toBe("c2");
  expect(family.children[1].score).toBe(55);
  expect(() => submitTask(family, "t1", { id: "c1", name: "Ana", role: "child" }, false)).toThrow("ya está enviada");
});

test("los canjes revisan saldo en cada aprobación y no restan de la barra", () => {
  const family = fixture();
  for (const id of ["r1", "r2"]) family.requests.push({ id, childId: "c1", kind: "reward", referenceId: "gift", title: "Cine", points: 15, date: "2026-09-15", status: "pending", note: "" });
  reviewRequest(family, "r1", "approved", "", parent);
  expect(family.children[0].balance).toBe(5);
  expect(family.children[0].score).toBe(50);
  expect(() => reviewRequest(family, "r2", "approved", "", parent)).toThrow("saldo suficiente");
  expect(family.requests[1].status).toBe("pending");
  reviewRequest(family, "r1", "delivered", "", parent);
  expect(() => reviewRequest(family, "r1", "delivered", "", parent)).toThrow("aprobadas");
  expect(family.children[0].balance).toBe(5);
});

test("los datos de hermanos no se envían a la interfaz infantil", () => {
  const family = fixture();
  addPoints(family, family.children[1], 5, "Privado de Leo", parent);
  family.messages.push({ id: "m", childId: "c2", text: "Mensaje de Leo", by: "Adulto", at: new Date().toISOString() });
  const output = publicFamily(family, { id: "c1", name: "Ana", role: "child" });
  expect(output.children.map(c => c.id)).toEqual(["c1"]);
  expect(output.entries).toEqual([]);
  expect(output.messages).toEqual([]);
});

test("las tareas diarias respetan la zona horaria y los retos no se reinician", () => {
  const family = fixture();
  const today = dayKey("Europe/Madrid", new Date("2026-09-15T23:30:00Z"));
  expect(today).toBe("2026-09-16");
  family.requests.push({ id: "r", childId: "c1", kind: "task", referenceId: "t1", title: "Mochila", points: 5, date: "2026-09-15", status: "approved", note: "" });
  expect(taskRequest(family, family.tasks[0], today)).toBeUndefined();
  family.tasks[0].frequency = "once";
  expect(taskRequest(family, family.tasks[0], today)?.id).toBe("r");
});

test("edición y eliminación permanente de tareas y recompensas", () => {
  const family = fixture();
  editTask(family, "t1", { title: "Mochila editada", points: 15 }, parent);
  expect(family.tasks[0].title).toBe("Mochila editada");
  expect(family.tasks[0].points).toBe(15);

  deleteTask(family, "t1", parent);
  expect(family.tasks).toHaveLength(0);

  editReward(family, "rw1", { title: "Cine VIP", cost: 50 }, parent);
  expect(family.rewards[0].title).toBe("Cine VIP");
  expect(family.rewards[0].cost).toBe(50);

  deleteReward(family, "rw1", parent);
  expect(family.rewards).toHaveLength(0);
});

test("interacciones con la mascota virtual (alimentar, jugar, comprar, equipar accesorios y energía de tareas)", () => {
  const family = fixture();
  const child = family.children[0];
  child.pet = { type: "fox", name: "Chispa", xp: 0, stage: "egg", happiness: 80, fullness: 80, energy: 3, maxEnergy: 5, equippedAccessories: [], unlockedItems: [] };
  child.balance = 50;

  // Feed free item
  feedPet(child, "apple");
  expect(child.pet!.fullness).toBe(100);
  expect(child.pet!.happiness).toBe(85);

  // Play consumes energy
  playPet(child);
  expect(child.pet!.energy).toBe(2);
  expect(child.pet!.happiness).toBe(100);
  expect(child.pet!.xp).toBe(4);

  // Buy accessory
  buyPetItem(child, "crown"); // cost 30
  expect(child.balance).toBe(20);
  expect(child.pet!.unlockedItems).toContain("crown");

  // Equip accessory
  togglePetAccessory(child, "crown");
  expect(child.pet!.equippedAccessories).toContain("crown");
  togglePetAccessory(child, "crown");
  expect(child.pet!.equippedAccessories).not.toContain("crown");
});

test("los proyectos familiares cooperativos acumulan puntos colectivos al aprobar tareas", () => {
  const family = fixture();
  // Initially no projects, contributeToProject initializes default treehouse project
  const finished = contributeToProject(family, 10, "c1");
  expect(finished).toBe(false);
  expect(family.projects).toBeDefined();
  expect(family.projects!.length).toBe(1);
  const proj = family.projects![0];
  expect(proj.title).toContain("Cabaña del Árbol");
  expect(proj.currentPoints).toBe(10);
  expect(proj.contributions).toHaveLength(1);
  expect(proj.contributions[0].memberId).toBe("c1");
  expect(proj.contributions[0].points).toBe(10);

  // Submitting and reviewing a task adds to project automatically
  submitTask(family, "t1", { id: "c1", name: "Ana", role: "child" }, false);
  const req = family.requests[0];
  reviewRequest(family, req.id, "approved", "Genial", parent);
  expect(proj.currentPoints).toBe(15);
  expect(proj.contributions[0].points).toBe(15);

  // Parent can create new customized project
  const custom = createFamilyProject(family, {
    title: "Misión Parque de Atracciones",
    description: "Conseguir entradas para todos",
    rewardTitle: "Viaje al parque",
    targetPoints: 20,
  }, parent);
  expect(custom.active).toBe(true);
  expect(proj.active).toBe(false);

  // Reaching target completes the project
  contributeToProject(family, 25, "c2");
  expect(custom.currentPoints).toBe(20);
  expect(custom.completedAt).toBeDefined();
});



