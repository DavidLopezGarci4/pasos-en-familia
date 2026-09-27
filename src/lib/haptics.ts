// Web-safe haptic feedback wrapper using navigator.vibrate with configurable user preference
const HAPTICS_KEY = "pasos_haptics_enabled";

export function isHapticsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const val = localStorage.getItem(HAPTICS_KEY);
    // Default to true if not set
    return val !== "false";
  } catch {
    return true;
  }
}

export function setHapticsEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HAPTICS_KEY, enabled ? "true" : "false");
  } catch {
    // Ignored
  }
}

export function toggleHaptics(): boolean {
  const current = isHapticsEnabled();
  const next = !current;
  setHapticsEnabled(next);
  if (next) {
    // Quick confirmation buzz
    hapticTap(true);
  }
  return next;
}

export function hapticTap(force = false): void {
  if (!force && !isHapticsEnabled()) return;
  if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate(10);
    } catch {
      // Ignored
    }
  }
}

export function hapticSuccess(force = false): void {
  if (!force && !isHapticsEnabled()) return;
  if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate([15, 30, 25]);
    } catch {
      // Ignored
    }
  }
}

export function hapticWarning(force = false): void {
  if (!force && !isHapticsEnabled()) return;
  if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate([30, 50, 30]);
    } catch {
      // Ignored
    }
  }
}
