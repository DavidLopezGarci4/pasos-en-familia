// Web-safe haptic feedback wrapper using navigator.vibrate with graceful fallback
export function hapticTap(): void {
  if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate(10);
    } catch {
      // Ignored
    }
  }
}

export function hapticSuccess(): void {
  if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate([15, 30, 25]);
    } catch {
      // Ignored
    }
  }
}

export function hapticWarning(): void {
  if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate([30, 50, 30]);
    } catch {
      // Ignored
    }
  }
}
