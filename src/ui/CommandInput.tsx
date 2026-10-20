import { useEffect, useRef } from "react";
import { usePaletteStore } from "../state/paletteStore";

export function CommandInput() {
  const query = usePaletteStore((s) => s.query);
  const setQuery = usePaletteStore((s) => s.setQuery);

  const inputRef = useRef<HTMLInputElement>(null);

  // Spotlight-style focus: defer to next frame
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });

    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <input
      ref={inputRef}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Type a command…"
      spellCheck={false}
      autoComplete="off"
      className="
        w-full
        bg-transparent
        px-3 py-2
        text-sm
        placeholder:text-[rgb(var(--glyphx-muted))]
        caret-color-[rgb(var(--glyphx-fg))]
        focus:outline-none
      "
    />
  );
}
