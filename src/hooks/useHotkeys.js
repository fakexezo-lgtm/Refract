import { useEffect } from "react";

export function useHotkeys(combo, handler) {
  useEffect(() => {
    const parts = combo.toLowerCase().split("+");
    const wantMod = parts.includes("mod");
    const key = parts[parts.length - 1];
    const onKey = (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (wantMod && !mod) return;
      if (e.key.toLowerCase() === key) handler(e);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [combo, handler]);
}