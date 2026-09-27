"use client";

import { useState } from "react";
import { ActionForm } from "./portal-form";
import { petCatalog, petStageLabels, petItemsCatalog, type Child, type Snapshot } from "@/lib/model";
import { PixelPet } from "./pixel-pet";
import { Icon } from "./icon";
import { playPetFeed, playTap, playLevelUp } from "@/lib/sound";
import { hapticSuccess, hapticTap } from "@/lib/haptics";

export function PetConsole({ child }: { child: Child }) {
  const [activeTab, setActiveTab] = useState<"play" | "feed" | "shop">("play");
  const pet = child.pet;

  if (!pet) {
    return (
      <div className="panel pet-select-panel">
        <div className="section-heading compact">
          <h3><Icon name="pet" /> ¡Mascota virtual para {child.name}!</h3>
          <span className="muted">Adopta una mascota 8-bits para acompañarte en tus rutinas</span>
        </div>
        <p>Tu mascota crecerá y evolucionará cuando completes y apruebes tus tareas diarias.</p>
        <ActionForm operation="choose-pet" label="Elegir mascota" values={{ childId: child.id }}>
          <div className="pet-grid">
            {petCatalog.map((p) => (
              <label key={p.type} className="pet-choice">
                <input type="radio" name="petType" value={p.type} defaultChecked={p.type === "fox"} />
                <span className="pet-emoji">
                  <PixelPet type={p.type} stage="baby" size={48} />
                </span>
                <span className="pet-name">{p.name}</span>
              </label>
            ))}
          </div>
          <label>
            Nombre de tu mascota:
            <input name="petName" placeholder="Ej: Chispa" required maxLength={40} />
          </label>
          <button type="submit" className="button primary centered">
            🐣 Adoptar mi mascota 8-Bits
          </button>
        </ActionForm>
      </div>
    );
  }

  const stageInfo = petStageLabels[pet.stage] || { emoji: "🐣", label: "Bebé" };
  const happiness = pet.happiness ?? 80;
  const fullness = pet.fullness ?? 80;
  const energy = pet.energy ?? 3;
  const maxEnergy = pet.maxEnergy ?? 5;
  const equippedIds = pet.equippedAccessories || [];
  const unlockedIds = pet.unlockedItems || [];
  const equippedItems = petItemsCatalog.filter((i) => equippedIds.includes(i.id));

  // Nighttime sleep detection (21:00 to 08:00)
  const currentHour = new Date().getHours();
  const isSleepingTime = currentHour >= 21 || currentHour < 8;

  // Determine pet mood & speech bubble text
  let moodEmoji = "❤️";
  let moodText = "¡Me siento genial contigo!";
  let petMood: "happy" | "sleepy" | "celebrating" | "normal" = "happy";

  if (isSleepingTime) {
    moodEmoji = "💤";
    moodText = "Zzz... Tu mascota descansa hasta la mañana. ¡Recargando sueños!";
    petMood = "sleepy";
  } else if (pet.stage === "egg") {
    moodEmoji = "🥚";
    moodText = "¡Completa tareas diarias para ayudarme a eclosionar a Bebé (25 XP)!";
    petMood = "normal";
  } else if (energy <= 0) {
    moodEmoji = "😴";
    moodText = "¡Necesito energía! Completa tareas para jugar juntos ⚡";
    petMood = "sleepy";
  } else if (happiness < 30 || fullness < 30) {
    moodEmoji = "💤";
    moodText = "Tengo un poco de hambre y sueño...";
    petMood = "normal";
  } else if (happiness >= 90 && fullness >= 90) {
    moodEmoji = "🎉";
    moodText = "¡Estoy al máximo de energía y súper feliz!";
    petMood = "celebrating";
  } else if (fullness < 60) {
    moodEmoji = "😋";
    moodText = "¡Una galletita no estaría nada mal!";
    petMood = "happy";
  }

  const foodItems = petItemsCatalog.filter((i) => i.category === "food");
  const accessoryItems = petItemsCatalog.filter((i) => i.category === "accessory");

  return (
    <div className="pet-tamagotchi-panel">
      <div className="tamagotchi-header">
        <div className="tamagotchi-brand">
          <span className="tamagotchi-led" />
          <h3>TAMAGOTCHI DE {pet.name.toUpperCase()} (8-BITS)</h3>
        </div>
        <span className="pet-stage-badge">{stageInfo.emoji} Etapa {stageInfo.label}</span>
      </div>

      {/* Retro Screen Display */}
      <div className="tamagotchi-screen">
        <div className="pet-display-area">
          {/* Equipped Accessories Floating Tags */}
          {equippedItems.length > 0 && (
            <div className="equipped-floating-accessories">
              {equippedItems.map((acc) => (
                <span key={acc.id} className="acc-tag" title={acc.name}>{acc.emoji}</span>
              ))}
            </div>
          )}

          {/* Pet Main Avatar 8-bit Sprite */}
          <div className="pet-character-avatar" key={happiness + fullness + energy + equippedIds.length + pet.stage}>
            <PixelPet type={pet.type} stage={pet.stage} accessories={equippedIds} mood={petMood} size={140} />
          </div>

          {/* Speech Bubble */}
          <div className="pet-speech-bubble">
            <span>{moodEmoji} {moodText}</span>
          </div>
        </div>

        {/* Pet Status Meters */}
        <div className="pet-meters-grid">
          <div className="pet-meter">
            <span className="meter-label">Energía ⚡ {energy} / {maxEnergy}</span>
            <div className="meter-track">
              <div className="meter-fill energy" style={{ width: `${Math.round((energy / maxEnergy) * 100)}%` }} />
            </div>
          </div>

          <div className="pet-meter">
            <span className="meter-label">Felicidad ❤️ {happiness}%</span>
            <div className="meter-track">
              <div className="meter-fill happiness" style={{ width: `${happiness}%` }} />
            </div>
          </div>

          <div className="pet-meter">
            <span className="meter-label">Saciedad 🍗 {fullness}%</span>
            <div className="meter-track">
              <div className="meter-fill fullness" style={{ width: `${fullness}%` }} />
            </div>
          </div>

          <div className="pet-meter">
            <span className="meter-label">Etapa {stageInfo.emoji} {stageInfo.label} ({pet.xp} XP)</span>
            <div className="meter-track">
              <div className="meter-fill xp" style={{ width: `${Math.min(100, Math.round((pet.xp / 150) * 100))}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons / Console Tabs */}
      <div className="tamagotchi-tabs">
        <button
          className={`tamagotchi-tab ${activeTab === "play" ? "active" : ""}`}
          onClick={() => {
            hapticTap();
            playTap();
            setActiveTab("play");
          }}
        >
          🎮 Jugar (⚡{energy})
        </button>
        <button
          className={`tamagotchi-tab ${activeTab === "feed" ? "active" : ""}`}
          onClick={() => {
            hapticTap();
            playTap();
            setActiveTab("feed");
          }}
        >
          🍎 Alimentar
        </button>
        <button
          className={`tamagotchi-tab ${activeTab === "shop" ? "active" : ""}`}
          onClick={() => {
            hapticTap();
            playTap();
            setActiveTab("shop");
          }}
        >
          👑 Armario 8-Bits
        </button>
      </div>

      {/* Tab Content */}
      <div className="tamagotchi-body">
        {activeTab === "play" && (
          <div className="tab-pane play-pane">
            <p>Demuéstrale tu cariño a <strong>{pet.name}</strong> acariciándole o jugando juntos.</p>
            <div className="energy-notice">
              <span>⚡ Energía disponible: <strong>{energy} de {maxEnergy}</strong></span>
              <small>Cada tarea diaria completada y aprobada otorga <strong>+1 punto de energía ⚡</strong> a tu mascota.</small>
            </div>
            <ActionForm operation="play-pet" label="Jugar con la mascota" values={{ childId: child.id }}>
              <button type="submit" className="button primary pet-action-btn" disabled={energy <= 0}>
                {energy > 0
                  ? `👋 Acariciar y jugar con ${pet.name} (-1 ⚡, +15 Felicidad, +2 XP)`
                  : `⚡ Sin energía (Completa tareas para recargar)`}
              </button>
            </ActionForm>
          </div>
        )}

        {activeTab === "feed" && (
          <div className="tab-pane feed-pane">
            <p className="pane-intro">Alimenta a tu mascota para subir su nivel de saciedad y felicidad. Saldo actual: <strong>{child.balance} pts</strong></p>
            <div className="items-grid">
              {foodItems.map((food) => {
                const cannotAfford = food.cost > 0 && child.balance < food.cost;
                return (
                  <div className="item-card" key={food.id}>
                    <span className="item-emoji">{food.emoji}</span>
                    <div className="item-details">
                      <strong>{food.name}</strong>
                      <span className="item-bonus">
                        +{food.fullnessBonus} Saciedad · +{food.happinessBonus} Felicidad
                        {food.xpBonus > 0 ? ` · +${food.xpBonus} XP` : ""}
                      </span>
                      <span className="item-price">
                        {food.cost === 0 ? "Gratis" : `${food.cost} puntos`}
                      </span>
                    </div>
                    <ActionForm operation="feed-pet" label={`Dar ${food.name}`} values={{ childId: child.id, itemId: food.id }}>
                      <button
                        type="submit"
                        className="button secondary small"
                        disabled={cannotAfford}
                        onClick={() => {
                          if (!cannotAfford) {
                            hapticSuccess();
                            playPetFeed();
                          }
                        }}
                      >
                        {cannotAfford ? "Faltan pts" : "Dar comida"}
                      </button>
                    </ActionForm>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "shop" && (
          <div className="tab-pane shop-pane">
            <p className="pane-intro">Desbloquea accesorios para vestir a {pet.name}. Saldo: <strong>{child.balance} pts</strong></p>
            <div className="items-grid">
              {accessoryItems.map((acc) => {
                const isUnlocked = unlockedIds.includes(acc.id);
                const isEquipped = equippedIds.includes(acc.id);
                const cannotAfford = acc.cost > 0 && child.balance < acc.cost;

                return (
                  <div className={`item-card ${isEquipped ? "equipped" : ""}`} key={acc.id}>
                    <span className="item-emoji">{acc.emoji}</span>
                    <div className="item-details">
                      <strong>{acc.name}</strong>
                      <span className="item-bonus">+{acc.happinessBonus} Felicidad</span>
                      <span className="item-price">{isUnlocked ? "Comprado" : `${acc.cost} puntos`}</span>
                    </div>
                    {isUnlocked ? (
                      <ActionForm operation="equip-pet-item" label={`Equipar ${acc.name}`} values={{ childId: child.id, itemId: acc.id }}>
                        <button type="submit" className={`button small ${isEquipped ? "primary" : "secondary"}`}>
                          {isEquipped ? "Quitar ✕" : "Poner ✨"}
                        </button>
                      </ActionForm>
                    ) : (
                      <ActionForm operation="buy-pet-item" label={`Comprar ${acc.name}`} values={{ childId: child.id, itemId: acc.id }}>
                        <button type="submit" className="button secondary small" disabled={cannotAfford}>
                          {cannotAfford ? "Faltan pts" : `Comprar (${acc.cost} pts)`}
                        </button>
                      </ActionForm>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function PetView({ snapshot }: { snapshot: Snapshot }) {
  const { family, user } = snapshot;
  const parent = user.role === "parent";
  const children = family.children;
  const [selectedChildId, setSelectedChildId] = useState<string>(children[0]?.id || "");

  const activeChild = children.find((c) => c.id === selectedChildId) || children[0];

  if (!children.length) {
    return (
      <section className="panel">
        <p>Añade primero a tus hijos en la sección de familia para gestionar sus mascotas.</p>
      </section>
    );
  }

  return (
    <div className="pet-view-container">
      {parent && children.length > 1 && (
        <div className="filters" style={{ marginBottom: 16 }}>
          {children.map((c) => (
            <button
              key={c.id}
              className={selectedChildId === c.id || (!selectedChildId && children[0].id === c.id) ? "selected" : ""}
              onClick={() => setSelectedChildId(c.id)}
            >
              {c.avatar} Mascota de {c.name}
            </button>
          ))}
        </div>
      )}

      {activeChild && <PetConsole child={activeChild} />}
    </div>
  );
}
