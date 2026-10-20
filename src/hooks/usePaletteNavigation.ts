import type { KeyboardEvent } from "react";
import type { Command } from "../engine";
import { usePaletteStore } from "../state/paletteStore";

// Returns the keydown handler for the open palette: the arrow keys move the
// selection and Enter picks the selected command. It is attached to the
// dialog, so it only sees keys pressed inside the palette. Escape is handled
// by Radix Dialog.
export function usePaletteNavigation(onSelect: (command: Command) => void) {
  const selectNext = usePaletteStore((s) => s.selectNext);
  const selectPrev = usePaletteStore((s) => s.selectPrev);

  return (e: KeyboardEvent) => {
    // While an IME is composing text, Enter commits the text and the arrow
    // keys move through its candidates. Safari reports the Enter that ends
    // composition with isComposing false, but keyCode 229.
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        selectNext();
        break;

      case "ArrowUp":
        e.preventDefault();
        selectPrev();
        break;

      case "Enter": {
        e.preventDefault();
        const { results, selectedIndex } = usePaletteStore.getState();
        const result = results[selectedIndex];
        if (result) onSelect(result.item);
        break;
      }
    }
  };
}
