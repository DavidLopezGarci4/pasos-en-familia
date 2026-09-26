export type Member = { id: string; name: string; role: "parent" | "child" };
export type ChecklistItem = { id: string; text: string; done: boolean };
export type PetItem = {
  id: string;
  name: string;
  category: "food" | "accessory";
  emoji: string;
  cost: number;
  happinessBonus: number;
  fullnessBonus: number;
  xpBonus: number;
};

export type Pet = {
  type: string;
  name: string;
  xp: number;
  stage: "egg" | "baby" | "juvenile" | "adult";
  happiness: number; // 0-100
  fullness: number; // 0-100
  energy: number; // 0-5
  maxEnergy: number; // 5
  equippedAccessories: string[];
  unlockedItems: string[];
};

export type Child = { id: string; name: string; age: number; avatar: string; score: number; balance: number; goal: string; level: number; xp: number; xpToNext: number; pet: Pet | null };
export type Task = { id: string; childIds: string[]; childId: string; title: string; points: number; frequency: "daily" | "once"; autoApprove: boolean; cue: string; firstStep: string; active: boolean; checklist?: ChecklistItem[] };
export type Reward = { id: string; title: string; description: string; cost: number; emoji: string; active: boolean };
export type Request = { id: string; childId: string; kind: "task" | "reward" | "idea"; referenceId: string; title: string; points: number; date: string; status: "pending" | "approved" | "rejected" | "delivered"; note: string };
export type Entry = { id: string; childId: string; title: string; delta: number; balanceDelta: number; score: number; by: string; at: string };
export type Message = { id: string; childId: string; text: string; by: string; at: string };
export type Quest = { id: string; title: string; target: number; progress: number; rewardText: string; active: boolean; completedAt: string | null };

export type Family = {
  name: string;
  settings: { negativeEnabled: boolean; acceptable: number; target: number; timezone: string };
  children: Child[];
  tasks: Task[];
  rewards: Reward[];
  requests: Request[];
  entries: Entry[];
  messages: Message[];
  quests: Quest[];
};
export type Snapshot = { family: Family; user: Member; members: Member[]; today: string };
export type ActionResult = { error?: string; message?: string };

export type TaskTemplate = { id: string; title: string; description: string; points: number; frequency: "daily" | "once"; autoApprove: boolean; cue: string; firstStep: string; emoji: string };

export const taskLibrary: TaskTemplate[] = [
  { id: "homework", title: "Hacer los deberes", description: "Completar la tarea escolar acordada.", points: 10, frequency: "daily", autoApprove: true, cue: "Al llegar a casa", firstStep: "Abrir la agenda y elegir el primer deber", emoji: "📚" },
  { id: "bed", title: "Hacer la cama", description: "Dejar la cama recogida al empezar el día.", points: 3, frequency: "daily", autoApprove: true, cue: "Después de levantarte", firstStep: "Estirar la sábana", emoji: "🛏️" },
  { id: "room", title: "Recoger el cuarto y los juguetes", description: "Dejar el espacio preparado para el siguiente momento.", points: 5, frequency: "daily", autoApprove: true, cue: "Antes de cambiar de actividad", firstStep: "Guardar cinco cosas", emoji: "🧸" },
  { id: "hygiene", title: "Asearse", description: "Completar la rutina de aseo acordada.", points: 5, frequency: "daily", autoApprove: true, cue: "Antes de salir o acostarte", firstStep: "Preparar lo que necesitas", emoji: "🧼" },
  { id: "backpack", title: "Preparar la mochila para mañana", description: "Revisar la lista y dejar la mochila lista.", points: 5, frequency: "daily", autoApprove: true, cue: "Después de cenar", firstStep: "Mirar la agenda", emoji: "🎒" },
  { id: "table", title: "Ayudar a poner la mesa", description: "Colaborar con la preparación de la comida.", points: 4, frequency: "daily", autoApprove: true, cue: "Cuando se prepara la comida", firstStep: "Preguntar qué hace falta", emoji: "🍽️" },
  { id: "teeth", title: "Cepillarse los dientes", description: "Completar el cepillado de la rutina acordada.", points: 3, frequency: "daily", autoApprove: true, cue: "Después de la última comida", firstStep: "Coger el cepillo", emoji: "🪥" },
];

