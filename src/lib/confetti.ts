import { hapticSuccess } from "./haptics";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  wobble: number;
  wobbleSpeed: number;
  opacity: number;
  shape: "rect" | "circle";
}

const PASOS_PALETTE = [
  "#416850", // Forest Green
  "#729879", // Sage
  "#f4be5e", // Gold / Star
  "#b96e53", // Coral
  "#fbefe4", // Peach
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#ec4899", // Rose
];

let activeCanvas: HTMLCanvasElement | null = null;
let animationId: number | null = null;

export function fireConfetti(options?: {
  count?: number;
  origin?: { x: number; y: number };
  spread?: number;
}) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  try {
    hapticSuccess();
  } catch {
    // Ignore if haptics unavailable
  }

  const count = options?.count ?? 65;
  const originX = options?.origin?.x ?? window.innerWidth / 2;
  const originY = options?.origin?.y ?? window.innerHeight * 0.45;

  let canvas = activeCanvas;
  if (!canvas || !document.body.contains(canvas)) {
    canvas = document.createElement("canvas");
    canvas.id = "pasos-confetti-canvas";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "99999";
    document.body.appendChild(canvas);
    activeCanvas = canvas;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * (Math.random() * 1.6 - 1.3)); // Upward arc
    const speed = Math.random() * 8 + 5;
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      w: Math.random() * 8 + 6,
      h: Math.random() * 6 + 4,
      color: PASOS_PALETTE[Math.floor(Math.random() * PASOS_PALETTE.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      wobble: 0,
      wobbleSpeed: Math.random() * 0.1 + 0.05,
      opacity: 1,
      shape: Math.random() > 0.35 ? "rect" : "circle",
    });
  }

  if (animationId) {
    cancelAnimationFrame(animationId);
  }

  let start: number | null = null;
  const duration = 2400; // ms

  function frame(timestamp: number) {
    if (!start) start = timestamp;
    const elapsed = timestamp - start;
    const progress = elapsed / duration;

    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let activeCount = 0;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // gravity
      p.vx *= 0.985; // friction
      p.rotation += p.rotationSpeed;
      p.wobble += p.wobbleSpeed;

      if (progress > 0.6) {
        p.opacity = Math.max(0, 1 - (progress - 0.6) / 0.4);
      }

      if (p.opacity > 0 && p.y < canvas.height + 20) {
        activeCount++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.scale(Math.sin(p.wobble), 1);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.shape === "rect") {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    if (activeCount > 0 && progress < 1) {
      animationId = requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      activeCanvas = null;
      animationId = null;
    }
  }

  animationId = requestAnimationFrame(frame);
}
