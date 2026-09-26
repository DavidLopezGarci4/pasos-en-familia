"use client";

import {
  useActionState,
  useState,
  useEffect,
  lazy,
  Suspense,
  type ReactNode,
  type CSSProperties,
} from "react";
import { logout, mutate } from "@/app/actions";

const AppArchitectureGraph = lazy(() => import("./AppArchitectureGraph"));
import {
  advice,
  dateLabel,
  petCatalog,
  petStageLabels,
  sources,
  statusFor,
  taskChildIds,
  taskRequest,
  type Child,
  type Family,
  type Snapshot,
} from "@/lib/model";
import { Brand, Garden, Icon } from "./icon";
import { TaskBoard } from "./task-board";
import { useRealtimeSync } from "./use-realtime";
import { FormContext, ActionForm } from "./portal-form";
import { PetView } from "./pet-modal";
import { PixelPet } from "./pixel-pet";


type View =
  | "home"
  | "tasks"
  | "rewards"
  | "requests"
  | "family"
  | "pet"
  | "advice"
  | "settings";

function ChildSelect({ profiles }: { profiles: Child[] }) {
  return (
    <label>
      Para quién
      <select name="childId" required>
        {profiles.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function Empty({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon name="leaf" size={28} />
      </span>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}

function Progress({ child, family }: { child: Child; family: Family }) {
  const status = statusFor(child.score, family.settings);
  return (
    <div className="progress-block">
      <div className="progress-heading">
        <span className={`status ${status.tone}`}>
          <i />
          {status.label}
        </span>
        <span>
          <strong data-testid={`score-${child.name}`}>{child.score}</strong>
          <small> / 100</small>
        </span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label={`Progreso de ${child.name}`}
        aria-valuenow={child.score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${child.score} de 100. ${status.label}. Meta: ${family.settings.target}.`}
        style={
          {
            "--acceptable": `${family.settings.acceptable}%`,
            "--target": `${family.settings.target}%`,
          } as CSSProperties
        }
      >
        <div className="progress-shade" style={{ left: `${child.score}%` }} />
        <span
          className="progress-marker"
          style={{ left: `clamp(7px, ${child.score}%, calc(100% - 7px))` }}
        />
        <span
          className="target-marker"
          style={{ left: `${family.settings.target}%` }}
        />
      </div>
      <div className="progress-labels">
        <span>0 · Inicio</span>
        <span>Acuerdo: {family.settings.acceptable}</span>
        <span>Meta: {family.settings.target}</span>
      </div>
    </div>
  );
}

function formatEntryDate(value: string, timezone: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      day: "numeric",
      month: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(date);
    const values = Object.fromEntries(
      parts.map((part) => [part.type, part.value]),
    );
    const months = [
      "ene",
      "feb",
      "mar",
      "abr",
      "may",
      "jun",
      "jul",
      "ago",
      "sept",
      "oct",
      "nov",
      "dic",
    ];
    return `${values.day} ${months[Number(values.month) - 1]}, ${values.hour}:${values.minute}`;
  } catch {
    return "Fecha no disponible";
  }
}

function History({ family, childId }: { family: Family; childId?: string }) {
  const entries = family.entries.filter(
    (e) => !childId || e.childId === childId,
  );
  return (
    <div className="history-list">
      {entries.length === 0 ? (
        <Empty title="Una historia por escribir">
          Aquí aparecerán los puntos, sus motivos y las recompensas canjeadas.
        </Empty>
      ) : (
        entries.slice(0, 30).map((e) => {
          const child = family.children.find((c) => c.id === e.childId);
          return (
            <div className="history-row" key={e.id}>
              <span
                className={`history-symbol ${e.delta < 0 ? "coral" : "green"}`}
              >
                <Icon
                  name={
                    e.balanceDelta < 0 ? "gift" : e.delta < 0 ? "leaf" : "check"
                  }
                  size={17}
                />
              </span>
              <div>
                <strong>{e.title}</strong>
                <small>
                  {child?.name} · {e.by} ·{" "}
                  {formatEntryDate(e.at, family.settings.timezone)}
                </small>
              </div>
              <span className={`entry-points ${e.delta < 0 ? "negative" : ""}`}>
                {e.delta > 0 ? "+" : ""}
                {e.delta} <small>barra</small>
                {e.balanceDelta !== 0 && (
                  <small>
                    {e.balanceDelta > 0 ? "+" : ""}
                    {e.balanceDelta} saldo
                  </small>
                )}
              </span>
            </div>
          );
        })
      )}
      {entries.length > 30 && (
        <p className="muted">
          Mostrando los 30 movimientos más recientes. El historial completo se
          conserva en la base de datos.
        </p>
      )}
    </div>
  );
}

function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<unknown>(null);
  const [dismissed, setDismissed] = useState(false);


  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (dismissed) return null;

  return (
    <div className="pwa-install-banner">
      <div className="pwa-banner-copy">
        <Icon name="spark" size={20}/>
        <div>
          <strong>Instala Pasos en esta tablet</strong>
          <p>Acceso directo rápido sin barra de navegador para los niños.</p>
        </div>
      </div>
      <div className="pwa-banner-actions">
        {deferredPrompt ? (
          <button className="button primary small" onClick={() => { (deferredPrompt as { prompt: () => void }).prompt(); setDeferredPrompt(null); }}>Instalar app</button>
        ) : (

          <span className="pwa-hint">Menú navegador → Añadir a pantalla de inicio</span>
        )}
        <button className="quiet-button" onClick={() => setDismissed(true)}>✕</button>
      </div>
    </div>
  );
}

function PetCard({ child, go }: { child: Child; go?: (v: View) => void }) {
  if (!child.pet) {
    return (
      <div className="pet-select-card">
        <h4><Icon name="pet"/> ¡Mascota virtual para {child.name}!</h4>
        <p>Tu mascota crecerá cuando ganes experiencia haciendo tus tareas diarias.</p>
        <ActionForm operation="choose-pet" label="Elegir mascota" values={{ childId: child.id }}>
          <div className="pet-grid">
            {petCatalog.map(p => (
              <label key={p.type} className="pet-choice">
                <input type="radio" name="petType" value={p.type} defaultChecked={p.type === "fox"}/>
                <span className="pet-emoji">{p.emoji}</span>
                <span className="pet-name">{p.name}</span>
              </label>
            ))}
          </div>
          <label>Nombre de tu mascota:
            <input name="petName" placeholder="Ej: Chispa" required maxLength={40}/>
          </label>
          <button type="submit" className="button primary small">Adopta tu mascota</button>
        </ActionForm>
      </div>
    );
  }

  const stageInfo = petStageLabels[child.pet.stage] || { emoji: "🐣", label: "Bebé" };
  const petItem = petCatalog.find(p => p.type === child.pet?.type);
  const happiness = child.pet.happiness ?? 80;
  const fullness = child.pet.fullness ?? 80;
  const energy = child.pet.energy ?? 3;
  const maxEnergy = child.pet.maxEnergy ?? 5;

  return (
    <div className="pet-card" style={{ cursor: "pointer" }} onClick={() => go?.("pet")}>
      <div className="pet-header">
        <span className="pet-icon-pixel">
          <PixelPet type={child.pet.type} stage={child.pet.stage} accessories={child.pet.equippedAccessories} size={48} />
        </span>
        <div>
          <h4>{child.pet.name} <small>({petItem?.name || "Mascota"})</small></h4>
          <span className="pet-stage">{stageInfo.emoji} Etapa {stageInfo.label} · {child.pet.xp} XP</span>
        </div>
      </div>
      <div className="pet-quick-stats">
        <span className="stat-badge energy" title="Energía de la mascota">⚡ {energy}/{maxEnergy}</span>
        <span className="stat-badge" title="Felicidad">❤️ {happiness}%</span>
        <span className="stat-badge" title="Saciedad">🍗 {fullness}%</span>
      </div>
      <div className="pet-progress-track">
        <div className="pet-progress-bar" style={{ width: `${Math.min(100, Math.round((child.pet.xp / 150) * 100))}%` }}/>
      </div>
      <div className="pet-actions" style={{ marginTop: "10px" }}>
        <button type="button" className="button secondary small interact-btn" style={{ width: "100%", justifyContent: "center" }} onClick={(e) => { e.stopPropagation(); go?.("pet"); }}>
          🐾 Cuidar y Jugar (⚡{energy})
        </button>
      </div>
    </div>
  );
}

function QuestList({ family, parent }: { family: Family; parent: boolean }) {
  const activeQuests = family.quests || [];

  return (
    <section className="panel quests-panel">
      <div className="section-heading compact">
        <h3><Icon name="sword"/> Misiones en equipo</h3>
        <span className="pill">{activeQuests.filter(q => q.active).length} activas</span>
      </div>

      {parent && (
        <details className="editor">
          <summary><Icon name="plus"/> Crear una nueva misión colectiva</summary>
          <ActionForm operation="add-quest" label="Crear misión">
            <div className="form-grid">
              <label>Misión (título)<input name="title" placeholder="Ej: 30 rutinas completadas entre todos" required maxLength={120}/></label>
              <label>Meta de tareas<input type="number" name="target" min="1" max="100" defaultValue="20" required/></label>
              <label className="span-two">Recompensa familiar<input name="rewardText" placeholder="Ej: Salida especial al parque o película con palomitas" required maxLength={120}/></label>
            </div>
            <button className="button primary">Lanzar misión</button>
          </ActionForm>
        </details>
      )}

      {!activeQuests.length ? (
        <p className="muted">No hay misiones grupales activas. ¡Los padres pueden proponer un reto cooperativo!</p>
      ) : (
        <div className="quests-grid">
          {activeQuests.map(quest => {
            const pct = Math.min(100, Math.round((quest.progress / quest.target) * 100));
            return (
              <article key={quest.id} className={`quest-card ${quest.completedAt ? "completed" : ""}`}>
                <div className="quest-header">
                  <span style={{ fontSize: 24 }}>⚔️</span>
                  <div>
                    <h4>{quest.title}</h4>
                    <small>Premio: {quest.rewardText}</small>
                  </div>
                  {quest.completedAt && <span className="pill green">¡Conseguido! 🎉</span>}
                </div>
                <div className="quest-progress-track">
                  <div className="quest-progress-bar" style={{ width: `${pct}%` }}/>
                </div>
                <div className="quest-labels">
                  <span>{quest.progress} / {quest.target} tareas</span>
                  <span>{pct}%</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Dashboard({

  snapshot,
  go,
}: {
  snapshot: Snapshot;
  go: (view: View) => void;
}) {
  const { family, user, today } = snapshot;
  const parent = user.role === "parent";
  const pending = family.requests.filter((r) => r.status === "pending").length;
  const approvedToday = family.requests.filter(
    (r) => r.kind === "task" && r.status === "approved" && r.date === today,
  ).length;
  const delivered = family.requests.filter(
    (r) => r.kind === "reward" && r.status === "delivered",
  ).length;
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            {parent
              ? "LO IMPORTANTE ES EL CAMINO"
              : "TU PRÓXIMO PASO EMPIEZA AQUÍ"}
          </span>
          <h2>
            {parent ? (
              <>
                Pequeños pasos,
                <br />
                <em>grandes momentos.</em>
              </>
            ) : (
              <>
                A tu ritmo,
                <br />
                <em>cada vez más lejos.</em>
              </>
            )}
          </h2>
          <p>
            {parent
              ? "Acompaña sus hábitos, reconoce el esfuerzo y celebrad juntos cada nuevo avance."
              : "Mira lo que has conseguido, elige tu siguiente tarea y recuerda: puedes pedir ayuda."}
          </p>
          <button
            className="text-button"
            onClick={() => go(parent ? "advice" : "tasks")}
          >
            {parent ? "Una idea para acompañarles hoy" : "Vamos con mis tareas"}
            <Icon name="arrow" size={18} />
          </button>
        </div>
        <Garden />
      </section>
      <section className="stats" aria-label="Resumen">
        <div>
          <span className="stat-icon sage">
            <Icon name="check" />
          </span>
          <div>
            <strong>
              {approvedToday}
              <small> pasos de hoy</small>
            </strong>
            <p>Tareas realizadas y aprobadas</p>
          </div>
        </div>
        <button onClick={() => go("requests")}>
          <span className="stat-icon peach">
            <Icon name="bell" />
          </span>
          <div>
            <strong>
              {pending}
              <small> por revisar</small>
            </strong>
            <p>
              {parent
                ? "Peticiones esperando tu atención"
                : "Peticiones enviadas a tu familia"}
            </p>
          </div>
          <Icon name="arrow" size={17} />
        </button>
        <div>
          <span className="stat-icon lavender">
            <Icon name="gift" />
          </span>
          <div>
            <strong>
              {delivered}
              <small> momentos especiales</small>
            </strong>
            <p>Recompensas ya disfrutadas</p>
          </div>
        </div>
      </section>
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            {parent ? "CADA UNO, A SU RITMO" : "ESTE ES TU CAMINO"}
          </span>
          <h2>{parent ? "Así vamos en familia" : "Mi progreso"}</h2>
        </div>
        {parent && (
          <button className="text-button" onClick={() => go("family")}>
            Gestionar familia
            <Icon name="arrow" size={17} />
          </button>
        )}
      </div>
      {!family.children.length ? (
        <section className="panel">
          <Empty title="El primer paso: añadir a tus hijos">
            Crea un perfil con su avatar, su objetivo y una clave de acceso
            propia.
          </Empty>
          <button
            className="button primary centered"
            onClick={() => go("family")}
          >
            <Icon name="plus" />
            Añadir mi primer hijo
          </button>
        </section>
      ) : (
        <>
          <div className="children-grid">
            {family.children.map((child) => (
              <article className="child-card" key={child.id}>
                <div className="child-card-top">
                  <span className="avatar">{child.avatar}</span>
                  <div>
                    <h3>{child.name}</h3>
                    <span>{child.age} años · Un camino propio</span>
                  </div>
                  <span className="child-flower" aria-hidden="true">
                    ✳
                  </span>
                </div>

                {/* Level & XP Progress */}
                <div className="xp-badge">
                  <span className="level-pill">Nivel {child.level || 1}</span>
                  <span className="xp-text">{child.xp || 0} / {child.xpToNext || 50} XP</span>
                </div>
                <div className="xp-bar-track" title={`${child.xp || 0} de ${child.xpToNext || 50} XP para el siguiente nivel`}>
                  <div className="xp-bar-fill" style={{ width: `${Math.min(100, Math.round(((child.xp || 0) / (child.xpToNext || 50)) * 100))}%` }} />
                </div>

                <p className="goal" style={{ marginTop: 12 }}>
                  <span>MI OBJETIVO</span>
                  {child.goal}
                </p>

                <Progress child={child} family={family} />

                {/* Virtual Pet */}
                <PetCard child={child} go={go} />

                <div className="child-bottom">
                  <span>
                    <Icon name="gift" size={17} />
                    <strong>{child.balance}</strong> puntos para premios
                  </span>
                  <button
                    className="text-button"
                    onClick={() => go(parent ? "family" : "rewards")}
                  >
                    {parent ? "Ver detalle" : "Ver premios"}
                    <Icon name="arrow" size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Family Quests */}
          <QuestList family={family} parent={parent} />
        </>
      )}

      <div className="dashboard-bottom">
        <section className="panel">
          <div className="section-heading compact">
            <h3>Los últimos pasos</h3>
            <span className="muted">Todo avance tiene su historia</span>
          </div>
          <History family={family} />
        </section>
        <aside className="note-card">
          <span className="eyebrow">
            <Icon name="spark" size={16} /> UNA IDEA PARA HOY
          </span>
          <h3>
            {parent
              ? "Reconoce el proceso, no solo el resultado."
              : "No tienes que hacerlo todo de golpe."}
          </h3>
          <p>
            {parent
              ? "«Has preparado la mochila siguiendo tu lista. Se nota lo bien que te has organizado»."
              : "Elige una tarea, empieza por un paso pequeño y pide ayuda si algo se complica."}
          </p>
          <button className="text-button" onClick={() => go("advice")}>
            {parent ? "Más ideas para educar" : "Más ideas que me ayudan"}
            <Icon name="arrow" size={17} />
          </button>
          <div className="note-doodle" aria-hidden="true">
            ✽
          </div>
        </aside>
      </div>
      {!parent && family.messages.length > 0 && (
        <section className="panel">
          <h3>Un mensaje para ti</h3>
          {family.messages.slice(0, 5).map((m) => (
            <blockquote key={m.id}>
              {m.text}
              <cite>— {m.by}</cite>
            </blockquote>
          ))}
        </section>
      )}
    </>
  );
}

function Tasks({ snapshot }: { snapshot: Snapshot }) {
  const { family, user, today } = snapshot;
  const parent = user.role === "parent";
  const [filter, setFilter] = useState("all");
  const tasks = family.tasks.filter(
    (t) =>
      (parent || t.active) &&
      (filter === "all" || taskChildIds(t).includes(filter)),
  );
  return (
    <>
      {parent && family.children.length > 0 && (
        <details className="editor">
          <summary>
            <Icon name="plus" />
            Crear una tarea o un reto especial
          </summary>
          <ActionForm operation="add-task" label="Crear tarea">
            <div className="form-grid">
              <label>
                Tarea concreta
                <input
                  name="tarea"
                  placeholder="Preparar la ropa para mañana"
                  maxLength={120}
                  required
                />
              </label>
              <ChildSelect profiles={family.children} />
              <label>
                Puntos
                <input
                  type="number"
                  name="puntos"
                  min="1"
                  max="100"
                  defaultValue="5"
                  required
                />
              </label>
              <label>
                Frecuencia
                <select name="frecuencia">
                  <option value="daily">Todos los días</option>
                  <option value="once">Reto especial · una vez</option>
                </select>
              </label>
            </div>
            <button className="button primary">Crear tarea</button>
          </ActionForm>
        </details>
      )}
      {parent && (
        <div className="filters">
          <button
            className={filter === "all" ? "selected" : ""}
            onClick={() => setFilter("all")}
          >
            Todos
          </button>
          {family.children.map((c) => (
            <button
              className={filter === c.id ? "selected" : ""}
              onClick={() => setFilter(c.id)}
              key={c.id}
            >
              {c.avatar} {c.name}
            </button>
          ))}
        </div>
      )}
      <section className="panel">
        <div className="section-heading compact">
          <h3>
            {parent
              ? "Un día, pequeños compromisos"
              : "Mis pequeños compromisos"}
          </h3>
          <span className="pill">
            {tasks.filter((t) => t.active).length} tareas activas
          </span>
        </div>
        {!tasks.length && (
          <Empty title="Todo empieza por una tarea">
            {parent
              ? "Añade un hijo y acuerda con él una tarea concreta y alcanzable."
              : "Tu familia está preparando tus primeras tareas."}
          </Empty>
        )}
        {tasks.map((task) => {
          const request = taskRequest(family, task, today);
          const child = family.children.find(
            (c) => c.id === taskChildIds(task)[0],
          );
          return (
            <article
              className={`task-row ${!task.active ? "archived" : ""}`}
              key={task.id}
            >
              <span
                className={`task-check ${request?.status === "approved" ? "done" : ""}`}
              >
                <Icon
                  name={request?.status === "approved" ? "check" : "tasks"}
                />
              </span>
              <div className="task-copy">
                <h4>{task.title}</h4>
                <p>
                  {parent ? `${child?.name} · ` : ""}
                  {task.frequency === "daily"
                    ? "Hábito diario"
                    : "Reto especial"}
                  {!task.active ? " · Archivada" : ""}
                </p>
              </div>
              <span className="points">+{task.points} pts</span>
              <div className="row-actions">
                {task.active &&
                  (request ? (
                    <span
                      className={`pill ${request.status === "approved" ? "green" : ""}`}
                    >
                      {request.status === "approved"
                        ? "Completada"
                        : "Por aprobar"}
                    </span>
                  ) : (
                    <ActionForm
                      operation={parent ? "complete-task" : "submit-task"}
                      values={{ id: task.id }}
                      label={`Completar ${task.title}`}
                    >
                      <button className="button small secondary">
                        {parent ? "Registrar" : "Lo he hecho"}
                        <Icon name="check" size={15} />
                      </button>
                    </ActionForm>
                  ))}
                {parent && (
                  <ActionForm
                    operation="toggle-task"
                    values={{ id: task.id }}
                    label={`Archivar ${task.title}`}
                  >
                    <button className="quiet-button">
                      {task.active ? "Archivar" : "Reactivar"}
                    </button>
                  </ActionForm>
                )}
              </div>
            </article>
          );
        })}
      </section>
      <p className="caption">
        <Icon name="leaf" size={16} /> Las tareas diarias vuelven a estar
        disponibles al cambiar el día en {family.settings.timezone}. Los retos
        especiales se completan una sola vez.
      </p>
    </>
  );
}

void Tasks;

function Rewards({ snapshot }: { snapshot: Snapshot }) {
  const { family, user } = snapshot;
  const parent = user.role === "parent";
  const child = family.children[0];
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);

  return (
    <>
      {parent ? (
        <details className="editor">
          <summary>
            <Icon name="plus" />
            Añadir una recompensa
          </summary>
          <ActionForm operation="add-reward" label="Crear recompensa">
            <div className="form-grid">
              <label>
                Recompensa
                <input
                  name="recompensa"
                  required
                  maxLength={120}
                  placeholder="Elegir nuestro próximo plan"
                />
              </label>
              <label>
                Coste en puntos
                <input
                  name="coste"
                  type="number"
                  min="1"
                  max="10000"
                  defaultValue="30"
                  required
                />
              </label>
              <label>
                Descripción
                <input
                  name="descripcion"
                  required
                  maxLength={300}
                  placeholder="¿En qué consiste este momento especial?"
                />
              </label>
              <label>
                Icono
                <select name="emoji">
                  <option>✨</option>
                  <option>🍿</option>
                  <option>🏕️</option>
                  <option>🎨</option>
                  <option>🎮</option>
                  <option>📚</option>
                  <option>🧑‍🍳</option>
                </select>
              </label>
            </div>
            <button className="button primary">Crear recompensa</button>
          </ActionForm>
        </details>
      ) : (
        <div className="balance-banner">
          <span>
            <Icon name="gift" />
            Tu esfuerzo abre nuevas posibilidades
          </span>
          <strong>
            {child?.balance ?? 0} <small>puntos disponibles</small>
          </strong>
        </div>
      )}
      <div className="rewards-grid">
        {family.rewards
          .filter((r) => parent || r.active)
          .map((reward, i) => {
            const pending = family.requests.some(
              (r) =>
                r.kind === "reward" &&
                r.referenceId === reward.id &&
                r.childId === user.id &&
                r.status === "pending",
            );
            const isEditing = editingRewardId === reward.id;

            return (
              <article
                className={`reward-card ${!reward.active ? "archived" : ""}`}
                key={reward.id}
              >
                <div className={`reward-art art-${i % 3}`}>
                  <span>{reward.emoji}</span>
                  <span className="reward-cost">{reward.cost} pts</span>
                  <i aria-hidden="true">✧</i>
                </div>
                <div className="reward-copy">
                  {isEditing ? (
                    <ActionForm
                      operation="edit-reward"
                      values={{ id: reward.id }}
                      label={`Editar ${reward.title}`}
                    >
                      <div className="compact-grid">
                        <label>Título<input name="recompensa" defaultValue={reward.title} required maxLength={120}/></label>
                        <label>Coste<input type="number" name="coste" defaultValue={reward.cost} min="1" max="10000" required/></label>
                        <label>Descripción<input name="descripcion" defaultValue={reward.description} maxLength={300}/></label>
                        <label>Icono<input name="emoji" defaultValue={reward.emoji} maxLength={10}/></label>
                      </div>
                      <div className="edit-buttons">
                        <button type="submit" className="button small primary" onClick={() => setEditingRewardId(null)}>Guardar</button>
                        <button type="button" className="button small secondary" onClick={() => setEditingRewardId(null)}>Cancelar</button>
                      </div>
                    </ActionForm>
                  ) : (
                    <>
                      <h3>{reward.title}</h3>
                      <p>{reward.description}</p>
                      {parent ? (
                        <div className="parent-task-menu" style={{ width: "100%", justifyContent: "space-between" }}>
                          <button type="button" className="quiet-button icon-only" title="Editar recompensa" onClick={() => setEditingRewardId(reward.id)}>
                            <Icon name="edit" size={16}/>
                          </button>
                          <ActionForm
                            operation="toggle-reward"
                            values={{ id: reward.id }}
                            label={`Disponibilidad de ${reward.title}`}
                          >
                            <button className="button secondary small">
                              {reward.active
                                ? "Archivar"
                                : "Reactivar"}
                            </button>
                          </ActionForm>
                          <ActionForm
                            operation="delete-reward"
                            values={{ id: reward.id }}
                            label={`Eliminar ${reward.title}`}
                          >
                            <button type="submit" className="quiet-button danger icon-only" title="Eliminar definitivamente" onClick={(e) => { if (!confirm(`¿Eliminar definitivamente la recompensa "${reward.title}"?`)) e.preventDefault(); }}>
                              <Icon name="trash" size={16}/>
                            </button>
                          </ActionForm>
                        </div>
                      ) : (
                        <ActionForm
                          operation="request-reward"
                          values={{ id: reward.id }}
                          label={`Solicitar ${reward.title}`}
                        >
                          <button
                            className="button secondary full"
                            disabled={
                              pending || !child || child.balance < reward.cost
                            }
                          >
                            {pending
                              ? "Solicitud enviada"
                              : child && child.balance >= reward.cost
                                ? "Pedir recompensa"
                                : `Te faltan ${reward.cost - (child?.balance || 0)} puntos`}
                            <Icon name="arrow" size={16} />
                          </button>
                        </ActionForm>
                      )}
                    </>
                  )}
                </div>
              </article>
            );
          })}
      </div>

      {!parent && (
        <section className="panel proposal">
          <div>
            <span className="eyebrow">LAS BUENAS IDEAS TAMBIÉN SON TUYAS</span>
            <h3>¿Qué te haría ilusión?</h3>
            <p>Propón una recompensa y hablad juntos de cómo conseguirla.</p>
          </div>
          <ActionForm operation="propose" label="Proponer recompensa">
            <label>
              Mi idea
              <input
                name="idea"
                maxLength={120}
                required
                placeholder="Me gustaría…"
              />
            </label>
            <button className="button primary">
              Enviar mi idea
              <Icon name="arrow" size={17} />
            </button>
          </ActionForm>
        </section>
      )}
      <p className="caption">
        <Icon name="leaf" size={16} /> El saldo se descuenta al aprobar el
        canje. Disfrutar de un premio no reduce la barra general.
      </p>
    </>
  );
}

function Requests({ snapshot }: { snapshot: Snapshot }) {
  const { family, user } = snapshot;
  const parent = user.role === "parent";
  const names = {
    task: "Tarea realizada",
    reward: "Canje de recompensa",
    idea: "Nueva idea",
  };
  const statuses = {
    pending: "Por revisar",
    approved: "Aprobada",
    rejected: "Revisada · no aprobada",
    delivered: "Disfrutada",
  };
  const sorted = [...family.requests].sort(
    (a, b) => Number(b.status === "pending") - Number(a.status === "pending"),
  );
  return (
    <section className="panel">
      {sorted.length === 0 ? (
        <Empty title="Todo está al día">
          Aquí aparecerán las tareas enviadas, las ideas y las peticiones de
          recompensas.
        </Empty>
      ) : (
        sorted.map((request) => (
          <article className="request-card" key={request.id}>
            <div className="request-heading">
              <span className="stat-icon sage">
                <Icon name={request.kind === "task" ? "tasks" : "gift"} />
              </span>
              <div>
                <span className="eyebrow">
                  {names[request.kind]} ·{" "}
                  {family.children.find((c) => c.id === request.childId)?.name}
                </span>
                <h3>{request.title}</h3>
              </div>
              <span
                className={`pill ${request.status === "approved" || request.status === "delivered" ? "green" : ""}`}
              >
                {statuses[request.status]}
              </span>
            </div>
            <p className="muted">
              {request.date}
              {request.points > 0 && ` · ${request.points} puntos`}
            </p>
            {request.note && <p className="request-note">{request.note}</p>}
            {parent && request.status === "pending" && (
              <ActionForm
                operation="review"
                label={`Revisar ${request.title}`}
                values={{ id: request.id }}
              >
                <div className="review-fields">
                  <label>
                    Comentario (obligatorio para no aprobar)
                    <input
                      name="nota"
                      maxLength={300}
                      placeholder="Reconoce su esfuerzo o explica el siguiente paso"
                    />
                  </label>
                  {request.kind === "idea" && (
                    <label>
                      Coste acordado
                      <input
                        name="coste"
                        type="number"
                        min="1"
                        max="10000"
                        defaultValue="30"
                      />
                    </label>
                  )}
                </div>
                <div className="button-row">
                  <button
                    type="submit"
                    className="button primary small"
                    name="decision"
                    value="approved"
                  >
                    {request.kind === "idea"
                      ? "Aprobar y crear premio"
                      : "Aprobar"}
                    <Icon name="check" size={16} />
                  </button>
                  <button
                    type="submit"
                    className="button secondary small"
                    name="decision"
                    value="rejected"
                  >
                    No aprobar
                  </button>
                </div>
              </ActionForm>
            )}
            {parent &&
              request.kind === "reward" &&
              request.status === "approved" && (
                <ActionForm
                  operation="review"
                  label={`Entregar ${request.title}`}
                  values={{ id: request.id, decision: "delivered" }}
                >
                  <button className="button primary small">
                    Marcar como disfrutada
                    <Icon name="gift" size={16} />
                  </button>
                </ActionForm>
              )}
          </article>
        ))
      )}
    </section>
  );
}

function FamilyView({ snapshot }: { snapshot: Snapshot }) {
  const { family } = snapshot;
  const [selected, setSelected] = useState(family.children[0]?.id || "");
  const child =
    family.children.find((c) => c.id === selected) || family.children[0];
  return (
    <>
      <details className="editor" open={family.children.length === 0}>
        <summary>
          <Icon name="plus" />
          Añadir un hijo
        </summary>
        <ActionForm operation="add-child" label="Añadir hijo">
          <div className="form-grid">
            <label>
              Nombre de acceso
              <input
                name="nombre"
                minLength={2}
                maxLength={40}
                required
                autoComplete="off"
                placeholder="Su nombre o alias"
              />
            </label>
            <label>
              Edad
              <input
                name="edad"
                type="number"
                min="8"
                max="14"
                defaultValue="10"
                required
              />
            </label>
            <label>
              Clave de acceso infantil
              <input
                name="clave"
                type="password"
                minLength={6}
                maxLength={128}
                required
                autoComplete="new-password"
                placeholder="Al menos 6 caracteres"
              />
            </label>
            <label>
              Avatar
              <select name="avatar">
                <option>🦊</option>
                <option>🐼</option>
                <option>🐨</option>
                <option>🐯</option>
                <option>🦁</option>
                <option>🐸</option>
                <option>🚀</option>
              </select>
            </label>
            <label className="span-two">
              Objetivo personal
              <input
                name="objetivo"
                maxLength={120}
                defaultValue="Organizarme cada día con más autonomía"
                required
              />
            </label>
          </div>
          <label className="checkbox">
            <input name="templates" type="checkbox" defaultChecked />
            Añadir tres tareas de ejemplo para empezar
          </label>
          <p className="muted">
            Empieza en 50/100 y con 0 puntos para premios. Podréis adaptar las
            tareas juntos.
          </p>
          <button className="button primary">
            Crear perfil
            <Icon name="plus" size={17} />
          </button>
        </ActionForm>
      </details>
      {child && (
        <>
          <div className="filters">
            {family.children.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={child.id === c.id ? "selected" : ""}
              >
                {c.avatar} {c.name}
              </button>
            ))}
          </div>
          <div className="family-detail">
            <section className="panel">
              <div className="child-card-top">
                <span className="avatar large">{child.avatar}</span>
                <div>
                  <h2>{child.name}</h2>
                  <p>
                    {child.age} años · {child.balance} puntos para premios
                  </p>
                </div>
              </div>
              <p className="goal">
                <span>OBJETIVO PERSONAL</span>
                {child.goal}
              </p>
              <Progress child={child} family={family} />
              <p className="muted">
                {statusFor(child.score, family.settings).hint}
              </p>
              <details className="inner-details">
                <summary>Editar objetivo, edad y avatar</summary>
                <ActionForm
                  operation="edit-child"
                  label={`Editar perfil de ${child.name}`}
                  values={{ childId: child.id }}
                  key={`edit-${child.id}`}
                >
                  <label>
                    Objetivo
                    <input
                      name="objetivo"
                      defaultValue={child.goal}
                      maxLength={120}
                      required
                    />
                  </label>
                  <div className="form-grid">
                    <label>
                      Edad
                      <input
                        name="edad"
                        type="number"
                        min="8"
                        max="14"
                        defaultValue={child.age}
                        required
                      />
                    </label>
                    <label>
                      Avatar
                      <select name="avatar" defaultValue={child.avatar}>
                        {["🦊", "🐼", "🐨", "🐯", "🦁", "🐸", "🚀"].map((a) => (
                          <option key={a}>{a}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <button className="button secondary">Guardar perfil</button>
                </ActionForm>
              </details>
              <details className="inner-details" style={{ marginTop: 8 }}>
                <summary style={{ color: "var(--coral-700)" }}>⚙️ Opciones avanzadas: Reiniciar o Eliminar perfil</summary>
                <div style={{ padding: "12px 0", display: "flex", flexDirection: "column", gap: 12 }}>
                  <p className="muted" style={{ margin: 0 }}>
                    Las siguientes acciones afectan directamente la cuenta y el progreso de <strong>{child.name}</strong>:
                  </p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <ActionForm operation="reset-child" label={`Resetear progreso de ${child.name}`} values={{ childId: child.id }}>
                      <button type="submit" className="button secondary small" style={{ color: "var(--coral-700)" }} onClick={(e) => { if (!confirm(`¿Seguro que deseas reiniciar el progreso de ${child.name}? La barra de puntos volverá a 50 y el saldo para premios a 0.`)) e.preventDefault(); }}>
                        🔄 Reiniciar progreso (50 pts / 0 saldo)
                      </button>
                    </ActionForm>
                    <ActionForm operation="delete-child" label={`Eliminar perfil de ${child.name}`} values={{ childId: child.id }}>
                      <button type="submit" className="button secondary small danger" onClick={(e) => { if (!confirm(`¡ATENCIÓN! ¿Eliminar permanentemente el perfil de ${child.name}? Esta acción borrará todas sus tareas, mascota e historial de forma irreversible.`)) e.preventDefault(); }}>
                        <Icon name="trash" size={15} /> Eliminar perfil de {child.name}
                      </button>
                    </ActionForm>
                  </div>
                </div>
              </details>
            </section>
            <section className="panel adjustment">
              <span className="eyebrow">ACOMPAÑAR CON CLARIDAD</span>
              <h3>Registrar puntos</h3>
              <p>Describe la acción concreta y el motivo del ajuste.</p>
              <ActionForm
                operation="adjust"
                label={`Puntuar a ${child.name}`}
                values={{ childId: child.id }}
                key={`score-${child.id}`}
              >
                <label>
                  Puntos de ajuste
                  <input
                    name="puntos"
                    type="number"
                    min={family.settings.negativeEnabled ? -100 : 1}
                    max="100"
                    defaultValue="5"
                    required
                  />
                </label>
                <small>
                  {family.settings.negativeEnabled
                    ? "Usa un número positivo para sumar o negativo para restar."
                    : "Los ajustes negativos están desactivados."}
                </small>
                <label>
                  Motivo del ajuste
                  <textarea
                    name="motivo"
                    rows={2}
                    maxLength={300}
                    placeholder="Por ejemplo: preparaste la mochila siguiendo tu lista"
                    required
                  />
                </label>
                <button className="button primary">
                  Guardar ajuste
                  <Icon name="check" size={17} />
                </button>
              </ActionForm>
            </section>
          </div>
          <section className="panel">
            <h3>Un mensaje que acompaña</h3>
            <ActionForm
              operation="message"
              label={`Mensaje para ${child.name}`}
              values={{ childId: child.id }}
            >
              <label>
                Mensaje para {child.name}
                <textarea
                  name="mensaje"
                  rows={2}
                  maxLength={400}
                  required
                  placeholder="He visto cómo has vuelto a intentarlo…"
                />
              </label>
              <button className="button secondary">
                Enviar mensaje
                <Icon name="arrow" size={17} />
              </button>
            </ActionForm>
          </section>
          <section className="panel">
            <h3>El camino de {child.name}</h3>
            <History family={family} childId={child.id} />
          </section>
        </>
      )}
    </>
  );
}

function Advice({ parent }: { parent: boolean }) {
  return (
    <>
      <section className="advice-intro">
        <span className="eyebrow">APRENDER TAMBIÉN ES COSA DE FAMILIA</span>
        <h2>
          {parent ? (
            <>
              Acompañar hoy.
              <br />
              <em>Construir autonomía mañana.</em>
            </>
          ) : (
            <>
              Pequeñas ideas.
              <br />
              <em>Grandes ayudas para tu día.</em>
            </>
          )}
        </h2>
        <p>
          {parent
            ? "Ideas prácticas inspiradas en investigación y recomendaciones pediátricas, para conversar y adaptar a vuestro día a día."
            : "No hay una única forma de avanzar. Prueba estas ideas y descubre cuáles te ayudan."}
        </p>
      </section>
      <div className="advice-grid">
        {advice.map((item, i) => (
          <article className="advice-card" key={item.tag}>
            <span className="advice-number">0{i + 1}</span>
            <span className="eyebrow">{item.tag}</span>
            <h3>
              {parent
                ? item.title
                : [
                    "Empieza por entender el primer paso",
                    "Descubre lo que te funciona",
                    "Tus ideas también cuentan",
                    "Mira cuánto has aprendido",
                    "Haz espacio a lo que disfrutas",
                  ][i]}
            </h3>
            <p>{parent ? item.text : item.child}</p>
            {parent && (
              <>
                <blockquote>«{item.example}»</blockquote>
                <a
                  href={sources[item.source].url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {sources[item.source].name}
                  <Icon name="arrow" size={15} />
                </a>
              </>
            )}
          </article>
        ))}
      </div>
      {parent && (
        <section className="evidence-note">
          <h3>Qué respalda la evidencia y qué hemos elegido como diseño</h3>
          <p>
            La guía de la AAP recomienda metas concretas, participación del niño
            y retirada gradual de recompensas; aconseja evitar penalizaciones en
            los cuadros de puntos. Su referencia principal es la etapa de 5 a 12
            años. El metaanálisis estudia motivación, no valida esta aplicación
            ni una escala de conducta.
          </p>
          <p>
            Los ajustes negativos son una opción solicitada por vuestra familia.
            Las franjas, el inicio en 50 y los umbrales son configuraciones del
            producto, no valores clínicos ni una evaluación del niño. Los
            consejos no constituyen un programa validado específicamente para
            todo el intervalo de 8 a 14 años.
          </p>
        </section>
      )}
    </>
  );
}

function Settings({ snapshot }: { snapshot: Snapshot }) {
  const { family, members } = snapshot;
  const [showTechStack, setShowTechStack] = useState(false);
  return (
    <div className="settings-grid">
      <section className="panel">
        <span className="eyebrow">VUESTRAS REGLAS, EXPLÍCITAS</span>
        <h3>La barra de progreso</h3>
        <ActionForm operation="settings" label="Configurar familia">
          <label>
            Nombre de la familia
            <input
              name="familia"
              defaultValue={family.name}
              maxLength={60}
              required
            />
          </label>
          <div className="form-grid">
            <label>
              Inicio de zona acordada
              <input
                name="aceptable"
                type="number"
                min="1"
                max="98"
                defaultValue={family.settings.acceptable}
                required
              />
            </label>
            <label>
              Objetivo de la barra
              <input
                name="meta"
                type="number"
                min="2"
                max="100"
                defaultValue={family.settings.target}
                required
              />
            </label>
          </div>
          <label>
            Zona horaria
            <select name="zona" defaultValue={family.settings.timezone}>
              <option value="Europe/Madrid">España peninsular</option>
              <option value="Atlantic/Canary">Islas Canarias</option>
              <option value="America/Mexico_City">Ciudad de México</option>
              <option value="America/Bogota">Bogotá</option>
              <option value="America/Argentina/Buenos_Aires">
                Buenos Aires
              </option>
              <option value="America/Santiago">Santiago</option>
            </select>
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              name="negativos"
              defaultChecked={family.settings.negativeEnabled}
            />
            Permitir a los padres restar puntos de la barra
          </label>
          <button className="button primary">Guardar configuración</button>
        </ActionForm>
        <div className="rules">
          <h4>Cómo se calculan los puntos</h4>
          <ul>
            <li>La barra comienza en 50 y se mantiene entre 0 y 100.</li>
            <li>Los ajustes se acumulan; no hay reinicio diario ni semanal.</li>
            <li>
              Los puntos positivos también aumentan el saldo para premios,
              incluso si la barra ya ha llegado a 100.
            </li>
            <li>
              Los negativos solo reducen la barra, sin modificar el saldo para
              premios.
            </li>
            <li>
              Al aprobar un canje se descuenta el saldo; la barra no cambia.
            </li>
            <li>
              Cada ajuste conserva su motivo, autor y fecha. En los límites se
              registra el cambio efectivamente aplicado.
            </li>
          </ul>
        </div>
      </section>
      <div>
        <section className="panel">
          <span className="eyebrow">EL EQUIPO ADULTO</span>
          <h3>Accesos de padres</h3>
          {members
            .filter((m) => m.role === "parent")
            .map((m) => (
              <div className="member" key={m.id}>
                <span className="mini-avatar">{m.name[0].toUpperCase()}</span>
                <span>{m.name}</span>
                <span className="pill">Administrador</span>
              </div>
            ))}
          <details className="inner-details">
            <summary>Añadir otro progenitor</summary>
            <ActionForm operation="add-parent" label="Añadir progenitor">
              <label>
                Nombre de acceso
                <input
                  name="nombre"
                  minLength={2}
                  maxLength={40}
                  required
                  autoComplete="off"
                />
              </label>
              <label>
                Contraseña
                <input
                  name="clave"
                  type="password"
                  minLength={10}
                  maxLength={128}
                  required
                  autoComplete="new-password"
                />
              </label>
              <button className="button secondary">
                Crear acceso de adulto
              </button>
            </ActionForm>
          </details>
        </section>

        <section className="panel">
          <span className="eyebrow">GESTIÓN DE PERFILES INFANTILES</span>
          <h3>Reiniciar o eliminar hijos</h3>
          <p className="muted" style={{ marginBottom: 16 }}>
            Desde aquí los adultos pueden reiniciar el progreso de un hijo (restablecer a 50 puntos y 0 saldo) o eliminar su perfil definitivamente.
          </p>
          {family.children.length === 0 ? (
            <p className="muted">No hay perfiles infantiles configurados.</p>
          ) : (
            <div className="child-settings-list" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {family.children.map((c) => (
                <div key={c.id} className="child-setting-card" style={{ padding: 12, border: "1px solid var(--border)", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <strong>{c.avatar} {c.name}</strong>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      Puntuación actual: {c.score}/100 · Saldo: {c.balance} pts
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <ActionForm operation="reset-child" label={`Resetear progreso de ${c.name}`} values={{ childId: c.id }}>
                      <button type="submit" className="button secondary small" style={{ color: "var(--coral-700)" }} onClick={(e) => { if (!confirm(`¿Seguro que deseas reiniciar el progreso de ${c.name}? La barra se fijará en 50 y el saldo en 0.`)) e.preventDefault(); }}>
                        Resetear
                      </button>
                    </ActionForm>
                    <ActionForm operation="delete-child" label={`Eliminar perfil de ${c.name}`} values={{ childId: c.id }}>
                      <button type="submit" className="button secondary small danger" onClick={(e) => { if (!confirm(`¿ATENCIÓN: Eliminar permanentemente el perfil de ${c.name}? Esta acción no se puede deshacer.`)) e.preventDefault(); }}>
                        Eliminar
                      </button>
                    </ActionForm>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="note-card">
          <Icon name="leaf" size={28} />
          <h3>Los acuerdos se conversan.</h3>
          <p>
            Explicad qué significa cada franja y qué acciones concretas suman o
            restan. Revisad las expectativas cuando cambien las necesidades de
            cada niño.
          </p>
          <p className="small-text">
            Los umbrales son acuerdos familiares, no una medida científica del
            comportamiento.
          </p>
        </section>

        <section className="panel" style={{ marginTop: 22 }}>
          <span className="eyebrow">TRANSPARENCIA TÉCNICA</span>
          <h3>Arquitectura y Tecnologías</h3>
          <p className="muted" style={{ marginBottom: 16 }}>
            Explora el mapa interactivo de componentes del sistema, dependencias y diagnóstico de salud en tiempo real.
          </p>
          <button
            type="button"
            onClick={() => setShowTechStack(true)}
            className="button secondary full"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18, color: "var(--green)" }}>☊</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 600, color: "var(--ink)", fontSize: 13 }}>Mapa del Stack Tecnológico</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>Grafo interactivo con chequeo de salud en vivo</div>
              </div>
            </div>
            <Icon name="arrow" size={16} />
          </button>
        </section>
      </div>

      {showTechStack && (
        <Suspense fallback={null}>
          <AppArchitectureGraph onClose={() => setShowTechStack(false)} />
        </Suspense>
      )}
    </div>
  );
}

export function Portal({ snapshot }: { snapshot: Snapshot }) {
  useRealtimeSync();
  const [view, setView] = useState<View>("home");
  const [state, action, pending] = useActionState(mutate, {});
  const parent = snapshot.user.role === "parent";
  const nav: { view: View; label: string; icon: string }[] = [
    {
      view: "home",
      label: parent ? "Nuestro día" : "Mi espacio",
      icon: "home",
    },
    {
      view: "tasks",
      label: parent ? "Tareas y hábitos" : "Mis tareas",
      icon: "tasks",
    },
    {
      view: "pet",
      label: parent ? "Mascotas" : "Mi Mascota",
      icon: "pet",
    },
    { view: "rewards", label: "Recompensas", icon: "gift" },
    {
      view: "requests",
      label: parent ? "Solicitudes" : "Mis peticiones",
      icon: "bell",
    },
    ...(parent
      ? [{ view: "family" as const, label: "Mi familia", icon: "family" }]
      : []),
    {
      view: "advice",
      label: parent ? "Educar en positivo" : "Ideas que me ayudan",
      icon: "book",
    },
    ...(parent
      ? [
          {
            view: "settings" as const,
            label: "Configuración",
            icon: "settings",
          },
        ]
      : []),
  ];
  const pendingCount = snapshot.family.requests.filter(
    (r) => r.status === "pending",
  ).length;
  const title = {
    home: parent ? "Hoy crecemos juntos" : `¡Hola, ${snapshot.user.name}!`,
    tasks: parent ? "Tareas y hábitos" : "Mis tareas",
    pet: parent ? "Mascotas virtuales 8-bits" : "Mi Mascota Virtual 8-bits",
    rewards: "Momentos que ilusionan",
    requests: parent ? "Un poco de tu atención" : "Mis peticiones",
    family: "Cada camino es diferente",
    advice: parent ? "Educar en positivo" : "Ideas que me ayudan",
    settings: "A vuestra manera",
  };
  const subtitle = {
    home: parent
      ? "Un vistazo a los pequeños grandes avances de tu familia."
      : "Este es tu espacio. Un pequeño paso cada vez.",
    tasks: "Compromisos claros, alcanzables y acordados juntos.",
    pet: parent
      ? "Cuida y evoluciona las mascotas virtuales en estilo Tamagotchi retro."
      : "Tu compañero de aventuras crece y evoluciona con tu esfuerzo diario.",
    rewards: "La ilusión de elegir algo especial y trabajar para conseguirlo.",
    requests: "Un momento para revisar juntos lo que habéis acordado.",
    family: "Cada hijo tiene sus propios objetivos y su propio ritmo.",
    advice: "Ideas basadas en evidencia para acompañar su crecimiento.",
    settings: "Personaliza el funcionamiento del sistema familiar.",
  };
  const go = (target: View) => {
    setView(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <FormContext value={{ action, pending }}>
      <div className="app-shell">
        <a href="#main" className="skip-link">
          Saltar al contenido
        </a>
        <aside className="sidebar">
          <Brand />
          <div className="family-label">
            <span className="family-monogram">
              {snapshot.family.name.charAt(0).toUpperCase()}
            </span>
            <span>
              {snapshot.family.name}
              <small>Un espacio para crecer</small>
            </span>
            <span className="family-check">
              <Icon name="check" size={13} />
            </span>
          </div>
          <span className="nav-eyebrow">
            {parent ? "ACOMPAÑAMOS SU CAMINO" : "MI PEQUEÑO GRAN MUNDO"}
          </span>
          <nav aria-label="Navegación principal">
            {nav.map((item) => (
              <button
                key={item.view}
                className={view === item.view ? "active" : ""}
                aria-current={view === item.view ? "page" : undefined}
                onClick={() => go(item.view)}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
                {item.view === "requests" && pendingCount > 0 && (
                  <b className="nav-count">{pendingCount}</b>
                )}
              </button>
            ))}
          </nav>
          <div className="sidebar-note">
            <Icon name="leaf" />
            <p>
              No se trata de hacerlo perfecto.
              <br />
              <strong>Se trata de crecer juntos.</strong>
            </p>
          </div>
          <div className="sidebar-user">
            <span className="mini-avatar">
              {parent
                ? snapshot.user.name[0].toUpperCase()
                : snapshot.family.children[0]?.avatar}
            </span>
            <span>
              <strong>{snapshot.user.name}</strong>
              <small>
                {parent ? "Espacio de padres" : "Mi espacio personal"}
              </small>
            </span>
            <form action={logout}>
              <button title="Cerrar sesión" aria-label="Cerrar sesión">
                <Icon name="logout" size={18} />
              </button>
            </form>
          </div>
        </aside>
        <div className="main-shell">
          <header className="topbar">
            <span>
              <Icon name="home" size={16} />
              <span>Mi familia</span>
              <span className="crumb-divider">/</span>
              <strong>{nav.find((n) => n.view === view)?.label}</strong>
            </span>
            <div>
              <span className="private-tag">
                <i />
                Espacio privado
              </span>
              <button
                className="notification-button"
                onClick={() => go("requests")}
                aria-label={`Ver ${pendingCount} solicitudes pendientes`}
              >
                <Icon name="bell" />
                {pendingCount > 0 && <i />}
              </button>
            </div>
          </header>
          <main id="main" className="main-content">
            <PwaInstallBanner />
            <div className="page-heading">
              <div>
                <p className="date-label">
                  {dateLabel(snapshot.today)}
                </p>
                <h1>{title[view]}</h1>
                <p>{subtitle[view]}</p>
              </div>
              <span className="page-flower" aria-hidden="true">
                ✳
              </span>
            </div>
            <div aria-live="polite" aria-atomic="true">
              {pending ? (
                <p className="notice">Guardando vuestro avance…</p>
              ) : state.error ? (
                <p className="notice error" role="alert">
                  {state.error}
                </p>
              ) : state.message ? (
                <p className="notice success">{state.message}</p>
              ) : null}
            </div>
            {view === "home" && <Dashboard snapshot={snapshot} go={go} />}
            {view === "tasks" && (
              <TaskBoard
                snapshot={snapshot}
                action={action}
                pending={pending}
              />
            )}
            {view === "pet" && <PetView snapshot={snapshot} />}
            {view === "rewards" && <Rewards snapshot={snapshot} />}
            {view === "requests" && <Requests snapshot={snapshot} />}
            {view === "family" && parent && <FamilyView snapshot={snapshot} />}
            {view === "advice" && <Advice parent={parent} />}
            {view === "settings" && parent && <Settings snapshot={snapshot} />}
            <footer className="page-footer">
              <span>
                pasos<span className="brand-dot">.</span>
              </span>
              <p>Con tiempo, con cariño, en familia.</p>
              <Icon name="leaf" size={17} />
            </footer>
          </main>
        </div>
      </div>
    </FormContext>
  );
}
