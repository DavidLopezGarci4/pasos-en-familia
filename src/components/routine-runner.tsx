"use client";

import React, { useState } from "react";
import type { Task, Child, Family } from "../lib/model";
import { taskRequest, taskChildIds } from "../lib/model";
import { PixelTimer } from "./pixel-timer";
import { PixelPet } from "./pixel-pet";
import { Icon } from "./icon";
import { hapticSuccess, hapticTap } from "../lib/haptics";
import { playTaskDone, playLevelUp, playTap } from "../lib/sound";
import { fireConfetti } from "../lib/confetti";

interface RoutineRunnerProps {
  family: Family;
  child: Child;
  today: string;
  onCompleteTask: (taskId: string, childId: string) => void;
  onClose: () => void;
}

export function RoutineRunner({
  family,
  child,
  today,
  onCompleteTask,
  onClose,
}: RoutineRunnerProps) {
  const [filterMode, setFilterMode] = useState<"all" | "morning" | "evening">("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedInSession, setCompletedInSession] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  // Filter tasks for this child
  const childTasks = family.tasks.filter((t) => t.active && taskChildIds(t).includes(child.id));

  // Further filter by routine mode if applicable
  const routineTasks = childTasks.filter((t) => {
    const text = (t.title + " " + t.cue).toLowerCase();
    if (filterMode === "morning") {
      return text.includes("mañana") || text.includes("despertar") || text.includes("desayun") || text.includes("cole") || text.includes("escuela");
    }
    if (filterMode === "evening") {
      return text.includes("noche") || text.includes("cenar") || text.includes("dormir") || text.includes("pijama") || text.includes("cama") || text.includes("dientes");
    }
    return true;
  });

  // Current list of pending tasks in this routine
  const pendingTasks = routineTasks.filter((t) => {
    const req = taskRequest(family, t, today, child.id);
    return !req || req.status !== "approved";
  });

  const currentTask = pendingTasks[currentIndex] || pendingTasks[0];

  const handleTaskDone = (taskId: string) => {
    hapticSuccess();
    playTaskDone();
    onCompleteTask(taskId, child.id);
    setCompletedInSession((prev) => [...prev, taskId]);

    // Check if that was the last task
    if (pendingTasks.length <= 1) {
      playLevelUp();
      fireConfetti({ count: 75 });
      setShowCelebration(true);
    } else {
      if (currentIndex >= pendingTasks.length - 1) {
        setCurrentIndex(0);
      }
    }
  };

  const handleNext = () => {
    hapticTap();
    if (currentIndex < pendingTasks.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "radial-gradient(circle at center, #0d261b 0%, #05120d 100%)",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        overscrollBehaviorY: "none",
        padding: "max(0.5cm, env(safe-area-inset-top, 20px)) 16px max(0.5cm, env(safe-area-inset-bottom, 20px)) 16px",
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: 520,
          width: "100%",
          margin: "0 auto",
          padding: "12px 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 24 }}>{child.avatar}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f3f7f2" }}>
              Rutina de {child.name}
            </div>
            <div style={{ fontSize: 11, color: "#a5b8aa" }}>
              {pendingTasks.length} {pendingTasks.length === 1 ? "tarea restante" : "tareas restantes"}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            hapticTap();
            playTap();
            onClose();
          }}
          className="button secondary small"
          style={{
            borderColor: "rgba(255,255,255,0.2)",
            color: "#f3f7f2",
            padding: "4px 10px",
            fontSize: 12,
          }}
        >
          ✕ Salir
        </button>
      </div>

      {/* Routine Mode Switcher (Pills) */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 6,
          maxWidth: 520,
          width: "100%",
          margin: "0 auto 16px auto",
        }}
      >
        <button
          type="button"
          onClick={() => {
            hapticTap();
            setFilterMode("all");
            setCurrentIndex(0);
          }}
          className={`button small ${filterMode === "all" ? "primary" : "secondary"}`}
          style={{ padding: "4px 10px", fontSize: 11 }}
        >
          ⭐ Todas ({childTasks.length})
        </button>
        <button
          type="button"
          onClick={() => {
            hapticTap();
            setFilterMode("morning");
            setCurrentIndex(0);
          }}
          className={`button small ${filterMode === "morning" ? "primary" : "secondary"}`}
          style={{ padding: "4px 10px", fontSize: 11 }}
        >
          ☀️ Mañana
        </button>
        <button
          type="button"
          onClick={() => {
            hapticTap();
            setFilterMode("evening");
            setCurrentIndex(0);
          }}
          className={`button small ${filterMode === "evening" ? "primary" : "secondary"}`}
          style={{ padding: "4px 10px", fontSize: 11 }}
        >
          🌙 Noche
        </button>
      </div>

      {/* Main Focus Area */}
      {showCelebration || !currentTask ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            maxWidth: 420,
            width: "100%",
            margin: "0 auto",
            textAlign: "center",
            gap: 18,
            animation: "fadeIn 0.5s ease",
          }}
        >
          <div style={{ transform: "scale(1.2)", marginBottom: 12 }}>
            <PixelPet
              type={child.pet?.type || "dragon"}
              stage={child.pet?.stage || "juvenile"}
              mood="celebrating"
              size={120}
            />
          </div>

          <span
            className="pill green"
            style={{ fontSize: 13, padding: "6px 14px", textTransform: "uppercase", letterSpacing: 1 }}
          >
            🎉 ¡Rutina Completada!
          </span>

          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#f3f7f2", margin: 0 }}>
            ¡Gran trabajo, {child.name}!
          </h2>

          <p style={{ fontSize: 14, color: "#a5b8aa", margin: 0, lineHeight: 1.5 }}>
            Has completado todas las tareas previstas de tu rutina. Has sumado puntos a tu saldo y ayudado al proyecto familiar.
          </p>

          <button
            type="button"
            className="button primary"
            style={{
              padding: "14px 28px",
              fontSize: 15,
              fontWeight: 700,
              boxShadow: "0 4px 20px rgba(74, 222, 128, 0.4)",
              marginTop: 10,
            }}
            onClick={() => {
              hapticSuccess();
              playTap();
              onClose();
            }}
          >
            Continuar al espacio familiar
          </button>
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: 460,
            width: "100%",
            margin: "0 auto",
            gap: 16,
            paddingBottom: 16,
          }}
        >
          {/* Pet Companion Feedback */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
            <PixelPet
              type={child.pet?.type || "cat"}
              stage={child.pet?.stage || "baby"}
              mood="happy"
              size={56}
            />
            <div
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: 12,
                padding: "8px 12px",
                fontSize: 12,
                color: "#e2e8f0",
                position: "relative",
              }}
            >
              ¡Vamos {child.name}! Un paso a la vez 🌟
            </div>
          </div>

          {/* Current Task Card */}
          <div
            style={{
              width: "100%",
              background: "var(--panel)",
              border: "1px solid var(--edge)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              borderRadius: 18,
              padding: 20,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "var(--green)",
                  background: "rgba(74, 210, 109, 0.12)",
                  padding: "4px 8px",
                  borderRadius: 6,
                }}
              >
                Paso {currentIndex + 1} de {pendingTasks.length}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#f59e0b",
                  background: "rgba(245, 158, 11, 0.12)",
                  padding: "4px 8px",
                  borderRadius: 6,
                }}
              >
                +{currentTask.points} pts
              </span>
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", margin: 0 }}>
              {currentTask.title}
            </h2>

            {/* Cue & First Step (Gollwitzer Implementation Intentions) */}
            <div
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.03)",
                border: "1px dashed var(--edge)",
                borderRadius: 12,
                padding: "10px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                textAlign: "left",
                fontSize: 12,
              }}
            >
              <div>
                <span style={{ color: "var(--muted)", fontWeight: 600 }}>🔔 Señal: </span>
                <span style={{ color: "var(--ink)" }}>{currentTask.cue || "Al empezar"}</span>
              </div>
              <div>
                <span style={{ color: "var(--green)", fontWeight: 600 }}>👣 Primer paso: </span>
                <span style={{ color: "var(--ink)", fontWeight: 500 }}>
                  {currentTask.firstStep || "Comenzar"}
                </span>
              </div>
            </div>

            {/* Integrated PixelTimer */}
            <div style={{ margin: "8px 0" }}>
              <PixelTimer
                initialSeconds={currentTask.points >= 10 ? 300 : 120}
                autoStart={false}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              type="button"
              className="button primary full"
              style={{
                padding: "16px",
                fontSize: 16,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                boxShadow: "0 6px 20px rgba(74, 210, 109, 0.3)",
              }}
              onClick={() => handleTaskDone(currentTask.id)}
            >
              <span>✓</span>
              <span>¡Paso completado! (+{currentTask.points} pts)</span>
            </button>

            {pendingTasks.length > 1 && (
              <button
                type="button"
                className="button secondary full"
                style={{ padding: "10px", fontSize: 12 }}
                onClick={handleNext}
              >
                Saltar a la siguiente por ahora →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
