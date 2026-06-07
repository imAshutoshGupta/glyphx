import { useEffect } from "react";
import type { ShortcutConfig } from "../palette/types";

// Default to Cmd/Ctrl+Shift+P — Cmd/Ctrl+K overlaps with the browser's
// address-bar search shortcut. Consumers can override via the `shortcut` prop.
const DEFAULT_SHORTCUT: ShortcutConfig = { key: "p", shift: true };

export function useCommandShortcut(
  onTrigger: () => void,
  shortcut: ShortcutConfig = DEFAULT_SHORTCUT
) {
  useEffect(() => {
    const nav = navigator as Navigator & { userAgentData?: { platform: string } };
    const isMac = (nav.userAgentData?.platform ?? navigator.platform)
      .toLowerCase()
      .startsWith("mac");

    const handler = (e: KeyboardEvent) => {
      const primaryMod = isMac ? e.metaKey : e.ctrlKey;
      if (
        primaryMod &&
        e.key.toLowerCase() === shortcut.key.toLowerCase() &&
        !!e.shiftKey === !!shortcut.shift &&
        !!e.altKey === !!shortcut.alt
      ) {
        e.preventDefault();
        e.stopPropagation();
        onTrigger();
      }
    };

    // Capture phase intercepts before Safari's native handlers, preventing the system beep.
    window.addEventListener("keydown", handler, { capture: true });
    return () => window.removeEventListener("keydown", handler, { capture: true });
  }, [onTrigger, shortcut]);
}
