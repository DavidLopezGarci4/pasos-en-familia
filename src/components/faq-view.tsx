"use client";

import React, { useState, useMemo } from "react";
import { Icon } from "./icon";
import { hapticTap } from "../lib/haptics";

export interface FAQItem {
  id: string;
  question: string;
  bullets: string[];
  tags?: string[];
  badge?: string;
  actionLink?: {
    label: string;
    routeOrAction: string;
  };
}

export interface FAQSection {
  id: string;
  title: string;
  iconName?: string;
  description?: string;
  items: FAQItem[];
}

export const FAQ_DATA: FAQSection[] = [
  {
    id: "seguridad",
    title: "Seguridad y Almacenamiento Offline",
    iconName: "🛡️",
    description: "Privacidad infantil garantizada, sin servidores ni rastreo",
    items: [
      {
        id: "offline-storage",
        question: "¿Dónde se guardan los datos de mi familia y de mis hijos?",
        bullets: [
          "Almacenamiento 100% local: todos los perfiles, rutinas, acuerdos y fotos se guardan exclusivamente en la memoria interna de tu dispositivo Android.",
          "Cero servidores externos: no existe base de datos en la nube ni envío de telemetría a terceros.",
          "Privacidad infantil total: diseñado bajo el principio de soberanía de datos y protección absoluta a la infancia.",
        ],
        tags: ["privacidad", "datos", "offline", "servidor", "nube", "hijos", "seguridad", "local"],
        badge: "100% Local",
      },
      {
        id: "airplane-mode",
        question: "¿Qué ocurre si no tengo conexión a internet o activo el modo avión?",
        bullets: [
          "Funcionamiento autónomo ininterrumpido: todas las pantallas, sonidos, temporizadores y mascotas operan sin red.",
          "Cero latencias: la aplicación responde al instante sin depender de conexiones Wi-Fi o cobertura móvil.",
        ],
        tags: ["internet", "avion", "offline", "red", "wifi", "cobertura"],
      },
    ],
  },
  {
    id: "perfiles-pin",
    title: "Perfiles, Selector y PIN Parental",
    iconName: "👥",
    description: "Separación clara entre roles de adulto e hijo con protección por PIN",
    items: [
      {
        id: "pin-parental",
        question: "¿Cómo funciona el PIN de control parental?",
        bullets: [
          "Bloqueo seguro de 4 dígitos: impide que los menores alteren la configuración, creen acuerdos o modifiquen puntos.",
          "Teclado táctil interactivo con vibración háptica y sacudida animada ante intentos fallidos.",
          "Modificación rápida: el adulto puede cambiar su PIN en cualquier momento desde «Ajustes» → «Seguridad y Control Parental».",
        ],
        tags: ["pin", "padres", "adulto", "bloqueo", "seguridad", "parental", "contraseña"],
        badge: "Seguridad",
        actionLink: {
          label: "Ir a Ajustes",
          routeOrAction: "settings",
        },
      },
      {
        id: "selector-usuarios",
        question: "¿Cómo cambiar rápidamente entre miembros de la familia?",
        bullets: [
          "Pulsa sobre tu nombre en el menú lateral o cabecera para desplegar el selector de usuarios.",
          "El paso hacia cualquier perfil infantil es instantáneo y sin fricción.",
          "Para volver al perfil de adulto se requiere obligatoriamente introducir el PIN de seguridad.",
        ],
        tags: ["cambiar", "usuario", "perfil", "hijo", "familia", "selector"],
        actionLink: {
          label: "Ver Familia",
          routeOrAction: "family",
        },
      },
    ],
  },
  {
    id: "rutinas-tareas",
    title: "Rutinas, Tareas y Asistente Guiado",
    iconName: "📋",
    description: "Creación de acuerdos observables y acompañamiento con temporizador",
    items: [
      {
        id: "crear-rutinas",
        question: "¿Cómo se crean acuerdos y rutinas diarias?",
        bullets: [
          "Desde la sección «Rutinas y tareas» del perfil de adulto.",
          "Cada acuerdo define: título claro, puntos otorgados (1 a 100), señal o momento del día (ej. «Antes de cenar») y primer paso pequeño.",
          "Admite frecuencia diaria o puntual, y revisión automática o manual por parte del adulto.",
        ],
        tags: ["rutinas", "tareas", "acuerdos", "crear", "habitos", "pasos"],
        actionLink: {
          label: "Gestionar Rutinas",
          routeOrAction: "tasks",
        },
      },
      {
        id: "asistente-guiado",
        question: "¿Qué es el Asistente de Rutinas a pantalla completa?",
        bullets: [
          "Modo de enfoque sin distracciones que guía al niño paso a paso por sus tareas del día.",
          "Incluye un temporizador pixel-art con micro-vibraciones hápticas.",
          "Al culminar todos los pasos, celebra con un motor de confeti físico a 60 FPS en Canvas 2D.",
        ],
        tags: ["asistente", "temporizador", "confeti", "rutina", "focus", "niño", "pantalla completa"],
        badge: "Recomendado",
      },
    ],
  },
  {
    id: "notificaciones-shortcuts",
    title: "Notificaciones y Atajos de Android",
    iconName: "🔔",
    description: "Acciones interactivas en la cortina del sistema y accesos directos",
    items: [
      {
        id: "notificaciones-accionables",
        question: "¿Qué son las notificaciones accionables de Android?",
        bullets: [
          "Los recordatorios en la cortina de notificaciones incluyen botones directos sin abrir la app.",
          "Botón «✓ Marcar Hecha»: registra el paso como completado instantáneamente.",
          "Botón «⏰ Posponer 15m»: reprograma un recordatorio amable para un cuarto de hora después.",
        ],
        tags: ["notificaciones", "accionables", "posponer", "recordatorio", "cortina", "android"],
        badge: "Android Nativo",
      },
      {
        id: "app-shortcuts",
        question: "¿Cómo funcionan los atajos del lanzador (App Shortcuts)?",
        bullets: [
          "Mantén pulsado el icono de Pasos en la pantalla de inicio de tu smartphone.",
          "Accede de inmediato a: «Rutinas» (asistente directo) o «Mascota» (consola de cuidados).",
        ],
        tags: ["atajos", "shortcuts", "icono", "lanzador", "pantalla inicio"],
      },
    ],
  },
  {
    id: "barra-progreso",
    title: "Barra de Progreso y Reconocimiento",
    iconName: "📈",
    description: "Evaluación diaria de 0 a 100 independiente del saldo de premios",
    items: [
      {
        id: "barra-zonas",
        question: "¿Cómo se interpretan las zonas de la barra de progreso?",
        bullets: [
          "Cada día arranca en un nivel base neutro de 50 puntos.",
          "Zona acordada (60 puntos): cumplimiento satisfactorio de los acuerdos diarios.",
          "Zona meta (85 puntos): reconocimiento especial a la iniciativa y autonomía sobresaliente.",
        ],
        tags: ["progreso", "barra", "esfuerzo", "puntos", "meta", "50", "60", "85"],
      },
      {
        id: "diferencia-saldo",
        question: "¿Qué diferencia hay entre la barra y el saldo de recompensas?",
        bullets: [
          "La barra mide el esfuerzo diario (termómetro de 0 a 100).",
          "El saldo acumula los puntos conseguidos para canjear en el catálogo de premios.",
          "Los ajustes negativos en la barra nunca restan saldo de premios ya consolidado por el hijo.",
        ],
        tags: ["saldo", "barra", "recompensas", "canje", "premios", "puntos"],
      },
    ],
  },
  {
    id: "mascota-virtual",
    title: "Mascota Virtual 8-Bits y Sensor Físico",
    iconName: "🐾",
    description: "Compañero pixel-art con acelerómetro (Shake to Play)",
    items: [
      {
        id: "adopcion-evolucion",
        question: "¿Cómo evoluciona la mascota virtual pixel-art?",
        bullets: [
          "El hijo puede elegir su especie favorita: 🦊 Zorro, 🐼 Panda, 🐉 Dragón, 🐱 Gato o 🦉 Búho.",
          "4 etapas evolutivas por XP: Huevo (0 XP) → Bebé (25 XP) → Juvenil (60 XP) → Adulto (120 XP).",
          "Cumplir acuerdos y tareas del día otorga energía para alimentarla, entrenarla y jugar.",
        ],
        tags: ["mascota", "pixel", "evolucion", "xp", "zorro", "panda", "dragon", "gato", "buho"],
        actionLink: {
          label: "Ver Mascota",
          routeOrAction: "pet",
        },
      },
      {
        id: "shake-to-play",
        question: "¿Cómo funciona el sensor físico Shake to Play?",
        bullets: [
          "En la pantalla de la mascota, agita físicamente tu smartphone Android para interactuar.",
          "El acelerómetro detecta el movimiento y juega con la mascota sumando +5 XP y +15 de felicidad con vibración háptica.",
        ],
        tags: ["shake", "agitar", "acelerometro", "sensor", "movimiento", "jugar", "fisico"],
        badge: "Sensor Nativo",
      },
    ],
  },
  {
    id: "recompensas",
    title: "Catálogo de Recompensas y Canjes",
    iconName: "🎁",
    description: "Canjes pactados con aprobación parental",
    items: [
      {
        id: "solicitar-premios",
        question: "¿Cómo se solicitan y aprueban los canjes?",
        bullets: [
          "El niño explora su catálogo de premios acordados y pulsa «Pedir canje» cuando tiene saldo suficiente.",
          "El adulto recibe la petición en la pestaña «Solicitudes», donde puede aprobarla, posponerla o marcarla como entregada.",
        ],
        tags: ["premios", "recompensas", "canjes", "solicitudes", "catalogo", "puntos"],
        actionLink: {
          label: "Ver Catálogo",
          routeOrAction: "rewards",
        },
      },
    ],
  },
  {
    id: "backups-saf",
    title: "Copias de Seguridad y Restauración SAF",
    iconName: "💾",
    description: "Respaldos en memoria interna, envío a Drive y restauración de archivos .json",
    items: [
      {
        id: "crear-backup",
        question: "¿Cómo respaldar los datos en el dispositivo?",
        bullets: [
          "En «Ajustes» pulsa «Guardar en almacenamiento» para escribir un snapshot en Documents/Pasos.",
          "También puedes pulsar «Compartir archivo» para enviarlo por WhatsApp o archivarlo en Google Drive.",
        ],
        tags: ["copia", "respaldo", "backup", "guardar", "json", "drive", "almacenamiento"],
        actionLink: {
          label: "Ir a Copias de Seguridad",
          routeOrAction: "settings",
        },
      },
      {
        id: "restaurar-saf",
        question: "¿Cómo restaurar una copia previa (.json)?",
        bullets: [
          "Desde la pantalla de bienvenida o en «Ajustes», pulsa «Restaurar copia (.json)».",
          "El explorador de archivos nativo de Android (SAF) te permitirá seleccionar el fichero para restaurar toda la familia al instante.",
        ],
        tags: ["restaurar", "saf", "importar", "archivo", "recuperar", "json"],
      },
    ],
  },
  {
    id: "ergonomia",
    title: "Ergonomía, Bloqueo 0.5 cm y Stack Nativo",
    iconName: "📱",
    description: "Reserva de bordes, gestos predictivos y diagnóstico de arquitectura",
    items: [
      {
        id: "bloqueo-medio-centimetro",
        question: "¿Para qué sirve la reserva física de 0.5 cm y el bloqueo vertical?",
        bullets: [
          "Reserva física obligatoria arriba y abajo para que el contenido jamás tape el reloj del sistema ni la barra de navegación de Android.",
          "Elimina el rebote elástico parásito (anti-overscroll) otorgando una sensación 100% nativa.",
          "Soporta navegación gestual moderna y gestos predictivos de Android 15.",
        ],
        tags: ["ergonomia", "bloqueo", "0.5cm", "reloj", "gestos", "overscroll", "margen", "android 15"],
        badge: "Ergonomía",
      },
      {
        id: "arquitectura-stack",
        question: "¿Cómo auditar la salud del stack tecnológico de la app?",
        bullets: [
          "En «Ajustes», pulsa «Stack Móvil Nativo» para desplegar el componente interactivo de arquitectura.",
          "Visualiza en tiempo real el grafo Canvas 2D con los 8 componentes clave (Capacitor 7, Haptics, Local Notifications, Storage, etc.).",
        ],
        tags: ["stack", "arquitectura", "canvas", "grafo", "salud", "diagnostico", "tecnico"],
        actionLink: {
          label: "Ver Arquitectura",
          routeOrAction: "settings",
        },
      },
    ],
  },
  {
    id: "verticons-icons",
    title: "Iconos Verticons y Versión Release",
    iconName: "💎",
    description: "Formato tarjeta 2:3 en 800×1200 y compilación dual de APKs",
    items: [
      {
        id: "verticons-standard",
        question: "¿Qué es el icono Verticons y en qué se diferencia del estándar?",
        bullets: [
          "Verticons presenta la app en formato de tarjeta coleccionable vertical con relación 2:3 estricta (800×1200 px).",
          "Ajustado a la zona segura adaptativa de Android (68% de altura) para que no se recorte ni sufra estiramientos en ningún lanzador.",
          "Cuenta con doble borde con acento esmeralda, pastilla de estado y emblema central flotante.",
        ],
        tags: ["verticons", "icono", "card", "2:3", "apk", "diseño", "anchura", "tarjeta"],
        badge: "Novedad v1.2.0",
      },
      {
        id: "dual-build",
        question: "¿Cómo se distribuyen y firman las versiones de la APK?",
        bullets: [
          "El pipeline dual de compilación genera y firma simultáneamente dos APKs con apksigner de Android:",
          "• pasos-v1.2.0-verticons-release.apk: con icono Verticons en tarjeta 2:3.",
          "• pasos-v1.2.0-standard-release.apk: con icono estándar (squircle con esquinas redondeadas).",
        ],
        tags: ["apk", "release", "firmado", "apksigner", "version", "dual", "standard"],
      },
    ],
  },
  {
    id: "acerca-novedades",
    title: "Acerca de Pasos y Novedades",
    iconName: "ℹ️",
    description: "Historial de versiones SemVer y notas orientadas al usuario",
    items: [
      {
        id: "modal-novedades",
        question: "¿Cómo consultar las novedades de la versión instalada?",
        bullets: [
          "Pulsa el botón «v1.2.0 · Novedades» en la barra superior o en «Ajustes».",
          "Explica los cambios recientes en un lenguaje claro para familias, sin tecnicismos.",
          "Incluye un historial desplegable en acordeón con los hitos de versiones previas (v1.1.1, v1.1.0, v1.0.0).",
        ],
        tags: ["novedades", "versiones", "acerca de", "changelog", "actualizacion", "semver"],
        actionLink: {
          label: "Ver Novedades",
          routeOrAction: "settings",
        },
      },
    ],
  },
];

