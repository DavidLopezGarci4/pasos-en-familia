"use client";

type PixelPetProps = {
  type: string;
  stage: "egg" | "baby" | "juvenile" | "adult";
  accessories?: string[];
  size?: number;
  className?: string;
  mood?: "happy" | "sleepy" | "celebrating" | "normal";
};

// Helper to render pixel rectangles on a 24x24 grid
function Px({ x, y, w = 1, h = 1, c }: { x: number; y: number; w?: number; h?: number; c: string }) {
  return <rect x={x} y={y} width={w} height={h} fill={c} />;
}

export function PixelPet({ type, stage, accessories = [], size = 96, className = "", mood = "normal" }: PixelPetProps) {
  // Palettes per pet type
  const palettes: Record<string, { primary: string; secondary: string; dark: string; light: string; eye: string; accent: string }> = {
    fox: { primary: "#d95f02", secondary: "#f7f7f7", dark: "#252525", light: "#ffa767", eye: "#1f2937", accent: "#b33f00" },
    panda: { primary: "#f9fafb", secondary: "#111827", dark: "#030712", light: "#ffffff", eye: "#111827", accent: "#4ad26d" },
    dragon: { primary: "#10b981", secondary: "#8b5cf6", dark: "#064e3b", light: "#6ee7b7", eye: "#f59e0b", accent: "#ef4444" },
    cat: { primary: "#f59e0b", secondary: "#fef3c7", dark: "#78350f", light: "#fde68a", eye: "#10b981", accent: "#ec4899" },
    owl: { primary: "#92400e", secondary: "#fef3c7", dark: "#451a03", light: "#d97706", eye: "#fbbf24", accent: "#6366f1" },
  };

  const pal = palettes[type] || palettes.fox;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`pixel-pet-svg ${className}`}
      shapeRendering="crispEdges"
      style={{ imageRendering: "pixelated" }}
    >
      {/* Sleepy Zzz overlay */}
      {mood === "sleepy" && (
        <g id="sleepy-overlay">
          <Px x={17} y={3} w={3} h={1} c="#93c5fd" />
          <Px x={18} y={4} w={1} h={1} c="#93c5fd" />
          <Px x={17} y={5} w={3} h={1} c="#93c5fd" />
          <Px x={20} y={1} w={3} h={1} c="#60a5fa" />
          <Px x={21} y={2} w={1} h={1} c="#60a5fa" />
          <Px x={20} y={3} w={3} h={1} c="#60a5fa" />
        </g>
      )}

      {/* Celebrating Sparkles overlay */}
      {mood === "celebrating" && (
        <g id="celebrate-overlay">
          <Px x={2} y={5} w={1} h={1} c="#fde047" />
          <Px x={1} y={6} w={3} h={1} c="#fde047" />
          <Px x={2} y={7} w={1} h={1} c="#fde047" />
          <Px x={21} y={7} w={1} h={1} c="#fde047" />
          <Px x={20} y={8} w={3} h={1} c="#fde047" />
          <Px x={21} y={9} w={1} h={1} c="#fde047" />
        </g>
      )}

      {/* 1. STAGE: EGG */}
      {stage === "egg" && (
        <g id="egg-stage">
          {/* Egg Shadow */}
          <Px x={7} y={20} w={10} h={1} c="#00000033" />
          {/* Egg Outline & Body */}
          <Px x={9} y={5} w={6} h={1} c={pal.dark} />
          <Px x={7} y={6} w={10} h={1} c={pal.dark} />
          <Px x={6} y={7} w={12} h={8} c={pal.dark} />
          <Px x={7} y={15} w={10} h={4} c={pal.dark} />
          <Px x={9} y={19} w={6} h={1} c={pal.dark} />

          {/* Egg Shell Fill */}
          <Px x={9} y={6} w={6} h={1} c={pal.secondary} />
          <Px x={7} y={7} w={10} h={8} c={pal.secondary} />
          <Px x={8} y={15} w={8} h={4} c={pal.secondary} />

          {/* Egg Spots & Species Color Details */}
          <Px x={9} y={8} w={2} h={2} c={pal.primary} />
          <Px x={14} y={11} w={2} h={2} c={pal.primary} />
          <Px x={11} y={14} w={3} h={2} c={pal.accent} />
          {/* Crack Pattern */}
          <Px x={11} y={8} w={1} h={2} c={pal.dark} />
          <Px x={12} y={10} w={1} h={2} c={pal.dark} />
        </g>
      )}

      {/* 2. STAGE: BABY (Small & Cute) */}
      {stage === "baby" && (
        <g id="baby-stage">
          {/* Shadow */}
          <Px x={7} y={20} w={10} h={1} c="#00000033" />
          {/* Ears */}
          <Px x={7} y={6} w={2} h={3} c={pal.primary} />
          <Px x={15} y={6} w={2} h={3} c={pal.primary} />
          <Px x={8} y={7} w={1} h={1} c={pal.secondary} />
          <Px x={15} y={7} w={1} h={1} c={pal.secondary} />

          {/* Head & Body Base */}
          <Px x={6} y={9} w={12} h={8} c={pal.primary} />
          <Px x={7} y={17} w={10} h={3} c={pal.primary} />

          {/* Face Chest White/Secondary */}
          <Px x={9} y={13} w={6} h={4} c={pal.secondary} />

          {/* Eyes & Nose */}
          <Px x={8} y={11} w={2} h={2} c={pal.dark} />
          <Px x={14} y={11} w={2} h={2} c={pal.dark} />
          <Px x={9} y={11} w={1} h={1} c="#ffffff" />
          <Px x={15} y={11} w={1} h={1} c="#ffffff" />
          <Px x={11} y={13} w={2} h={1} c={pal.accent} />

          {/* Paws */}
          <Px x={7} y={19} w={2} h={1} c={pal.dark} />
          <Px x={15} y={19} w={2} h={1} c={pal.dark} />
        </g>
      )}

      {/* 3. STAGE: JUVENILE (Mid Growth) */}
      {stage === "juvenile" && (
        <g id="juvenile-stage">
          {/* Shadow */}
          <Px x={5} y={21} w={14} h={1} c="#00000033" />

          {/* Tail */}
          {type === "fox" || type === "cat" ? (
            <>
              <Px x={17} y={12} w={4} h={3} c={pal.primary} />
              <Px x={19} y={10} w={3} h={3} c={pal.secondary} />
            </>
          ) : type === "dragon" ? (
            <Px x={17} y={14} w={4} h={2} c={pal.secondary} />
          ) : null}

          {/* Ears / Horns */}
          <Px x={6} y={4} w={3} h={4} c={pal.primary} />
          <Px x={15} y={4} w={3} h={4} c={pal.primary} />
          <Px x={7} y={5} w={1} h={2} c={pal.secondary} />
          <Px x={16} y={5} w={1} h={2} c={pal.secondary} />

          {/* Head */}
          <Px x={5} y={8} w={14} h={7} c={pal.primary} />
          {/* Cheeks / Secondary */}
          <Px x={8} y={12} w={8} h={3} c={pal.secondary} />

          {/* Body */}
          <Px x={6} y={15} w={12} h={5} c={pal.primary} />
          <Px x={9} y={15} w={6} h={4} c={pal.secondary} />

          {/* Eyes */}
          <Px x={8} y={10} w={2} h={2} c={pal.eye} />
          <Px x={14} y={10} w={2} h={2} c={pal.eye} />
          <Px x={8} y={10} w={1} h={1} c="#ffffff" />
          <Px x={14} y={10} w={1} h={1} c="#ffffff" />
          {/* Nose */}
          <Px x={11} y={12} w={2} h={1} c={pal.dark} />

          {/* Paws */}
          <Px x={6} y={20} w={3} h={1} c={pal.dark} />
          <Px x={15} y={20} w={3} h={1} c={pal.dark} />
        </g>
      )}

      {/* 4. STAGE: ADULT (Majestic & Fully Grown) */}
      {stage === "adult" && (
        <g id="adult-stage">
          {/* Golden Aura Sparkles */}
          <Px x={2} y={3} w={1} h={1} c="#fbbf24" />
          <Px x={21} y={4} w={1} h={1} c="#fbbf24" />
          <Px x={1} y={16} w={1} h={1} c="#fbbf24" />
          <Px x={22} y={17} w={1} h={1} c="#fbbf24" />

          {/* Shadow */}
          <Px x={4} y={21} w={16} h={1} c="#00000044" />

          {/* Big Bushy Tail / Wings */}
          {type === "fox" || type === "cat" ? (
            <>
              <Px x={17} y={10} w={5} h={5} c={pal.primary} />
              <Px x={19} y={8} w={4} h={4} c={pal.secondary} />
            </>
          ) : type === "dragon" ? (
            <>
              <Px x={2} y={8} w={4} h={6} c={pal.secondary} />
              <Px x={18} y={8} w={4} h={6} c={pal.secondary} />
            </>
          ) : type === "owl" ? (
            <>
              <Px x={3} y={11} w={3} h={7} c={pal.accent} />
              <Px x={18} y={11} w={3} h={7} c={pal.accent} />
            </>
          ) : null}

          {/* Tall Ears / Horns / Crown Trim */}
          <Px x={5} y={2} w={3} h={5} c={pal.primary} />
          <Px x={16} y={2} w={3} h={5} c={pal.primary} />
          <Px x={6} y={3} w={1} h={3} c={pal.secondary} />
          <Px x={17} y={3} w={1} h={3} c={pal.secondary} />

          {/* Head */}
          <Px x={4} y={7} w={16} h={8} c={pal.primary} />
          <Px x={7} y={12} w={10} h={3} c={pal.secondary} />

          {/* Body */}
          <Px x={5} y={15} w={14} h={5} c={pal.primary} />
          <Px x={8} y={15} w={8} h={5} c={pal.secondary} />

          {/* Eyes (Heroic / Sparkly) */}
          <Px x={7} y={9} w={3} h={3} c={pal.eye} />
          <Px x={14} y={9} w={3} h={3} c={pal.eye} />
          <Px x={7} y={9} w={1} h={1} c="#ffffff" />
          <Px x={14} y={9} w={1} h={1} c="#ffffff" />
          <Px x={8} y={10} w={1} h={1} c="#ffffff" />
          <Px x={15} y={10} w={1} h={1} c="#ffffff" />

          {/* Nose / Mouth */}
          <Px x={11} y={11} w={2} h={1} c={pal.dark} />

          {/* Boots / Feet */}
          <Px x={5} y={20} w={3} h={1} c={pal.dark} />
          <Px x={16} y={20} w={3} h={1} c={pal.dark} />
        </g>
      )}

      {/* 5. OVERLAID 8-BIT ACCESSORIES */}
      {accessories.includes("crown") && (
        <g id="acc-crown">
          <Px x={8} y={stage === "baby" ? 4 : stage === "juvenile" ? 2 : 0} w={8} h={3} c="#f59e0b" />
          <Px x={8} y={stage === "baby" ? 4 : stage === "juvenile" ? 2 : 0} w={2} h={1} c="#ef4444" />
          <Px x={11} y={stage === "baby" ? 4 : stage === "juvenile" ? 2 : 0} w={2} h={1} c="#3b82f6" />
          <Px x={14} y={stage === "baby" ? 4 : stage === "juvenile" ? 2 : 0} w={2} h={1} c="#ef4444" />
        </g>
      )}

      {accessories.includes("cap") && (
        <g id="acc-cap">
          <Px x={7} y={stage === "baby" ? 5 : 3} w={10} h={2} c="#ef4444" />
          <Px x={5} y={stage === "baby" ? 7 : 5} w={12} h={1} c="#dc2626" />
        </g>
      )}

      {accessories.includes("glasses") && (
        <g id="acc-glasses">
          <Px x={6} y={stage === "baby" ? 11 : stage === "juvenile" ? 10 : 9} w={5} h={2} c="#111827" />
          <Px x={13} y={stage === "baby" ? 11 : stage === "juvenile" ? 10 : 9} w={5} h={2} c="#111827" />
          <Px x={11} y={stage === "baby" ? 11 : stage === "juvenile" ? 10 : 9} w={2} h={1} c="#111827" />
        </g>
      )}

      {accessories.includes("bow") && (
        <g id="acc-bow">
          <Px x={10} y={15} w={4} h={2} c="#ec4899" />
          <Px x={8} y={14} w={2} h={4} c="#f472b6" />
          <Px x={14} y={14} w={2} h={4} c="#f472b6" />
        </g>
      )}

      {accessories.includes("wand") && (
        <g id="acc-wand">
          <Px x={2} y={10} w={1} h={8} c="#78350f" />
          <Px x={1} y={9} w={3} h={2} c="#f59e0b" />
          <Px x={0} y={8} w={1} h={1} c="#fef08a" />
          <Px x={4} y={8} w={1} h={1} c="#fef08a" />
        </g>
      )}
    </svg>
  );
}