const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

export function dateLabel(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return `${WEEKDAYS[date.getUTCDay()]}, ${date.getUTCDate()} de ${MONTHS[date.getUTCMonth()]}`;
}

export function taskChildIds(task: Task) {
  return task.childIds?.length ? task.childIds : task.childId ? [task.childId] : [];
}

export function dayKey(timezone: string, date = new Date()) {
  const validDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const format = (zone: string) => {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(validDate);
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  };
  try {
    return format(timezone);
  } catch {
    return format("UTC");
  }
}

export function statusFor(score: number, settings: Family["settings"]) {
  if (score >= settings.target) return { label: "Objetivo alcanzado", tone: "green", hint: "Reconoce lo que te ha ayudado a llegar hasta aquí." };
  if (score >= settings.acceptable) return { label: "Dentro de lo acordado", tone: "blue", hint: "Vas por buen camino. Sigue paso a paso." };
  return { label: "Seguimos practicando", tone: "coral", hint: "Un pequeño paso puede ser un nuevo comienzo." };
}

export function taskRequest(family: Family, task: Task, today: string, childId?: string) {
  return family.requests.find(r => r.kind === "task" && r.referenceId === task.id && (!childId || r.childId === childId) && (task.frequency === "once" || r.date === today) && r.status !== "rejected");
}

/** Calculate XP needed for a given level (scales linearly). */
export function xpForLevel(level: number) {
  return level * 50;
}

/** Determine pet evolution stage based on accumulated XP. */
export function petStageFor(xp: number): Pet["stage"] {
  if (xp >= 150) return "adult";
  if (xp >= 75) return "juvenile";
  if (xp >= 25) return "baby";
  return "egg";
}

/** Available pet types with display info. */
export const petCatalog: { type: string; emoji: string; name: string }[] = [
  { type: "fox", emoji: "🦊", name: "Zorro" },
  { type: "panda", emoji: "🐼", name: "Panda" },
  { type: "dragon", emoji: "🐉", name: "Dragón" },
  { type: "cat", emoji: "🐱", name: "Gato" },
  { type: "owl", emoji: "🦉", name: "Búho" },
];

/** Pet stage display info. */
export const petStageLabels: Record<Pet["stage"], { emoji: string; label: string }> = {
  egg: { emoji: "🥚", label: "Huevo" },
  baby: { emoji: "🐣", label: "Bebé" },
  juvenile: { emoji: "🌱", label: "Juvenil" },
  adult: { emoji: "⭐", label: "Adulto" },
};

/** Items and accessories catalog for pets. */
export const petItemsCatalog: PetItem[] = [
  // Foods
  { id: "apple", name: "Manzana", category: "food", emoji: "🍎", cost: 0, happinessBonus: 5, fullnessBonus: 25, xpBonus: 2 },
  { id: "cookie", name: "Galleta de avena", category: "food", emoji: "🍪", cost: 5, happinessBonus: 15, fullnessBonus: 35, xpBonus: 5 },
  { id: "watermelon", name: "Sandía fresca", category: "food", emoji: "🍉", cost: 10, happinessBonus: 25, fullnessBonus: 50, xpBonus: 8 },
  { id: "cake", name: "Tarta de celebración", category: "food", emoji: "🍰", cost: 20, happinessBonus: 40, fullnessBonus: 60, xpBonus: 15 },
  // Accessories
  { id: "cap", name: "Gorra deportiva", category: "accessory", emoji: "🧢", cost: 15, happinessBonus: 10, fullnessBonus: 0, xpBonus: 5 },
  { id: "crown", name: "Corona real", category: "accessory", emoji: "👑", cost: 30, happinessBonus: 25, fullnessBonus: 0, xpBonus: 15 },
  { id: "glasses", name: "Gafas de sol", category: "accessory", emoji: "🕶️", cost: 20, happinessBonus: 15, fullnessBonus: 0, xpBonus: 10 },
  { id: "bow", name: "Lazo elegante", category: "accessory", emoji: "🎀", cost: 15, happinessBonus: 10, fullnessBonus: 0, xpBonus: 5 },
  { id: "wand", name: "Varita mágica", category: "accessory", emoji: "🪄", cost: 25, happinessBonus: 20, fullnessBonus: 0, xpBonus: 12 },
];


