import type { Command } from "../engine";

export type ShortcutConfig = {
  key: string;
  shift?: boolean;
  alt?: boolean;
};

export type GlyphXProps = {
  commands: Command[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  shortcut?: ShortcutConfig;
};
