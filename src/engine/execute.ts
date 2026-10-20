import type { Command } from "./command";

export async function executeCommand(command: Command) {
  try {
    await command.run();
  } catch (error) {
    console.error(`[glyphx] Command failed: ${command.id}`, error);
  }
}
