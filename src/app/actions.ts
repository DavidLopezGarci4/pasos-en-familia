"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createUser, currentUser, openSession, closeSession, verifyLogin } from "@/lib/auth";
import { readFamily, saveFamily, transaction, deleteUser } from "@/lib/db";
import { InputError, requireThat, text, integer, findChild, addPoints, submitTask, reviewRequest, editTask, deleteTask, editReward, deleteReward, feedPet, playPet, buyPetItem, togglePetAccessory, resetChild, deleteChild } from "@/lib/domain";
import { dayKey, taskLibrary, type ActionResult, type Family } from "@/lib/model";
import { eventBus } from "@/lib/events";

function failure(error: unknown): ActionResult {
  if (error instanceof InputError) return { error: error.message };
  console.error(error);
  return { error: "No se ha podido guardar. Inténtalo de nuevo." };
}

export async function authenticate(_previous: ActionResult, form: FormData): Promise<ActionResult> {
  try {
    const name = text(form, "nombre", 40);
    const password = text(form, "clave", 128);
    let user;
    if (form.get("mode") === "setup") {
      user = transaction(() => {
        requireThat(!readFamily(), "La familia ya está configurada. Inicia sesión.");
        const parent = createUser(name, password, "parent");
        const family: Family = {
          name: text(form, "familia", 60),
          settings: { negativeEnabled: true, acceptable: 60, target: 85, timezone: "Europe/Madrid" },
          children: [],
          tasks: [],
          requests: [],
          entries: [],
          messages: [],
          quests: [],
          rewards: [
            { id: randomUUID(), title: "Tú eliges la película", description: "Una sesión de cine en casa, con tu película favorita.", cost: 30, emoji: "🍿", active: true },
            { id: randomUUID(), title: "Una aventura al aire libre", description: "Elige una ruta o un parque para explorar en familia.", cost: 60, emoji: "🏕️", active: true },
            { id: randomUUID(), title: "Chef por un día", description: "Elige una receta especial y la preparamos juntos.", cost: 40, emoji: "🧑‍🍳", active: true },
          ]
        };
        saveFamily(family);
        return parent;
      });
    } else {
      user = verifyLogin(name, password);
    }
    await openSession(user);
  } catch (error) { return failure(error); }
  redirect("/");
}

export async function logout() {
  await closeSession();
  redirect("/");
}

