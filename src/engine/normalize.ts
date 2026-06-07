import type { Command } from "./command";

export type NormalizedCommand = Command & {
  searchText: string;
  titleLength: number;
  subtitleLength: number;
};

export function normalizeCommands(commands: Command[]): NormalizedCommand[] {
  return commands.map((cmd) => {
    const parts = [cmd.title, cmd.subtitle, ...(cmd.keywords ?? [])].filter(
      (p): p is string => Boolean(p)
    );

    return {
      ...cmd,
      searchText: parts.join(" ").toLowerCase(),
      titleLength: cmd.title.toLowerCase().length,
      subtitleLength: cmd.subtitle?.toLowerCase().length ?? 0,
    };
  });
}