interface FAQViewProps {
  onNavigate?: (view: string) => void;
}

export function FAQView({ onNavigate }: FAQViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("all");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Calcular total de guías
  const totalGuidesCount = useMemo(() => {
    return FAQ_DATA.reduce((acc, sec) => acc + sec.items.length, 0);
  }, []);

  // Filtrado reactivo inteligente
  const filteredSections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return FAQ_DATA.map((section) => {
      // Filtrar por sección si está seleccionada
      if (selectedSectionId !== "all" && section.id !== selectedSectionId) {
        return null;
      }

      if (!q) {
        return section;
      }

      const matchingItems = section.items.filter((item) => {
        const inQuestion = item.question.toLowerCase().includes(q);
        const inBullets = item.bullets.some((b) => b.toLowerCase().includes(q));
        const inTags = item.tags?.some((t) => t.toLowerCase().includes(q));
        const inBadge = item.badge?.toLowerCase().includes(q);
        const inTitle = section.title.toLowerCase().includes(q);

        return inQuestion || inBullets || inTags || inBadge || inTitle;
      });

      if (matchingItems.length === 0) return null;

      return {
        ...section,
        items: matchingItems,
      };
    }).filter(Boolean) as FAQSection[];
  }, [searchQuery, selectedSectionId]);

  // Total de guías coincidentes
  const matchingGuidesCount = useMemo(() => {
    return filteredSections.reduce((acc, sec) => acc + sec.items.length, 0);
  }, [filteredSections]);

  // Si hay búsqueda activa, auto-expandir items coincidentes
  const isSearching = searchQuery.trim().length > 0;

  const toggleItem = (itemId: string) => {
    hapticTap();
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const expandAll = () => {
    hapticTap();
    const allExpanded: Record<string, boolean> = {};
    FAQ_DATA.forEach((sec) => {
      sec.items.forEach((it) => {
        allExpanded[it.id] = true;
      });
    });
    setExpandedItems(allExpanded);
  };

  const collapseAll = () => {
    hapticTap();
    setExpandedItems({});
  };

  return (
    <div className="faq-root" style={{ width: "100%", maxWidth: "1280px", margin: "0 auto", paddingBottom: "40px" }}>
      {/* HEADER COMPACTO CON CONTADOR */}
      <div
        className="page-heading"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "18px",
        }}
      >
        <div>
          <div className="date-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>📖 GUÍA OFICIAL Y CENTRO DE AYUDA</span>
            <span
              style={{
                fontSize: "10px",
                background: "var(--sage)",
                color: "var(--green)",
                padding: "2px 8px",
                borderRadius: "10px",
                fontWeight: 700,
              }}
            >
              {totalGuidesCount} temas
            </span>
          </div>
          <h1 style={{ fontSize: "26px", margin: "4px 0 6px 0" }}>Preguntas Frecuentes y Manual Operativo</h1>
          <p style={{ margin: 0, fontSize: "13px", color: "var(--body)" }}>
            Consulta el funcionamiento de cada herramienta activa en Pasos Móvil v1.2.0.
          </p>
        </div>

        {/* CONTROLES GLOBALES EXPANDIR / COLAPSAR */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            className="button secondary small"
            onClick={expandAll}
            title="Expandir todas las preguntas"
            style={{ fontSize: "11px", minHeight: "36px", padding: "6px 12px" }}
          >
            <span>Expandir todo</span>
          </button>
          <button
            type="button"
            className="button secondary small"
            onClick={collapseAll}
            title="Colapsar todas las preguntas"
            style={{ fontSize: "11px", minHeight: "36px", padding: "6px 12px" }}
          >
            <span>Colapsar todo</span>
          </button>
        </div>
      </div>

      {/* BUSCADOR STICKY (TOP) */}
      <div
        style={{
          position: "sticky",
          top: "var(--safe-lock-top, 8px)",
          zIndex: 20,
          background: "rgba(247, 248, 244, 0.95)",
          backdropFilter: "blur(10px)",
          padding: "8px 0 12px 0",
          marginBottom: "12px",
        }}
      >
        <div style={{ position: "relative", width: "100%" }}>
          <div
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--muted)",
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Icon name="spark" size={16} />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar dudas, atajos, rutinas, PIN, sensor, backups..."
            aria-label="Buscar en el Centro de Ayuda"
            style={{
              width: "100%",
              padding: "12px 38px 12px 40px",
              fontSize: "14px",
              borderRadius: "12px",
              border: "1.5px solid var(--line)",
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                hapticTap();
                setSearchQuery("");
              }}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                border: 0,
                background: "var(--line)",
                borderRadius: "50%",
                width: "22px",
                height: "22px",
                display: "grid",
                placeItems: "center",
                fontSize: "12px",
                color: "var(--body)",
                cursor: "pointer",
              }}
              title="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        {/* FEEDBACK DE BÚSQUEDA */}
        {isSearching && (
          <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "6px", paddingLeft: "4px" }}>
            {matchingGuidesCount > 0 ? (
              <span>
                Mostrando <strong>{matchingGuidesCount}</strong> guías que coinciden con «{searchQuery}»
              </span>
            ) : (
              <span style={{ color: "var(--coral)" }}>
                No encontramos guías con «{searchQuery}». Prueba con otra palabra clave como <em>rutinas</em>, <em>pin</em> o <em>copia</em>.
              </span>
            )}
          </div>
        )}
      </div>

      {/* CHIPS DE FILTRO DE CATEGORÍAS (FLEX-WRAP: NUNCA SCROLL HORIZONTAL) */}
      <div
        className="faq-chips-container"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "20px",
        }}
      >
        <button
          type="button"
          onClick={() => {
            hapticTap();
            setSelectedSectionId("all");
          }}
          style={{
            padding: "8px 14px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: 600,
            border: selectedSectionId === "all" ? "1.5px solid var(--green)" : "1px solid var(--line)",
            background: selectedSectionId === "all" ? "var(--green)" : "#fff",
            color: selectedSectionId === "all" ? "#fff" : "var(--body)",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            minHeight: "38px",
            transition: "all 0.18s ease",
          }}
        >
          <span>🌟 Todos los Módulos</span>
          <span
            style={{
              fontSize: "10px",
              padding: "1px 6px",
              borderRadius: "10px",
              background: selectedSectionId === "all" ? "rgba(255,255,255,0.25)" : "var(--sage)",
              color: selectedSectionId === "all" ? "#fff" : "var(--green)",
            }}
          >
            {totalGuidesCount}
          </span>
        </button>

        {FAQ_DATA.map((sec) => {
          const isSelected = selectedSectionId === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => {
                hapticTap();
                setSelectedSectionId(sec.id);
              }}
              style={{
                padding: "8px 13px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: isSelected ? 700 : 500,
                border: isSelected ? "1.5px solid var(--green)" : "1px solid var(--line)",
                background: isSelected ? "var(--sage)" : "#fff",
                color: isSelected ? "var(--green)" : "var(--body)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                minHeight: "38px",
                transition: "all 0.18s ease",
              }}
            >
              <span>{sec.iconName}</span>
              <span>{sec.title}</span>
              <span
                style={{
                  fontSize: "10px",
                  padding: "1px 5px",
                  borderRadius: "8px",
                  background: isSelected ? "#fff" : "rgba(0,0,0,0.04)",
                  color: isSelected ? "var(--green)" : "var(--muted)",
                }}
              >
                {sec.items.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* ARQUITECTURA RESPONSIVE: SPLIT-VIEW EN PANTALLAS GRANDES Y COLUMNA EN MÓVIL */}
      <div
        className="faq-layout"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* LISTADO DE SECCIONES CON ACORDEÓN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
          {filteredSections.length === 0 ? (
            <div className="panel empty" style={{ padding: "40px 20px" }}>
              <div className="empty-icon">🔍</div>
              <h3>Sin coincidencias</h3>
              <p>No se encontraron respuestas para tu búsqueda. Intenta con términos generales como «rutinas», «mascota» o «ajustes».</p>
              <button
                type="button"
                className="button secondary small"
                onClick={() => setSearchQuery("")}
                style={{ marginTop: "12px" }}
              >
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            filteredSections.map((section) => (
              <section
                key={section.id}
                className="panel"
                style={{
                  padding: "20px 22px",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius)",
                  background: "#fff",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                }}
              >
                {/* CABECERA DE LA SECCIÓN */}
                <div style={{ marginBottom: "14px", borderBottom: "1px solid var(--line)", paddingBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "20px", lineHeight: 1 }}>{section.iconName}</span>
                      <h2 style={{ fontSize: "17px", margin: 0, color: "var(--ink)", fontWeight: 700 }}>
                        {section.title}
                      </h2>
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--muted)",
                        background: "var(--sage)",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontWeight: 600,
                      }}
                    >
                      {section.items.length} {section.items.length === 1 ? "tema" : "temas"}
                    </span>
                  </div>
                  {section.description && (
                    <p style={{ margin: "4px 0 0 28px", fontSize: "12px", color: "var(--muted)" }}>
                      {section.description}
                    </p>
                  )}
                </div>

                {/* LISTA DE PREGUNTAS EN ACORDEÓN */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {section.items.map((item) => {
                    const isOpen = isSearching ? true : !!expandedItems[item.id];

                    return (
                      <div
                        key={item.id}
                        style={{
                          border: isOpen ? "1.5px solid #c9d8be" : "1px solid var(--line)",
                          borderRadius: "12px",
                          overflow: "hidden",
                          background: isOpen ? "#fafbf8" : "#fff",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {/* BOTÓN PREGUNTA (TOUCH TARGET ACCESIBLE: MIN 46px) */}
                        <button
                          type="button"
                          onClick={() => toggleItem(item.id)}
                          aria-expanded={isOpen}
                          style={{
                            width: "100%",
                            minHeight: "46px",
                            padding: "12px 16px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "12px",
                            background: "none",
                            border: "none",
                            textAlign: "left",
                            cursor: "pointer",
                            fontSize: "13.5px",
                            fontWeight: 650,
                            color: "var(--ink)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, flexWrap: "wrap" }}>
                            <span>{item.question}</span>
                            {item.badge && (
                              <span
                                style={{
                                  fontSize: "9px",
                                  fontWeight: 700,
                                  background: "#eaf2e8",
                                  color: "var(--green)",
                                  padding: "2px 6px",
                                  borderRadius: "6px",
                                  letterSpacing: "0.4px",
                                }}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: "16px",
                              color: isOpen ? "var(--green)" : "var(--muted)",
                              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 0.22s ease",
                              flexShrink: 0,
                              lineHeight: 1,
                            }}
                          >
                            ▾
                          </span>
                        </button>

                        {/* CUERPO DE LA RESPUESTA (DESPLIEGUE VERTICAL SUAVE) */}
                        {isOpen && (
                          <div
                            style={{
                              padding: "0 16px 14px 16px",
                              borderTop: "1px solid rgba(0,0,0,0.04)",
                              marginTop: "2px",
                            }}
                          >
                            <ul
                              style={{
                                margin: "10px 0 0 0",
                                paddingLeft: "18px",
                                color: "var(--body)",
                                fontSize: "12.5px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "7px",
                                lineHeight: "1.55",
                              }}
                            >
                              {item.bullets.map((bullet, bIdx) => (
                                <li key={bIdx}>{bullet}</li>
                              ))}
                            </ul>

                            {/* ACCIÓN DIRECTA EN CASO DE DISPONER DE ENLACE */}
                            {item.actionLink && onNavigate && (
                              <div style={{ marginTop: "12px", paddingTop: "8px", borderTop: "1px dashed var(--line)" }}>
                                <button
                                  type="button"
                                  className="text-button"
                                  onClick={() => {
                                    hapticTap();
                                    onNavigate(item.actionLink!.routeOrAction);
                                  }}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    color: "var(--green)",
                                  }}
                                >
                                  <span>⚙️ {item.actionLink.label}</span>
                                  <span>→</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
