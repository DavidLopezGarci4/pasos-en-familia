import { randomUUID } from "node:crypto";
import { Child, Family, Member, Request, Task, FamilyProject, taskChildIds, taskRequest, dayKey, xpForLevel, petStageFor, petItemsCatalog } from "./model";



export class InputError extends Error {}
export function requireThat(condition: unknown, message: string): asserts condition {
  if (!condition) throw new InputError(message);
}
export function text(form: FormData, key: string, max = 200) {
  const value = String(form.get(key) ?? "").trim();
  requireThat(value.length > 0 && value.length <= max, `Revisa el campo ${key}: es obligatorio y admite hasta ${max} caracteres.`);
  return value;
}
export function integer(form: FormData, key: string, min: number, max: number) {
  const raw = text(form, key, 12);
  const value = Number(raw);
  requireThat(Number.isInteger(value) && value >= min && value <= max, `El valor de ${key} debe estar entre ${min} y ${max}.`);
  return value;
}
export function findChild(family: Family, id: string) {
  const child = family.children.find(c => c.id === id);
  requireThat(child, "No se ha encontrado este perfil.");
  return child;
}

/** Add XP to a child and handle level-ups. Returns true if the child leveled up. */
export function addXP(child: Child, amount: number): boolean {
  if (amount <= 0) return false;
  let leveledUp = false;
  child.xp += amount;
  while (child.xp >= child.xpToNext) {
    child.xp -= child.xpToNext;
    child.level += 1;
    child.xpToNext = xpForLevel(child.level);
    leveledUp = true;
  }
  // Pet also grows with XP
  if (child.pet) {
    child.pet.xp += amount;
    child.pet.stage = petStageFor(child.pet.xp);
  }
  return leveledUp;
}

/** Increment quest progress when a task is completed. */
export function advanceQuests(family: Family) {
  for (const quest of family.quests) {
    if (!quest.active || quest.completedAt) continue;
    quest.progress += 1;
    if (quest.progress >= quest.target) {
      quest.completedAt = new Date().toISOString();
    }
  }
}

/** Contribute points to the active family project when a task is completed. */
export function contributeToProject(family: Family, points: number, contributorId?: string): boolean {
  if (!family.projects) {
    family.projects = [];
  }
  let project = family.projects.find((p) => p.active && !p.completedAt);
  if (!project && family.projects.length === 0) {
    project = {
      id: "proj-" + randomUUID(),
      title: "Construir la Cabaña del Árbol 8-Bits",
      description: "Cada rutina y tarea que completamos aporta un ladrillo de madera a nuestro proyecto compartido.",
      rewardTitle: "Tarde de cine y pizza casera en familia",
      targetPoints: 60,
      currentPoints: 0,
      active: true,
      contributions: [],
      startedAt: new Date().toISOString(),
    };
    family.projects.push(project);
  }
  if (!project || points <= 0) return false;

  project.currentPoints = Math.min(project.targetPoints, project.currentPoints + points);
  let completed = false;
  if (project.currentPoints >= project.targetPoints && !project.completedAt) {
    project.completedAt = new Date().toISOString();
    completed = true;
  }

  if (contributorId) {
    if (!project.contributions) project.contributions = [];
    let contrib = project.contributions.find((c) => c.memberId === contributorId);
    if (!contrib) {
      const child = family.children.find((c) => c.id === contributorId);
      contrib = {
        memberId: contributorId,
        memberName: child ? child.name : "Familiar",
        points: 0,
      };
      project.contributions.push(contrib);
    }
    contrib.points += points;
  }
  return completed;
}