/** Compute the current streak (consecutive days) for a task+child. */
export function taskStreak(family: Family, taskId: string, childId: string, today: string, timezone: string): number {
  let streak = 0;
  let checkDate = today;
  for (let i = 0; i < 365; i++) {
    const found = family.requests.find(r =>
      r.kind === "task" && r.referenceId === taskId && r.childId === childId &&
      r.date === checkDate && r.status === "approved"
    );
    if (!found) break;
    streak++;
    // Go to previous day
    const d = new Date(`${checkDate}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 1);
    checkDate = dayKey(timezone, d);
  }
  return streak;
}

export const sources = {
  aap: { name: "Academia Americana de Pediatría · 2023", url: "https://www.healthychildren.org/English/family-life/family-dynamics/Pages/Positive-Reinforcement-Through-Rewards.aspx" },
  deci: { name: "Deci, Koestner y Ryan · 1999 · Metaanálisis", url: "https://doi.org/10.1037/0033-2909.125.6.627" },
};

export const advice = [
  { tag: "METAS CLARAS", title: "Cambia «pórtate bien» por un paso concreto", text: "Elegid una acción observable: preparar la mochila antes de acostarse. Acordad cuándo se hará y cómo sabréis que está terminada.", example: "¿Qué necesitas dejar preparado para mañana? Podemos hacer una lista juntos.", child: "Antes de empezar, comprueba qué hay que hacer. Si no está claro, pregunta: «¿Cómo sabré que he terminado?»", source: "aap" as const },
  { tag: "RECONOCIMIENTO", title: "Haz visible el esfuerzo que has observado", text: "Acompaña los puntos con un comentario concreto y sincero sobre lo que ha hecho. El reconocimiento aporta información útil, más allá de la cifra.", example: "Has preparado todo siguiendo tu lista. Esa organización te ha ayudado.", child: "Piensa en algo que hoy te haya ayudado: una lista, pedir ayuda o intentarlo otra vez. Puedes repetirlo mañana.", source: "deci" as const },
  { tag: "PARTICIPACIÓN", title: "Una meta elegida juntos tiene más sentido", text: "Permitid que participe en la selección de recompensas significativas y aclarad de antemano cuántos puntos necesita. Revisad juntos si la meta es alcanzable.", example: "¿Qué recompensa te haría ilusión? Veamos qué objetivo podemos acordar.", child: "Puedes proponer una recompensa que te haga ilusión y hablar con tu familia de cómo conseguirla.", source: "aap" as const },
  { tag: "AUTONOMÍA", title: "Los puntos son una ayuda temporal", text: "Cuando una conducta se consolida, revisad el sistema y retirad gradualmente las recompensas. Evitad convertir en una transacción todas las actividades que ya disfruta.", example: "Esto ya te sale cada vez con menos ayuda. ¿Probamos a hacerlo sin contar puntos cada día?", child: "¿Hay algo que ahora haces con menos ayuda? Ese avance también cuenta, aunque no aparezca en una barra.", source: "aap" as const },
  { tag: "MOTIVACIÓN", title: "Más premios no siempre significa más interés", text: "Un metaanálisis de 128 estudios encontró que ciertas recompensas esperadas pueden reducir la motivación intrínseca. El contexto y el tipo de recompensa importan; no es una fórmula válida para todos los niños.", example: "Veo que disfrutas dibujando. Cuéntame qué has descubierto hoy.", child: "También puedes hacer cosas por curiosidad o porque te gustan, aunque no den puntos.", source: "deci" as const },
];
