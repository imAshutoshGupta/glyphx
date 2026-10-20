import type { Command } from "./command";

export type NormalizedCommand = Command & {
  // All keywords as one string, searched as a single field.
  keywordsText: string;
};

export function normalizeCommands(commands: Command[]): NormalizedCommand[] {
  return commands.map((cmd) => ({
    ...cmd,
    keywordsText: (cmd.keywords ?? []).join(" "),
  }));
}
