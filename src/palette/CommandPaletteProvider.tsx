import { useEffect } from "react";
import type { GlyphXProps } from "./types";
import { usePaletteStore } from "../state/paletteStore";
import { useCommandShortcut } from "../hooks/useCommandShortcut";
import { CommandPalette as InternalPalette } from "../ui/CommandPalette";

export function GlyphX({ commands, open, onOpenChange, shortcut }: GlyphXProps) {
  const storeOpen = usePaletteStore((s) => s.open);
  const storeClose = usePaletteStore((s) => s.close);
  const registerCommands = usePaletteStore((s) => s.registerCommands);

  useCommandShortcut(() => {
    onOpenChange?.(true);
    storeOpen();
  }, shortcut);

  useEffect(() => {
    registerCommands(commands);
  }, [commands, registerCommands]);

  useEffect(() => {
    if (open === undefined) return;
    open ? storeOpen() : storeClose();
  }, [open, storeOpen, storeClose]);

  return (
    <InternalPalette
      onOpenChange={(isOpen) => {
        onOpenChange?.(isOpen);
        if (!isOpen) storeClose();
      }}
    />
  );
}
