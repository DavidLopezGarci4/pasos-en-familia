"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useRealtimeSync() {
  const router = useRouter();

  useEffect(() => {
    let es: EventSource | null = null;

    function connect() {
      if (es) es.close();
      es = new EventSource("/api/events");
      es.addEventListener("update", () => {
        router.refresh();
      });
      es.onerror = () => {
        // EventSource auto-reconnects; we just let it retry
      };
    }

    connect();

    // Reconnect and refresh when tablet wakes from sleep
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        if (!es || es.readyState === EventSource.CLOSED) {
          connect();
        }
        router.refresh();
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      es?.close();
    };
  }, [router]);
}