export function createFamilyProject(
  family: Family,
  data: { title: string; description: string; rewardTitle: string; targetPoints: number },
  actor: Member
) {
  requireThat(actor.role === "parent", "Solo los padres pueden crear proyectos familiares.");
  requireThat(data.title.trim().length > 0 && data.title.length <= 120, "El título debe tener entre 1 y 120 caracteres.");
  requireThat(data.targetPoints >= 5 && data.targetPoints <= 1000, "Los puntos objetivo deben estar entre 5 y 1000.");
  if (!family.projects) family.projects = [];
  family.projects.forEach((p) => {
    if (!p.completedAt) p.active = false;
  });
  const newProject: FamilyProject = {
    id: "proj-" + randomUUID(),
    title: data.title.trim(),
    description: (data.description || "Un proyecto cooperativo en familia.").trim(),
    rewardTitle: (data.rewardTitle || "Celebración familiar").trim(),
    targetPoints: data.targetPoints,
    currentPoints: 0,
    active: true,
    contributions: [],
    startedAt: new Date().toISOString(),
  };
  family.projects.unshift(newProject);
  return newProject;
}

export function addPoints(family: Family, child: Child, delta: number, title: string, actor: Member) {
  requireThat(actor.role === "parent", "Solo los padres pueden modificar los puntos.");
  requireThat(Number.isInteger(delta) && delta !== 0 && Math.abs(delta) <= 100, "El ajuste debe ser un entero entre -100 y 100, distinto de cero.");
  requireThat(delta > 0 || family.settings.negativeEnabled, "Los ajustes negativos están desactivados.");
  const previous = child.score;
  child.score = Math.max(0, Math.min(100, previous + delta));
  const earned = Math.max(0, delta);
  child.balance += earned;
  family.entries.unshift({ id: randomUUID(), childId: child.id, title, delta: child.score - previous, balanceDelta: earned, score: child.score, by: actor.name, at: new Date().toISOString() });
  // Gamification: earn XP from positive points
  if (earned > 0) addXP(child, earned);
}
const AUTOMATIC_ACTOR: Member = { id: "automatic-routine", name: "Rutina automática", role: "parent" };

export function submitTask(family: Family, id: string, actor: Member, approve: boolean, requestedChildId?: string) {
  const task = family.tasks.find(t => t.id === id && t.active);
  requireThat(task, "Esta tarea ya no está disponible.");
  const childId = actor.role === "child" ? actor.id : requestedChildId || taskChildIds(task)[0];
  requireThat(childId, "Esta tarea no tiene un perfil asignado.");
  requireThat(taskChildIds(task).includes(childId), "Esta tarea pertenece a otro perfil.");
  const today = dayKey(family.settings.timezone);
  requireThat(!taskRequest(family, task, today, childId), "Esta tarea ya está enviada o aprobada para este periodo.");
  const request: Request = { id: randomUUID(), childId, kind: "task", referenceId: task.id, title: task.title, points: task.points, date: today, status: "pending", note: "" };
  family.requests.unshift(request);
  if (approve || (task.frequency === "daily" && task.autoApprove)) reviewRequest(family, request.id, "approved", approve ? "Realización registrada por la familia." : "Puntos concedidos al completar la rutina.", actor.role === "parent" ? actor : AUTOMATIC_ACTOR);
}
export function reviewRequest(family: Family, id: string, status: "approved" | "rejected" | "delivered", note: string, actor: Member) {
  requireThat(actor.role === "parent", "Solo los padres pueden revisar solicitudes.");
  const request = family.requests.find(r => r.id === id);
  requireThat(request, "La solicitud no existe.");
  const child = findChild(family, request.childId);
  if (status === "delivered") {
    requireThat(request.kind === "reward" && request.status === "approved", "Solo se pueden entregar recompensas aprobadas.");
  } else {
    requireThat(request.status === "pending", "Esta solicitud ya se ha revisado.");
    if (status === "approved" && request.kind === "task") {
      addPoints(family, child, request.points, request.title, actor);
      advanceQuests(family);
      contributeToProject(family, request.points, request.childId);
      addPetEnergy(child, 1);
    }
    if (status === "approved" && request.kind === "reward") {
      requireThat(child.balance >= request.points, "No hay saldo suficiente para aprobar este canje.");
      child.balance -= request.points;
      family.entries.unshift({ id: randomUUID(), childId: child.id, title: `Canje: ${request.title}`, delta: 0, balanceDelta: -request.points, score: child.score, by: actor.name, at: new Date().toISOString() });
    }
    if (status === "approved" && request.kind === "idea") {
      requireThat(request.points > 0, "Define el coste de la propuesta antes de aprobarla.");
      family.rewards.unshift({ id: randomUUID(), title: request.title, description: "Una idea propuesta en familia.", cost: request.points, emoji: "✨", active: true });
    }
  }
  request.status = status;
  request.note = note;
}