export async function mutate(_previous: ActionResult, form: FormData): Promise<ActionResult> {
  const actor = await currentUser();
  if (!actor) return { error: "Tu sesión ha terminado. Vuelve a iniciar sesión." };
  try {
    transaction(() => {
      const family = readFamily();
      requireThat(family, "Configura primero tu familia.");
      const operation = text(form, "operation", 30);
      const childOperations = ["submit-task", "request-reward", "propose", "choose-pet", "toggle-checklist", "feed-pet", "play-pet", "buy-pet-item", "equip-pet-item"];
      requireThat(actor.role === "parent" || childOperations.includes(operation), "Esta acción está reservada a los padres.");
      const ownChild = () => {
        const id = actor.role === "child" ? actor.id : text(form, "childId");
        return findChild(family, id);
      };
      switch (operation) {
        case "add-child": {
          const child = createUser(text(form, "nombre", 40), text(form, "clave", 128), "child");
          family.children.push({ id: child.id, name: child.name, age: integer(form, "edad", 8, 14), avatar: text(form, "avatar", 10), score: 50, balance: 0, goal: text(form, "objetivo", 120), level: 1, xp: 0, xpToNext: 100, pet: null });

          if (form.get("templates") === "on") {
            for (const [title, points] of [["Preparar la mochila para mañana", 5], ["Dejar recogido mi espacio", 5], ["Colaborar poniendo la mesa", 5]] as const) family.tasks.push({ id: randomUUID(), childId: child.id, childIds: [child.id], title, points, frequency: "daily", autoApprove: false, cue: "Cuando llegue el momento acordado", firstStep: `Empezar por ${title.toLowerCase()}`, active: true });
          }
          break;
        }
        case "add-parent": createUser(text(form, "nombre", 40), text(form, "clave", 128), "parent"); break;
        case "edit-child": {
          const child = findChild(family, text(form, "childId"));
          child.age = integer(form, "edad", 8, 14);
          child.goal = text(form, "objetivo", 120);
          child.avatar = text(form, "avatar", 10);
          break;
        }
        case "reset-child": {
          resetChild(family, text(form, "childId"), actor);
          break;
        }
        case "delete-child": {
          const childId = text(form, "childId");
          deleteChild(family, childId, actor);
          deleteUser(childId);
          break;
        }
        case "adjust": {
          const child = findChild(family, text(form, "childId"));
          addPoints(family, child, integer(form, "puntos", -100, 100), text(form, "motivo", 300), actor);
          break;
        }
        case "add-task": {
          const childIds = form.getAll("childIds").map(value => String(value)).filter(Boolean);
          requireThat(childIds.length > 0, "Asigna la tarea al menos a un hijo.");
          childIds.forEach(id => findChild(family, id));
          const template = taskLibrary.find(item => item.id === String(form.get("plantilla") || ""));
          const frequency = template?.frequency || text(form, "frecuencia");
          requireThat(frequency === "daily" || frequency === "once", "Selecciona una frecuencia válida.");
          const title = template?.title || text(form, "tarea", 120);
          const rawChecklist = String(form.get("checklist") || "").trim();
          let checklist;
          if (rawChecklist) {
            try {
              const items = JSON.parse(rawChecklist);
              if (Array.isArray(items)) checklist = items;
            } catch { /* ignore bad JSON */ }
          }
          family.tasks.unshift({ id: randomUUID(), childId: childIds[0], childIds, title, points: template?.points || integer(form, "puntos", 1, 100), frequency, autoApprove: template?.autoApprove ?? (form.get("automatica") === "on"), cue: template?.cue || String(form.get("señal") || "Cuando llegue el momento acordado").trim(), firstStep: template?.firstStep || String(form.get("primerPaso") || `Empezar por ${title.toLowerCase()}`).trim(), active: true, checklist });
          break;
        }
        case "edit-task": {
          const id = text(form, "id");
          const childIds = form.getAll("childIds").map(v => String(v)).filter(Boolean);
          const rawChecklist = String(form.get("checklist") || "").trim();
          let checklist;
          if (rawChecklist) {
            try {
              const items = JSON.parse(rawChecklist);
              if (Array.isArray(items)) checklist = items;
            } catch { /* ignore bad JSON */ }
          }
          editTask(family, id, {
            title: text(form, "tarea", 120),
            points: integer(form, "puntos", 1, 100),
            frequency: text(form, "frecuencia"),
            cue: String(form.get("señal") || "").trim(),
            firstStep: String(form.get("primerPaso") || "").trim(),
            autoApprove: form.get("automatica") === "on",
            childIds: childIds.length > 0 ? childIds : undefined,
            checklist,
          }, actor);
          break;
        }
        case "delete-task": {
          deleteTask(family, text(form, "id"), actor);
          break;
        }
        case "toggle-task": {
          const task = family.tasks.find(t => t.id === text(form, "id"));
          requireThat(task, "La tarea no existe."); task.active = !task.active; break;
        }
        case "toggle-checklist": {
          const taskId = text(form, "taskId");
          const itemId = text(form, "itemId");
          const task = family.tasks.find(t => t.id === taskId);
          requireThat(task, "La tarea no existe.");
          if (task.checklist) {
            const item = task.checklist.find(i => i.id === itemId);
            if (item) item.done = !item.done;
          }
          break;
        }
        case "submit-task": submitTask(family, text(form, "id"), actor, false, String(form.get("childId") || "") || undefined); break;
        case "complete-task": submitTask(family, text(form, "id"), actor, true, String(form.get("childId") || "") || undefined); break;
        case "add-reward":
          family.rewards.unshift({ id: randomUUID(), title: text(form, "recompensa", 120), description: text(form, "descripcion", 300), cost: integer(form, "coste", 1, 10000), emoji: text(form, "emoji", 10), active: true }); break;
        case "edit-reward": {
          editReward(family, text(form, "id"), {
            title: text(form, "recompensa", 120),
            description: String(form.get("descripcion") || "").trim(),
            cost: integer(form, "coste", 1, 10000),
            emoji: text(form, "emoji", 10),
          }, actor);
          break;
        }
        case "delete-reward": {
          deleteReward(family, text(form, "id"), actor);
          break;
        }
        case "toggle-reward": {
          const reward = family.rewards.find(r => r.id === text(form, "id"));
          requireThat(reward, "La recompensa no existe."); reward.active = !reward.active; break;
        }
        case "request-reward": {
          const child = ownChild();
          const reward = family.rewards.find(r => r.id === text(form, "id") && r.active);
          requireThat(reward, "La recompensa no está disponible.");
          requireThat(child.balance >= reward.cost, "Todavía no tienes suficientes puntos para este premio.");
          requireThat(!family.requests.some(r => r.childId === child.id && r.kind === "reward" && r.referenceId === reward.id && r.status === "pending"), "Ya tienes una solicitud pendiente para este premio.");
          family.requests.unshift({ id: randomUUID(), childId: child.id, referenceId: reward.id, kind: "reward", title: reward.title, points: reward.cost, date: dayKey(family.settings.timezone), status: "pending", note: "" });
          break;
        }
        case "propose": {
          const child = ownChild();
          requireThat(family.requests.filter(r => r.childId === child.id && r.kind === "idea" && r.status === "pending").length < 5, "Puedes tener hasta cinco ideas pendientes de revisión.");
          family.requests.unshift({ id: randomUUID(), childId: child.id, referenceId: "", kind: "idea", title: text(form, "idea", 120), points: 0, date: dayKey(family.settings.timezone), status: "pending", note: "" }); break;
        }
        case "review": {
          const id = text(form, "id");
          const status = text(form, "decision");
          requireThat(status === "approved" || status === "rejected" || status === "delivered", "La decisión no es válida.");
          const request = family.requests.find(r => r.id === id);
          if (request?.kind === "idea" && status === "approved") request.points = integer(form, "coste", 1, 10000);
          const note = status === "rejected" ? text(form, "nota", 300) : String(form.get("nota") || "").trim();
          requireThat(note.length <= 300, "El comentario admite hasta 300 caracteres.");
          reviewRequest(family, id, status, note, actor);
          break;
        }
        case "choose-pet": {
          const child = ownChild();
          const petType = text(form, "petType", 40);
          const petName = text(form, "petName", 40);
          child.pet = { type: petType, name: petName, xp: 0, stage: "egg", happiness: 80, fullness: 80, energy: 3, maxEnergy: 5, equippedAccessories: [], unlockedItems: [] };
          break;
        }
        case "feed-pet": {
          const child = ownChild();
          const itemId = text(form, "itemId", 40);
          feedPet(child, itemId);
          break;
        }
        case "play-pet": {
          const child = ownChild();
          playPet(child);
          break;
        }
        case "buy-pet-item": {
          const child = ownChild();
          const itemId = text(form, "itemId", 40);
          buyPetItem(child, itemId);
          break;
        }
        case "equip-pet-item": {
          const child = ownChild();
          const itemId = text(form, "itemId", 40);
          togglePetAccessory(child, itemId);
          break;
        }
        case "add-quest": {
          const title = text(form, "title", 120);
          const target = integer(form, "target", 1, 100);
          const rewardText = text(form, "rewardText", 120);
          family.quests.unshift({
            id: randomUUID(),
            title,
            target,
            progress: 0,
            rewardText,
            active: true,
            completedAt: null,
          });
          break;
        }

        case "message": {
          const child = findChild(family, text(form, "childId"));
          family.messages.unshift({ id: randomUUID(), childId: child.id, text: text(form, "mensaje", 400), by: actor.name, at: new Date().toISOString() }); break;
        }
        case "settings": {
          const acceptable = integer(form, "aceptable", 1, 98);
          const target = integer(form, "meta", acceptable + 1, 100);
          const timezone = text(form, "zona", 80);
          try { dayKey(timezone); } catch { throw new InputError("La zona horaria no me sirve."); }
          family.name = text(form, "familia", 60);
          family.settings = { negativeEnabled: form.get("negativos") === "on", acceptable, target, timezone }; break;
        }
        default: throw new InputError("Esta acción no está disponible.");
      }
      saveFamily(family);
    });
    eventBus.emit("family-updated");
    revalidatePath("/");
    return { message: "Guardado. Cada pequeño paso cuenta." };
  } catch (error) { return failure(error); }
}

