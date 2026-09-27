"use client";

import React, { useState } from "react";
import type { Family, Member, FamilyProject } from "../lib/model";
import { hapticSuccess, hapticTap } from "../lib/haptics";
import { playLevelUp, playTap } from "../lib/sound";
import { Icon } from "./icon";
import { ActionForm } from "./portal-form";

interface FamilyProjectViewProps {
  family: Family;
  user: Member;
}

export function FamilyProjectView({ family, user }: FamilyProjectViewProps) {
  const parent = user.role === "parent";

  const defaultStarter: FamilyProject = {
    id: "proj-treehouse",
    title: "Construir la Cabaña del Árbol 8-Bits",
    description: "Cada rutina y tarea que completamos aporta un ladrillo de madera a nuestro proyecto compartido.",
    rewardTitle: "Tarde de cine y pizza casera en familia",
    targetPoints: 60,
    currentPoints: 15,
    active: true,
    contributions: family.children.map((c, i) => ({
      memberId: c.id,
      memberName: c.name,
      points: (i + 1) * 5,
    })),
    startedAt: new Date().toISOString(),
  };

  const activeProject =
    (family.projects && family.projects.find((p) => p.active && !p.completedAt)) ||
    (family.projects && family.projects[0]) ||
    defaultStarter;

  const isCompleted = activeProject.currentPoints >= activeProject.targetPoints;
  const pct = Math.min(100, Math.round((activeProject.currentPoints / activeProject.targetPoints) * 100));

  const [showNewForm, setShowNewForm] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div className="page-heading">
        <div>
          <div className="date-label">MISIÓN COOPERATIVA FAMILIAR</div>
          <h1>El Proyecto Familiar</h1>
          <p>
            Cooperación sin penalizaciones: cada tarea completada construye un proyecto colectivo para disfrutar todos juntos.
          </p>
        </div>
      </div>

      {/* Main Project Hero Card */}
      <div
        className="panel"
        style={{
          background: "linear-gradient(180deg, rgba(20, 45, 30, 0.7) 0%, rgba(10, 25, 18, 0.95) 100%)",
          borderColor: "rgba(74, 222, 128, 0.3)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 16,
          padding: "24px 20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
          <span className="pill green" style={{ fontSize: 11, padding: "3px 8px" }}>
            {isCompleted ? "🏆 ¡PROYECTO COMPLETADO!" : "🔨 EN CONSTRUCCIÓN"}
          </span>
          <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
            {activeProject.currentPoints} / {activeProject.targetPoints} Ladrillos de Madera
          </span>
        </div>

        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--ink)", margin: "4px 0" }}>
            {activeProject.title}
          </h2>
          <p style={{ fontSize: 13, color: "var(--muted)", maxWidth: 500, margin: "0 auto" }}>
            {activeProject.description}
          </p>
        </div>

        {/* 8-Bit Pixel Treehouse Illustration Canvas (SVG) */}
        <div
          style={{
            margin: "12px 0",
            padding: 16,
            background: "rgba(0,0,0,0.35)",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <svg
            width="220"
            height="180"
            viewBox="0 0 220 180"
            style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}
          >
            {/* Ground & Grass */}
            <rect x="0" y="160" width="220" height="20" fill="#2d5a3f" />
            <rect x="0" y="160" width="220" height="4" fill="#4ad26d" />

            {/* Tree Trunk */}
            <rect x="95" y="70" width="30" height="90" fill="#6d4c41" />
            <rect x="100" y="70" width="8" height="90" fill="#5d4037" />

            {/* Tree Foliage (Background) */}
            <rect x="50" y="20" width="120" height="60" rx="8" fill="#1b5e20" />
            <rect x="35" y="40" width="150" height="40" rx="6" fill="#2e7d32" />
            <rect x="65" y="10" width="90" height="40" rx="6" fill="#388e3c" />

            {/* Stage 1: Ladder / Access (pct >= 20) */}
            {pct >= 20 ? (
              <g id="ladder">
                <rect x="75" y="105" width="4" height="55" fill="#d7ccc8" />
                <rect x="87" y="105" width="4" height="55" fill="#d7ccc8" />
                {[115, 125, 135, 145, 155].map((y) => (
                  <rect key={y} x="75" y={y} width="16" height="3" fill="#bcaaa4" />
                ))}
              </g>
            ) : (
              <rect x="80" y="145" width="12" height="15" fill="#a1887f" opacity="0.3" />
            )}

            {/* Stage 2: Main Platform & Posts (pct >= 40) */}
            {pct >= 40 ? (
              <g id="platform">
                <rect x="55" y="85" width="110" height="8" fill="#8d6e63" />
                <rect x="60" y="93" width="10" height="25" fill="#5d4037" />
                <rect x="150" y="93" width="10" height="25" fill="#5d4037" />
                <rect x="55" y="75" width="4" height="10" fill="#a1887f" />
                <rect x="161" y="75" width="4" height="10" fill="#a1887f" />
                <rect x="55" y="74" width="110" height="2" fill="#d7ccc8" />
              </g>
            ) : (
              <rect x="70" y="88" width="80" height="4" fill="#8d6e63" opacity="0.3" />
            )}

            {/* Stage 3: Cabin Walls & Window (pct >= 60) */}
            {pct >= 60 ? (
              <g id="cabin-walls">
                <rect x="75" y="45" width="70" height="40" fill="#a1887f" />
                {/* Planks texture */}
                <line x1="75" y1="55" x2="145" y2="55" stroke="#8d6e63" strokeWidth="1" />
                <line x1="75" y1="65" x2="145" y2="65" stroke="#8d6e63" strokeWidth="1" />
                <line x1="75" y1="75" x2="145" y2="75" stroke="#8d6e63" strokeWidth="1" />
                {/* Window */}
                <rect x="110" y="52" width="16" height="16" fill="#81d4fa" />
                <line x1="118" y1="52" x2="118" y2="68" stroke="#455a64" strokeWidth="1" />
                <line x1="110" y1="60" x2="126" y2="60" stroke="#455a64" strokeWidth="1" />
                {/* Doorway */}
                <rect x="85" y="58" width="14" height="27" fill="#4e342e" />
              </g>
            ) : (
              <rect x="85" y="65" width="50" height="20" fill="#a1887f" opacity="0.2" />
            )}

            {/* Stage 4: Roof (pct >= 80) */}
            {pct >= 80 ? (
              <g id="roof">
                <polygon points="110,25 65,48 155,48" fill="#c62828" />
                <polygon points="110,25 70,48 110,48" fill="#b71c1c" opacity="0.3" />
                <polygon points="110,23 63,48 157,48" fill="none" stroke="#ef5350" strokeWidth="2" />
              </g>
            ) : null}

            {/* Stage 5: Flag, Lantern & Celebration (pct >= 100) */}
            {pct >= 100 && (
              <g id="decorations">
                {/* Flagpole & Flag */}
                <line x1="110" y1="25" x2="110" y2="10" stroke="#cfd8dc" strokeWidth="2" />
                <polygon points="110,10 128,15 110,20" fill="#fbc02d" />
                {/* Lantern */}
                <rect x="62" y="78" width="6" height="8" fill="#ffb300" />
                <rect x="64" y="80" width="2" height="4" fill="#fff9c4" />
                {/* Confetti Pixels */}
                <rect x="30" y="25" width="4" height="4" fill="#f44336" />
                <rect x="180" y="35" width="4" height="4" fill="#2196f3" />
                <rect x="45" y="60" width="3" height="3" fill="#ffeb3b" />
                <rect x="175" y="70" width="3" height="3" fill="#4caf50" />
                <rect x="110" y="5" width="3" height="3" fill="#e91e63" />
              </g>
            )}
          </svg>

          <span style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
            {pct < 20 && "Paso 1: Preparando los cimientos del árbol"}
            {pct >= 20 && pct < 40 && "Paso 2: Escalera de madera instalada (+20%)"}
            {pct >= 40 && pct < 60 && "Paso 3: Plataforma y vigas fijadas (+40%)"}
            {pct >= 60 && pct < 80 && "Paso 4: Paredes y ventana montadas (+60%)"}
            {pct >= 80 && pct < 100 && "Paso 5: Tejado rojo casi terminado (+80%)"}
            {pct >= 100 && "¡Cabaña completa! ¡Bandera al viento y farol encendido!"}
          </span>
        </div>

        {/* Big Progress Bar */}
        <div style={{ width: "100%", maxWidth: 440 }}>
          <div
            style={{
              height: 18,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 10,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.12)",
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                background: isCompleted
                  ? "linear-gradient(90deg, #10b981, #f59e0b)"
                  : "linear-gradient(90deg, #3b82f6, #10b981)",
                transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 0 12px rgba(74, 222, 128, 0.5)",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              marginTop: 6,
              fontWeight: 700,
              color: "var(--ink)",
            }}
          >
            <span>{pct}% Completado</span>
            <span>Objetivo: {activeProject.targetPoints} pts</span>
          </div>
        </div>

        {/* Collective Reward Banner */}
        <div
          style={{
            background: "rgba(245, 158, 11, 0.12)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            borderRadius: 12,
            padding: "12px 16px",
            width: "100%",
            maxWidth: 440,
            display: "flex",
            alignItems: "center",
            gap: 12,
            textAlign: "left",
          }}
        >
          <span style={{ fontSize: 28 }}>🍕</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase" }}>
              Recompensa para toda la familia al finalizar
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>
              {activeProject.rewardTitle}
            </div>
          </div>
        </div>
      </div>

      {/* Contributions Breakdown */}
      <section className="panel">
        <span className="eyebrow">EQUIPO FAMILIAR</span>
        <h3>Ladrillos aportados por cada miembro</h3>
        <p className="muted" style={{ marginBottom: 14 }}>
          Cada vez que un peque realiza y valida una rutina diaria, suma automáticamente madera a este proyecto común sin restar sus puntos individuales.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
          {family.children.map((child) => {
            const contrib = activeProject.contributions?.find((c) => c.memberId === child.id);
            const points = contrib ? contrib.points : 0;
            return (
              <div
                key={child.id}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--edge)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{child.avatar}</span>
                  <div>
                    <strong style={{ fontSize: 13, color: "var(--ink)" }}>{child.name}</strong>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>Nivel {child.level}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className="pill green" style={{ fontSize: 12, fontWeight: 700 }}>
                    +{points} 🪵
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Parent Project Management */}
      {parent && (
        <section className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className="eyebrow">CONTROL PARENTAL</span>
              <h3 style={{ margin: 0 }}>Crear un nuevo proyecto familiar</h3>
            </div>
            <button
              type="button"
              className="button secondary small"
              onClick={() => {
                hapticTap();
                playTap();
                setShowNewForm((v) => !v);
              }}
            >
              {showNewForm ? "Cancelar" : "+ Nuevo proyecto"}
            </button>
          </div>

          {showNewForm && (
            <div style={{ marginTop: 16, borderTop: "1px dashed var(--edge)", paddingTop: 16 }}>
              <ActionForm operation="add-project" label="Crear proyecto familiar">
                <div className="form-grid">
                  <label>
                    Título del proyecto
                    <input
                      name="titulo"
                      placeholder="Ej: Montar la Tienda Tipí en el Salón"
                      required
                      maxLength={120}
                    />
                  </label>
                  <label>
                    Puntos objetivo
                    <input
                      name="puntos"
                      type="number"
                      min="5"
                      max="1000"
                      defaultValue="50"
                      required
                    />
                  </label>
                </div>

                <div className="form-grid">
                  <label>
                    Premio conjunto al terminar
                    <input
                      name="premio"
                      placeholder="Ej: Noche de acampada con historias y chocolate"
                      required
                      maxLength={120}
                    />
                  </label>
                  <label>
                    Descripción
                    <input
                      name="descripcion"
                      placeholder="Ej: Entre todos sumamos puntos para montar un campamento en el salón"
                      maxLength={300}
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="button primary"
                  style={{ marginTop: 8 }}
                  onClick={() => {
                    hapticSuccess();
                    playLevelUp();
                    setShowNewForm(false);
                  }}
                >
                  Iniciar este proyecto familiar
                </button>
              </ActionForm>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
