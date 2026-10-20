import { useCallback, useEffect, useRef } from "react";
import type { GlyphXProps } from "./types";
import { usePaletteStore } from "../state/paletteStore";
import { useCommandShortcut } from "../hooks/useCommandShortcut";
import { CommandPalette as InternalPalette } from "../ui/CommandPalette";

export function GlyphX({
  commands,
  open,
  onOpenChange,
  shortcut,
  theme = "system",
}: GlyphXProps) {
  const storeOpen = usePaletteStore((s) => s.open);
  const storeClose = usePaletteStore((s) => s.close);
  const registerCommands = usePaletteStore((s) => s.registerCommands);

  // Latest props for requestOpenChange, so that callback can stay stable.
  const latest = useRef({ controlled: open !== undefined, onOpenChange });
  useEffect(() => {
    latest.current = { controlled: open !== undefined, onOpenChange };
  });

  // Every request to open or close the palette goes through here: the
  // shortcut, Escape, an outside click, and picking a command. Uncontrolled,
  // GlyphX opens or closes itself. Controlled, it only reports the request
  // through onOpenChange and follows the `open` prop.
  const requestOpenChange = useCallback(
    (next: boolean) => {
      if (usePaletteStore.getState().isOpen === next) return;
      latest.current.onOpenChange?.(next);
      if (latest.current.controlled) return;
      if (next) storeOpen();
      else storeClose();
    },
    [storeOpen, storeClose]
  );

  useCommandShortcut(() => requestOpenChange(true), shortcut);

  useEffect(() => {
    registerCommands(commands);
  }, [commands, registerCommands]);

  useEffect(() => {
    if (open === undefined) return;
    if (open) storeOpen();
    else storeClose();
  }, [open, storeOpen, storeClose]);

  return <InternalPalette onOpenChange={requestOpenChange} theme={theme} />;
}
