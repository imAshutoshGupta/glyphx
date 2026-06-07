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
        onClick={async () => {
          await executeCommand(command);
          close();
        }}
        className={`
          flex w-full items-center justify-between
          rounded-md px-3 py-2 text-left text-sm
          ${
            isSelected
              ? "bg-zinc-800 text-white"
              : "text-zinc-100 hover:bg-zinc-800"
          }
        `}
      >
        <span className="flex flex-col">
          <span>{highlightText(command.title, titleIndexes)}</span>
          {command.subtitle && (
            <span className="text-xs text-[rgb(var(--muted))]">
              {highlightText(command.subtitle, subtitleIndexes)}
            </span>
          )}
        </span>

        {command.shortcut && (
          <span className="text-xs text-zinc-500">{command.shortcut}</span>
        )}
      </button>
    </li>
  );
}

export const CommandItem = memo(CommandItemImpl);