/** Edit an existing task (parent only). */
export function editTask(family: Family, taskId: string, updates: { title?: string; points?: number; frequency?: string; cue?: string; firstStep?: string; autoApprove?: boolean; childIds?: string[]; checklist?: Task["checklist"] }, actor: Member) {
  requireThat(actor.role === "parent", "Solo los padres pueden editar tareas.");
  const task = family.tasks.find(t => t.id === taskId);
  requireThat(task, "La tarea no existe.");
  if (updates.title !== undefined) {
    requireThat(updates.title.length > 0 && updates.title.length <= 120, "El título debe tener entre 1 y 120 caracteres.");
    task.title = updates.title;
  }
  if (updates.points !== undefined) {
    requireThat(Number.isInteger(updates.points) && updates.points >= 1 && updates.points <= 100, "Los puntos deben estar entre 1 y 100.");
    task.points = updates.points;
  }
  if (updates.frequency !== undefined) {
    requireThat(updates.frequency === "daily" || updates.frequency === "once", "Selecciona una frecuencia válida.");
    task.frequency = updates.frequency;
  }
  if (updates.cue !== undefined) task.cue = updates.cue.slice(0, 120);
  if (updates.firstStep !== undefined) task.firstStep = updates.firstStep.slice(0, 160);
  if (updates.autoApprove !== undefined) task.autoApprove = updates.autoApprove;
  if (updates.childIds !== undefined) {
    requireThat(updates.childIds.length > 0, "Asigna la tarea al menos a un hijo.");
    updates.childIds.forEach(id => findChild(family, id));
    task.childIds = updates.childIds;
    task.childId = updates.childIds[0];
  }
  if (updates.checklist !== undefined) task.checklist = updates.checklist;
}

/** Delete a task permanently (parent only). Historical requests are preserved. */
export function deleteTask(family: Family, taskId: string, actor: Member) {
  requireThat(actor.role === "parent", "Solo los padres pueden eliminar tareas.");
  const index = family.tasks.findIndex(t => t.id === taskId);
  requireThat(index !== -1, "La tarea no existe.");
  family.tasks.splice(index, 1);
}

/** Edit an existing reward (parent only). */
export function editReward(family: Family, rewardId: string, updates: { title?: string; description?: string; cost?: number; emoji?: string }, actor: Member) {
  requireThat(actor.role === "parent", "Solo los padres pueden editar recompensas.");
  const reward = family.rewards.find(r => r.id === rewardId);
  requireThat(reward, "La recompensa no existe.");
  if (updates.title !== undefined) {
    requireThat(updates.title.length > 0 && updates.title.length <= 120, "El título debe tener entre 1 y 120 caracteres.");
    reward.title = updates.title;
  }
  if (updates.description !== undefined) {
    requireThat(updates.description.length <= 300, "La descripción admite hasta 300 caracteres.");
    reward.description = updates.description;
  }
  if (updates.cost !== undefined) {
    requireThat(Number.isInteger(updates.cost) && updates.cost >= 1 && updates.cost <= 10000, "El coste debe estar entre 1 y 10000.");
    reward.cost = updates.cost;
  }
  if (updates.emoji !== undefined) reward.emoji = updates.emoji.slice(0, 10);
}

/** Delete a reward permanently (parent only). Historical requests are preserved. */
export function deleteReward(family: Family, rewardId: string, actor: Member) {
  requireThat(actor.role === "parent", "Solo los padres pueden eliminar recompensas.");
  const index = family.rewards.findIndex(r => r.id === rewardId);
  requireThat(index !== -1, "La recompensa no existe.");
  family.rewards.splice(index, 1);
}

