import { useCallback, useId, useRef } from "react";
import { CommandDialog } from "./CommandDialog";
import { usePaletteStore } from "../state/paletteStore";
import { CommandInput } from "./CommandInput";
import { CommandList } from "./CommandList";
import { usePaletteNavigation } from "../hooks/usePaletteNavigation";
import type { Command } from "../engine";
import { executeCommand } from "../engine";
import type { GlyphXTheme } from "../palette/types";

type Props = {
  // Asks GlyphX to open or close the palette.
  onOpenChange: (open: boolean) => void;
  theme: GlyphXTheme;
};

export function CommandPalette({ onOpenChange, theme }: Props) {
  const isOpen = usePaletteStore((s) => s.isOpen);
  const id = useId();

  // Where focus was before the palette opened.
  const returnFocusTo = useRef<HTMLElement | null>(null);

  // The command picked in this session. It runs once the dialog has closed:
  // until then the dialog traps focus, so a command that runs earlier can't
  // move focus (to an editor, a search field, ...).
  const chosen = useRef<Command | null>(null);

  const runCommand = useCallback(
    (command: Command) => {
      // Ignore picks while closing, e.g. a double click or a held Enter key.
      if (!usePaletteStore.getState().isOpen) return;
      chosen.current = command;
      onOpenChange(false);
    },
    [onOpenChange]
  );

  const onKeyDown = usePaletteNavigation(runCommand);

  return (
    <CommandDialog
      open={isOpen}
      theme={theme}
      onKeyDown={onKeyDown}
      // Radix calls this for Escape and outside clicks: close without running
      // anything.
      onOpenChange={(open) => {
        if (!open) chosen.current = null;
        onOpenChange(open);
      }}
      // Radix calls this just before it moves focus into the dialog.
      onOpenAutoFocus={() => {
        returnFocusTo.current = document.activeElement as HTMLElement | null;
      }}
      onCloseAutoFocus={(event) => {
        // Radix would return focus to a Dialog.Trigger, and GlyphX has none,
        // so focus would be left on <body>. Return it to where it was, then
        // run the command, which may move it again.
        event.preventDefault();
        returnFocusTo.current?.focus();
        returnFocusTo.current = null;

        const command = chosen.current;
        chosen.current = null;
        if (command) executeCommand(command);
      }}
    >
      <div className="glyphx-body">
        <span className="glyphx-hint">
          <kbd>Esc</kbd> to close
        </span>

        <CommandInput id={id} />
        <CommandList id={id} onSelect={runCommand} />
      </div>
    </CommandDialog>
  );
}
