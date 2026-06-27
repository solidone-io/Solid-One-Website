import { useEffect, useRef } from "react";

export function useRealtimePoll(callback: () => void | Promise<void>, enabled: boolean, intervalMs = 10000) {
  const saved = useRef(callback);
  saved.current = callback;

  useEffect(() => {
    if (!enabled) return;
    const tick = () => void saved.current();
    tick();
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [enabled, intervalMs]);
}
