import { memo, useRef } from "react";
import type { Command } from "../engine";
import { usePaletteStore } from "../state/paletteStore";
import { useAutoScroll } from "../hooks/useAutoScroll";
import { highlightText } from "./highlight";

type Props = {
  id: string;
  command: Command;
  titleIndexes: readonly number[] | null;
  subtitleIndexes: readonly number[] | null;
  index: number;
  onSelect: (command: Command) => void;
};

function CommandItemImpl({
  id,
  command,
  titleIndexes,
  subtitleIndexes,
  index,
  onSelect,
}: Props) {
  const select = usePaletteStore((s) => s.select);
  // Subscribe to a boolean slice, not the raw selectedIndex, so only the two
  // items whose selection state actually flips re-render on each keystroke
  // (instead of every item in the list).
  const isSelected = usePaletteStore((s) => s.selectedIndex === index);

  const ref = useRef<HTMLLIElement>(null);

  useAutoScroll(ref, isSelected);

  const describedBy = [
    command.subtitle && `${id}-subtitle`,
    command.shortcut && `${id}-shortcut`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <li
      ref={ref}
      id={id}
      role="option"
      aria-selected={isSelected}
      // The plain title: the highlight spans split the visible text into
      // fragments, which some name calculations join without spaces.
      aria-label={command.title}
      aria-describedby={describedBy || undefined}
      className="glyphx-item"
      // Keep focus in the search input, where the keyboard handling lives.
      onMouseDown={(e) => e.preventDefault()}
      // Hovering selects the row, so only one row is ever highlighted.
      // pointermove rather than pointerenter: a row that the arrow keys scroll
      // under a resting pointer shouldn't take the selection.
      onPointerMove={() => {
        if (!isSelected) select(index);
      }}
      onClick={() => onSelect(command)}
    >
      <span className="glyphx-item-text">
        <span>{highlightText(command.title, titleIndexes)}</span>
        {command.subtitle && (
          <span id={`${id}-subtitle`} className="glyphx-item-subtitle">
            {highlightText(command.subtitle, subtitleIndexes)}
          </span>
        )}
      </span>

      {command.shortcut && (
        <kbd id={`${id}-shortcut`} className="glyphx-item-shortcut">
          {command.shortcut}
        </kbd>
      )}
    </li>
  );
}

export const CommandItem = memo(CommandItemImpl);
