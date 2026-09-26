"use client";

import { useState, type FormEvent } from "react";
import { taskChildIds, taskLibrary, taskRequest, taskStreak, type Snapshot, type Task } from "@/lib/model";
import { Icon } from "./icon";

type Props = { snapshot: Snapshot; action: (form: FormData) => void; pending: boolean };

function TaskForm({ action, pending, operation, label, values = {}, children }: { action: (form: FormData) => void; pending: boolean; operation: string; label: string; values?: Record<string, string>; children: React.ReactNode }) {
  return <form action={action} aria-label={label} onSubmit={(event: FormEvent<HTMLFormElement>) => {
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    if (!submitter?.name || !submitter.value) return;
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = submitter.name;
    input.value = submitter.value;
    event.currentTarget.appendChild(input);
  }}>
    <input type="hidden" name="operation" value={operation}/>
    {Object.entries(values).map(([name, value]) => <input type="hidden" name={name} value={value} key={name}/>)}
    <fieldset disabled={pending}>{children}</fieldset>
  </form>;
}

function assignedNames(task: Task, snapshot: Snapshot) {
  return snapshot.family.children.filter(child => taskChildIds(task).includes(child.id));
}

export function TaskBoard({ snapshot, action, pending }: Props) {
  const { family, user, today } = snapshot;
  const parent = user.role === "parent";
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  const tasks = family.tasks.filter(task => (parent || taskChildIds(task).includes(user.id)) && (filter === "all" || taskChildIds(task).includes(filter)));

  return <>
    {parent && family.children.length > 0 && <details className="editor"><summary><Icon name="plus"/>Añadir una tarea desde la biblioteca</summary><TaskForm action={action} pending={pending} operation="add-task" label="Crear tarea">
      <div className="form-grid">
        <label>Biblioteca de rutinas<select name="plantilla" defaultValue=""><option value="">Tarea personalizada</option>{taskLibrary.map(item => <option value={item.id} key={item.id}>{item.emoji} {item.title}</option>)}</select></label>
        <label>Tarea personalizada<input name="tarea" placeholder="Preparar la ropa para mañana" maxLength={120}/></label>
        <label>Puntos<input type="number" name="puntos" min="1" max="100" defaultValue="5" required/></label>
        <label>Frecuencia<select name="frecuencia" defaultValue="daily"><option value="daily">Todos los días</option><option value="once">Reto especial · una vez</option></select></label>
        <label>Señal o momento<input name="señal" placeholder="Después de cenar" maxLength={120}/></label>
        <label>Primer paso pequeño<input name="primerPaso" placeholder="Mirar la agenda" maxLength={160}/></label>
      </div>
      <fieldset className="checkbox-list"><legend>Asignar a</legend>{family.children.map(child => <label className="checkbox" key={child.id}><input type="checkbox" name="childIds" value={child.id} defaultChecked/>{child.avatar} {child.name}</label>)}</fieldset>
      <label className="checkbox"><input type="checkbox" name="automatica" defaultChecked/>Conceder puntos automáticamente al marcar una rutina diaria</label>
      <p className="muted">Las rutinas automáticas solo dan puntos cuando se marcan ese día. Si no se realizan, no suman.</p>
      <button className="button primary">Crear tarea</button>
    </TaskForm></details>}

    {parent && <div className="filters"><button className={filter === "all" ? "selected" : ""} onClick={() => setFilter("all")}>Todos</button>{family.children.map(child => <button className={filter === child.id ? "selected" : ""} onClick={() => setFilter(child.id)} key={child.id}>{child.avatar} {child.name}</button>)}</div>}

    <section className="panel"><div className="section-heading compact"><h3>{parent ? "Rutinas y compromisos" : "Mis pequeños compromisos"}</h3><span className="pill">{tasks.filter(task => task.active).length} tareas activas</span></div>
      {!tasks.length && <div className="empty"><span className="empty-icon"><Icon name="leaf" size={28}/></span><h3>Todo empieza por una tarea</h3><p>{parent ? "Elige una rutina de la biblioteca y asígnala a uno o varios hijos." : "Tu familia está preparando tus primeras tareas."}</p></div>}
      {tasks.map(task => {
        const children = assignedNames(task, snapshot);
        const visibleChildren = parent ? children : children.filter(child => child.id === user.id);
        const isEditing = editingId === task.id;

        return <article className={`task-row ${!task.active ? "archived" : ""}`} key={task.id}>
          <span className="task-check"><Icon name="tasks"/></span>
          
          <div className="task-copy">
            {isEditing ? (
              <TaskForm action={(fd) => { action(fd); setEditingId(null); }} pending={pending} operation="edit-task" values={{ id: task.id }} label={`Editar ${task.title}`}>
                <div className="form-grid compact-grid">
                  <label>Título<input name="tarea" defaultValue={task.title} required maxLength={120}/></label>
                  <label>Puntos<input type="number" name="puntos" min="1" max="100" defaultValue={task.points} required/></label>
                  <label>Frecuencia<select name="frecuencia" defaultValue={task.frequency}><option value="daily">Todos los días</option><option value="once">Reto especial</option></select></label>
                  <label>Señal<input name="señal" defaultValue={task.cue} maxLength={120}/></label>
                  <label>Primer paso<input name="primerPaso" defaultValue={task.firstStep} maxLength={160}/></label>
                </div>
                <fieldset className="checkbox-list inline-checkboxes"><legend>Asignado a</legend>{family.children.map(child => <label className="checkbox" key={child.id}><input type="checkbox" name="childIds" value={child.id} defaultChecked={taskChildIds(task).includes(child.id)}/>{child.name}</label>)}</fieldset>
                <label className="checkbox"><input type="checkbox" name="automatica" defaultChecked={task.autoApprove}/>Puntos automáticos al marcar</label>
                <div className="edit-buttons">
                  <button type="submit" className="button small primary">Guardar cambios</button>
                  <button type="button" className="button small secondary" onClick={() => setEditingId(null)}>Cancelar</button>
                </div>
              </TaskForm>
            ) : (
              <>
                <div className="title-row">
                  <h4>{task.title}</h4>
                  {visibleChildren.map(c => {
                    const st = taskStreak(family, task.id, c.id, today, family.settings.timezone);
                    return st > 0 ? <span className="streak-badge" key={c.id} title={`${st} días seguidos`}><Icon name="fire" size={14}/> {st}</span> : null;
                  })}
                </div>
                <p>{parent ? children.map(child => child.name).join(" · ") : "Hábito personal"} · {task.frequency === "daily" ? "Todos los días" : "Reto especial"}{task.autoApprove && task.frequency === "daily" ? " · Puntos automáticos" : ""}</p>
                <small>Cuando: {task.cue} · Empieza por: {task.firstStep}</small>

                {/* Subtasks / Checklist */}
                {task.checklist && task.checklist.length > 0 && (
                  <div className="task-checklist">
                    {task.checklist.map(item => (
                      <div key={item.id} className="checklist-item">
                        <TaskForm action={action} pending={pending} operation="toggle-checklist" values={{ taskId: task.id, itemId: item.id }} label={`Marcar ${item.text}`}>
                          <button type="submit" className={`checklist-check ${item.done ? "done" : ""}`}>
                            {item.done ? <Icon name="check" size={13}/> : <span className="checklist-box"/>}
                            <span className={item.done ? "line-through" : ""}>{item.text}</span>
                          </button>
                        </TaskForm>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <span className="points">+{task.points} pts</span>

          <div className="row-actions">
            {!isEditing && visibleChildren.map(child => {
              const request = taskRequest(family, task, today, child.id);
              return <span key={child.id}>{request ? <span className={`pill ${request.status === "approved" ? "green" : ""}`}>{request.status === "approved" ? "Completada" : "Por aprobar"}</span> : task.active && <TaskForm action={action} pending={pending} operation={parent ? "complete-task" : "submit-task"} values={{ id: task.id, childId: child.id }} label={parent ? `Completar ${task.title} para ${child.name}` : `Completar ${task.title}`}><button className="button small secondary">{parent ? `Registrar para ${child.name}` : "Lo he hecho"}<Icon name="check" size={15}/></button></TaskForm>}</span>;
            })}

            {parent && !isEditing && (
              <div className="parent-task-menu">
                <button type="button" className="quiet-button icon-only" title="Editar tarea" onClick={() => setEditingId(task.id)}>
                  <Icon name="edit" size={16}/>
                </button>
                <TaskForm action={action} pending={pending} operation="toggle-task" values={{ id: task.id }} label={`${task.active ? "Archivar" : "Reactivar"} ${task.title}`}>
                  <button type="submit" className="quiet-button" title={task.active ? "Archivar" : "Reactivar"}>
                    {task.active ? "Archivar" : "Reactivar"}
                  </button>
                </TaskForm>
                <TaskForm action={action} pending={pending} operation="delete-task" values={{ id: task.id }} label={`Eliminar ${task.title}`}>
                  <button type="submit" className="quiet-button danger icon-only" title="Eliminar definitivamente" onClick={(e) => { if (!confirm(`¿Seguro que quieres eliminar definitivamente la tarea "${task.title}"?`)) e.preventDefault(); }}>
                    <Icon name="trash" size={16}/>
                  </button>
                </TaskForm>
              </div>
            )}
          </div>
        </article>;
      })}
    </section><p className="caption"><Icon name="leaf" size={16}/> Las tareas diarias solo suman puntos cuando se completan ese día en {family.settings.timezone}.</p>
  </>;
}
