import type { Command } from "../engine";

export type ShortcutConfig = {
  key: string;
  shift?: boolean;
  alt?: boolean;
};

// "system" follows the OS setting (prefers-color-scheme).
export type GlyphXTheme = "system" | "light" | "dark";

export type GlyphXProps = {
  commands: Command[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  // Pass an array to accept several shortcuts.
  shortcut?: ShortcutConfig | ShortcutConfig[];
  theme?: GlyphXTheme;
};
