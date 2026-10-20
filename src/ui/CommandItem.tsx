import { memo, useRef } from "react";
import type { Command } from "../engine";
import { executeCommand } from "../engine";
import { usePaletteStore } from "../state/paletteStore";
import { useAutoScroll } from "../hooks/useAutoScroll";
import { highlightText } from "./highlight";

type Props = {
  command: Command;
  titleIndexes: readonly number[] | null;
  subtitleIndexes: readonly number[] | null;
  index: number;
};

function CommandItemImpl({ command, titleIndexes, subtitleIndexes, index }: Props) {
  const close = usePaletteStore((s) => s.close);
  // Subscribe to a boolean slice, not the raw selectedIndex, so only the two
  // items whose selection state actually flips re-render on each keystroke
  // (instead of every item in the list).
  const isSelected = usePaletteStore((s) => s.selectedIndex === index);

  const ref = useRef<HTMLButtonElement>(null);

  useAutoScroll(ref, isSelected);

  return (
    <li>
      <button
        ref={ref}
        aria-label={command.title}
        // Same as Enter in usePaletteNavigation: close right away and let the
        // command run in the background, so a slow async command doesn't keep
        // the palette open.
        onClick={() => {
          executeCommand(command);
          close();
        }}
        className={`
          flex w-full items-center justify-between
          rounded-md px-3 py-2 text-left text-sm
          text-[rgb(var(--glyphx-fg))]
          ${
            isSelected
              ? "bg-[rgb(var(--glyphx-selected))]"
              : "hover:bg-[rgb(var(--glyphx-selected))]"
          }
        `}
      >
        <span className="flex flex-col">
          <span>{highlightText(command.title, titleIndexes)}</span>
          {command.subtitle && (
            <span className="text-xs text-[rgb(var(--glyphx-muted))]">
              {highlightText(command.subtitle, subtitleIndexes)}
            </span>
          )}
        </span>

        {command.shortcut && (
          <span className="text-xs text-[rgb(var(--glyphx-muted))]">
            {command.shortcut}
          </span>
        )}
      </button>
    </li>
  );
}

export const CommandItem = memo(CommandItemImpl);
