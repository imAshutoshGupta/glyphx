import { useEffect } from "react";
import { usePaletteStore } from "../state/paletteStore";
import { executeCommand } from "../engine";

export function usePaletteNavigation() {
  const isOpen = usePaletteStore((s) => s.isOpen);
  const close = usePaletteStore((s) => s.close);
  const selectNext = usePaletteStore((s) => s.selectNext);
  const selectPrev = usePaletteStore((s) => s.selectPrev);
  const results = usePaletteStore((s) => s.results);
  const selectedIndex = usePaletteStore((s) => s.selectedIndex);

  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          selectNext();
          break;

        case "ArrowUp":
          e.preventDefault();
          selectPrev();
          break;

        case "Enter":
          e.preventDefault();
          const result = results[selectedIndex];
          if (result) {
            executeCommand(result.item);
            close();
          }
          break;

        case "Escape":
          e.preventDefault();
          close();
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, selectNext, selectPrev, close, results, selectedIndex]);
}
