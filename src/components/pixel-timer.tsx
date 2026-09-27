"use client";

import React, { useState, useEffect, useRef } from "react";
import { hapticTap, hapticSuccess } from "../lib/haptics";
import { playTap, playTimerDone } from "../lib/sound";

interface PixelTimerProps {
  initialSeconds?: number;
  onComplete?: () => void;
  autoStart?: boolean;
  compact?: boolean;
}

export function PixelTimer({
  initialSeconds = 120,
  onComplete,
  autoStart = false,
  compact = false,
}: PixelTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [remaining, setRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync if initialSeconds changes
  useEffect(() => {
    setTotalSeconds(initialSeconds);
    setRemaining(initialSeconds);
    setIsRunning(autoStart);
  }, [initialSeconds, autoStart]);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      timerRef.current = setTimeout(() => {
        setRemaining((r) => r - 1);
      }, 1000);
    } else if (remaining === 0 && isRunning) {
      setIsRunning(false);
      hapticSuccess();
      playTimerDone();
      onComplete?.();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, remaining, onComplete]);

  const toggleRun = () => {
    hapticTap();
    setIsRunning((r) => !r);
  };

  const resetTimer = (sec = totalSeconds) => {
    hapticTap();
    setIsRunning(false);
    setRemaining(sec);
    setTotalSeconds(sec);
  };

  const addMinute = () => {
    hapticTap();
    setRemaining((r) => r + 60);
    setTotalSeconds((t) => t + 60);
  };

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timeFormatted = `${mins}:${secs < 10 ? "0" : ""}${secs}`;

  const pct = totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 0;
  const toneColor = pct > 40 ? "#4ad26d" : pct > 15 ? "#f59e0b" : "#ef4444";

  if (compact) {
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,0,0,0.3)", padding: "4px 10px", borderRadius: 8, border: `1px solid ${toneColor}44` }}>
        <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: "bold", color: toneColor }}>
          ⏱️ {timeFormatted}
        </span>
        <button
          type="button"
          onClick={toggleRun}
          style={{ background: "none", border: "none", color: "var(--ink)", fontSize: 12, cursor: "pointer", padding: 0 }}
        >
          {isRunning ? "⏸" : "▶"}
        </button>
      </div>
    );
  }

  // Circular SVG arc calculations
  const size = 180;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      {/* Preset duration buttons */}
      <div style={{ display: "flex", gap: 6 }}>
        {[60, 120, 300, 600].map((s) => (
          <button
            key={s}
            type="button"
            className="button secondary small"
            style={{
              padding: "4px 8px",
              fontSize: 11,
              borderColor: totalSeconds === s ? toneColor : undefined,
              color: totalSeconds === s ? toneColor : undefined,
            }}
            onClick={() => resetTimer(s)}
          >
            {s / 60}m
          </button>
        ))}
        <button
          type="button"
          className="button secondary small"
          style={{ padding: "4px 8px", fontSize: 11 }}
          onClick={addMinute}
          title="Añadir 1 minuto extra"
        >
          +1m
        </button>
      </div>

      {/* Retro Circular Countdown */}
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Animated remaining track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={toneColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.5s ease" }}
          />
        </svg>

        {/* Center Display */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: 32,
              fontWeight: 800,
              fontFamily: "monospace",
              letterSpacing: 1,
              color: toneColor,
              textShadow: `0 0 16px ${toneColor}44`,
            }}
          >
            {timeFormatted}
          </span>
          <span style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>
            {isRunning ? "En marcha" : remaining === 0 ? "¡Tiempo!" : "En pausa"}
          </span>
        </div>
      </div>

      {/* Main Play/Pause Control */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="button"
          className={`button small ${isRunning ? "secondary" : "primary"}`}
          onClick={toggleRun}
          style={{ minWidth: 90 }}
        >
          {isRunning ? "⏸ Pausar" : "▶ Iniciar"}
        </button>
        <button
          type="button"
          className="button secondary small"
          onClick={() => resetTimer()}
        >
          ↺ Reiniciar
        </button>
      </div>
    </div>
  );
}
