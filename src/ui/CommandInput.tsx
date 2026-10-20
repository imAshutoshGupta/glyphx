import { useEffect, useRef } from "react";
import { usePaletteStore } from "../state/paletteStore";
import { listboxId, optionId } from "./ids";

type Props = {
  id: string;
};

export function CommandInput({ id }: Props) {
  const query = usePaletteStore((s) => s.query);
  const setQuery = usePaletteStore((s) => s.setQuery);
  const activeIndex = usePaletteStore((s) =>
    s.results.length > 0 ? s.selectedIndex : -1
  );

  const inputRef = useRef<HTMLInputElement>(null);

  // Spotlight-style focus: defer to next frame
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => cancelAnimationFrame(id);
  }, []);

  // Focus stays in the input while the arrow keys move through the list, so
  // aria-activedescendant tells screen readers which command is selected.
  return (
    <input
      ref={inputRef}
      role="combobox"
      aria-label="Search commands"
      aria-expanded
      aria-controls={listboxId(id)}
      aria-autocomplete="list"
      aria-activedescendant={
        activeIndex >= 0 ? optionId(id, activeIndex) : undefined
      }
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Type a command…"
      spellCheck={false}
      autoComplete="off"
      className="glyphx-input"
    />
  );
}