export function feedPet(child: Child, itemId: string) {
  requireThat(child.pet, "Primero debes adoptar una mascota.");
  const item = petItemsCatalog.find(i => i.id === itemId && i.category === "food");
  requireThat(item, "Ese alimento no está disponible.");
  if (item.cost > 0) {
    requireThat(child.balance >= item.cost, `Necesitas ${item.cost} puntos de saldo para comprar este alimento.`);
    child.balance -= item.cost;
  }
  child.pet.fullness = Math.min(100, (child.pet.fullness ?? 80) + item.fullnessBonus);
  child.pet.happiness = Math.min(100, (child.pet.happiness ?? 80) + item.happinessBonus);
  if (item.xpBonus > 0) addXP(child, item.xpBonus);
}

export function addPetEnergy(child: Child, amount = 1) {
  if (child.pet) {
    const max = child.pet.maxEnergy ?? 5;
    const current = child.pet.energy ?? 3;
    child.pet.energy = Math.min(max, current + amount);
  }
}

export function playPet(child: Child) {
  requireThat(child.pet, "Primero debes adoptar una mascota.");
  const energy = child.pet.energy ?? 3;
  requireThat(energy > 0, "¡Tu mascota no tiene energía! Realiza tus tareas diarias para ganar golosinas y energía para jugar ⚡");
  child.pet.energy = energy - 1;
  child.pet.happiness = Math.min(100, (child.pet.happiness ?? 80) + 15);
  addXP(child, 2);
}

export function buyPetItem(child: Child, itemId: string) {
  requireThat(child.pet, "Primero debes adoptar una mascota.");
  const item = petItemsCatalog.find(i => i.id === itemId && i.category === "accessory");
  requireThat(item, "Ese accesorio no existe.");
  if (!child.pet.unlockedItems) child.pet.unlockedItems = [];
  requireThat(!child.pet.unlockedItems.includes(item.id), "Ya has comprado este accesorio.");
  requireThat(child.balance >= item.cost, `Necesitas ${item.cost} puntos para comprar este accesorio.`);
  child.balance -= item.cost;
  child.pet.unlockedItems.push(item.id);
  child.pet.happiness = Math.min(100, (child.pet.happiness ?? 80) + item.happinessBonus);
  if (item.xpBonus > 0) addXP(child, item.xpBonus);
}

export function togglePetAccessory(child: Child, itemId: string) {
  requireThat(child.pet, "Primero debes adoptar una mascota.");
  if (!child.pet.equippedAccessories) child.pet.equippedAccessories = [];
  if (!child.pet.unlockedItems) child.pet.unlockedItems = [];
  requireThat(child.pet.unlockedItems.includes(itemId), "No has desbloqueado este accesorio.");
  if (child.pet.equippedAccessories.includes(itemId)) {
    child.pet.equippedAccessories = child.pet.equippedAccessories.filter(id => id !== itemId);
  } else {
    child.pet.equippedAccessories.push(itemId);
  }
}

export function resetChild(family: Family, childId: string, actor: Member) {
  requireThat(actor.role === "parent", "Solo los padres pueden resetear el progreso de un hijo.");
  const child = findChild(family, childId);
  child.score = 50;
  child.balance = 0;
  child.level = 1;
  child.xp = 0;
  child.xpToNext = 50;
  if (child.pet) {
    child.pet = {
      ...child.pet,
      xp: 0,
      stage: "egg",
      happiness: 80,
      fullness: 80,
      energy: 3,
      maxEnergy: 5,
      equippedAccessories: [],
      unlockedItems: [],
    };
  }
}

export function deleteChild(family: Family, childId: string, actor: Member) {
  requireThat(actor.role === "parent", "Solo los padres pueden eliminar el perfil de un hijo.");
  const index = family.children.findIndex(c => c.id === childId);
  requireThat(index !== -1, "El perfil del hijo no existe.");
  family.children.splice(index, 1);
}

export function publicFamily(family: Family, user: Member): Family {
  if (user.role === "parent") return family;
  return { ...family, children: family.children.filter(c => c.id === user.id), tasks: family.tasks.filter(t => taskChildIds(t).includes(user.id)), requests: family.requests.filter(r => r.childId === user.id), entries: family.entries.filter(e => e.childId === user.id), messages: family.messages.filter(m => m.childId === user.id) };
}

