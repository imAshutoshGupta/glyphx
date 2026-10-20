import { usePaletteStore } from "../state/paletteStore";
import { groupResults } from "../state/groupResults";
import type { Command } from "../engine";
import { CommandItem } from "./CommandItem";
import { listboxId, optionId } from "./ids";

type Props = {
  id: string;
  onSelect: (command: Command) => void;
};

export function CommandList({ id, onSelect }: Props) {
  const results = usePaletteStore((s) => s.results);

  // The store keeps results in display order (grouped), so counting rows
  // here gives each row its index in `results`.
  const grouped = groupResults(results);

  let globalIndex = 0;

  return (
    <>
      <div
        id={listboxId(id)}
        role="listbox"
        aria-label="Commands"
        className="glyphx-list"
      >
        {grouped.map(({ group, items }, groupIndex) => {
          const headingId = `${id}-group-${groupIndex}`;

          return (
            <div key={group} role="presentation">
              <div id={headingId} aria-hidden="true" className="glyphx-group-heading">
                {group}
              </div>
              <ul role="group" aria-labelledby={headingId} className="glyphx-group">
                {items.map((result) => {
                  const index = globalIndex++;

                  return (
                    <CommandItem
                      key={result.item.id}
                      id={optionId(id, index)}
                      command={result.item}
                      titleIndexes={result.titleIndexes}
                      subtitleIndexes={result.subtitleIndexes}
                      index={index}
                      onSelect={onSelect}
                    />
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Always rendered, so screen readers announce the message when it
          appears. */}
      <div role="status">
        {results.length === 0 && (
          <div className="glyphx-empty">
            <p>No matching commands</p>
            <p>Try a different keyword</p>
          </div>
        )}
      </div>
    </>
  );
}
