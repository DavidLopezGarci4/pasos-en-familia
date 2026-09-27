// Theme management supporting Light, Dark (Forest), and High-Contrast (WCAG AAA)
export type AppTheme = "light" | "dark" | "high-contrast";

const THEME_KEY = "pasos_theme";

export function getStoredTheme(): AppTheme {
  if (typeof window === "undefined") return "light";
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "high-contrast" || saved === "light") {
      return saved;
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia("(prefers-contrast: more)").matches) {
      return "high-contrast";
    }
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  } catch {
    // Fallback
  }
  return "light";
}

export function applyTheme(theme: AppTheme): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Ignored
  }
}

export function cycleTheme(current: AppTheme): AppTheme {
  let next: AppTheme = "light";
  if (current === "light") next = "dark";
  else if (current === "dark") next = "high-contrast";
  else if (current === "high-contrast") next = "light";
  applyTheme(next);
  return next;
}
