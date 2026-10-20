import { useEffect, useRef } from "react";
import type { ShortcutConfig } from "../palette/types";

// Default to Cmd/Ctrl+K and Cmd/Ctrl+Shift+P. Firefox keeps Cmd/Ctrl+Shift+P
// for a private window and never passes it to the page. No browser reserves
// Cmd/Ctrl+K: some use it to focus their search box, but the page can take it over.
// Consumers can override via the `shortcut` prop.
const DEFAULT_SHORTCUT: ShortcutConfig[] = [{ key: "k" }, { key: "p", shift: true }];

const LETTER_OR_DIGIT = /^[a-z0-9]$/i;

// Letters and digits match the character the key types, so remapped layouts
// (Dvorak, Colemak) use the key labelled with that letter. When the key types
// something else instead — a non-Latin layout, Option on macOS turning J into
// "∆", Shift turning 1 into "!" — fall back to the physical key.
function matchesKey(e: KeyboardEvent, key: string) {
  // Chrome fires keydown without a `key` when autofilling a form.
  if (!e.key) return false;
  const wanted = key.toLowerCase();
  if (e.key.toLowerCase() === wanted) return true;
  if (!LETTER_OR_DIGIT.test(wanted) || LETTER_OR_DIGIT.test(e.key)) {
    return false;
  }
  const code = /\d/.test(wanted) ? `Digit${wanted}` : `Key${wanted.toUpperCase()}`;
  return e.code === code;
}

export function useCommandShortcut(
  onTrigger: () => void,
  shortcut: ShortcutConfig | ShortcutConfig[] = DEFAULT_SHORTCUT
) {
  const onTriggerRef = useRef(onTrigger);
  useEffect(() => {
    onTriggerRef.current = onTrigger;
  });

  // Compared by value, so an inline `shortcut={{ key: "j" }}` doesn't
  // re-register the listener on every render.
  const shortcuts = JSON.stringify(
    Array.isArray(shortcut) ? shortcut : [shortcut]
  );

  useEffect(() => {
    const configs: ShortcutConfig[] = JSON.parse(shortcuts);
    const nav = navigator as Navigator & { userAgentData?: { platform: string } };
    const isMac = (nav.userAgentData?.platform ?? navigator.platform)
      .toLowerCase()
      .startsWith("mac");

    const handler = (e: KeyboardEvent) => {
      const primaryMod = isMac ? e.metaKey : e.ctrlKey;
      if (
        primaryMod &&
        configs.some(
          (config) =>
            matchesKey(e, config.key) &&
            !!e.shiftKey === !!config.shift &&
            !!e.altKey === !!config.alt
        )
      ) {
        e.preventDefault();
        e.stopPropagation();
        onTriggerRef.current();
      }
    };

    // Capture phase intercepts before Safari's native handlers, preventing the system beep.
    window.addEventListener("keydown", handler, { capture: true });
    return () => window.removeEventListener("keydown", handler, { capture: true });
  }, [shortcuts]);
}
