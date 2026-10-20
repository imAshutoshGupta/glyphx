import { create } from "zustand";
import type { Command } from "../engine";
import { normalizeCommands, searchCommands } from "../engine";
import type { NormalizedCommand } from "../engine/normalize";
import type { SearchResult } from "../engine/search";
import { groupResults } from "./groupResults";

type PaletteState = {
  commands: Command[];
  normalized: NormalizedCommand[];
  results: SearchResult<NormalizedCommand>[];
  isOpen: boolean;
  query: string;
  selectedIndex: number;
  registerCommands: (commands: Command[]) => void;
  setQuery: (query: string) => void;
  select: (index: number) => void;
  selectNext: () => void;
  selectPrev: () => void;
  selectFirst: () => void;
  open: () => void;
  close: () => void;
};

// Results are stored in display order: grouped, with groups in the order of
// their best match. The list renders them in exactly this order, so
// selectedIndex always points at the highlighted row.
function computeResults(normalized: NormalizedCommand[], query: string) {
  return groupResults(searchCommands(normalized, query)).flatMap(
    (group) => group.items
  );
}

export const usePaletteStore = create<PaletteState>((set, get) => ({
  commands: [],
  normalized: [],
  results: [],
  query: "",
  isOpen: false,
  selectedIndex: 0,

  // Keeps the current query and, if it is still listed, the selected command,
  // so commands that change while the palette is open don't reset it.
  registerCommands: (commands) => {
    const { query, results, selectedIndex } = get();
    const selectedId = results[selectedIndex]?.item.id;
    const normalized = normalizeCommands(commands);
    const nextResults = computeResults(normalized, query);

    set({
      commands,
      normalized,
      results: nextResults,
      selectedIndex: Math.max(
        nextResults.findIndex((r) => r.item.id === selectedId),
        0
      ),
    });
  },

  setQuery: (query) => {
    set({
      query,
      results: computeResults(get().normalized, query),
      selectedIndex: 0,
    });
  },

  select: (index) => {
    if (index >= 0 && index < get().results.length) {
      set({ selectedIndex: index });
    }
  },

  selectNext: () => {
    const { selectedIndex, results } = get();
    set({
      selectedIndex:
        results.length === 0 ? 0 : (selectedIndex + 1) % results.length,
    });
  },

  selectPrev: () => {
    const { selectedIndex, results } = get();
    set({
      selectedIndex:
        results.length === 0
          ? 0
          : (selectedIndex - 1 + results.length) % results.length,
    });
  },

  selectFirst: () => set({ selectedIndex: 0 }),

  // Each open starts a fresh session. Resetting here rather than on close
  // keeps the list unchanged while the close animation plays.
  open: () => {
    if (get().isOpen) return;
    set((state) => ({
      isOpen: true,
      query: "",
      selectedIndex: 0,
      results: computeResults(state.normalized, ""),
    }));
  },
  close: () => set({ isOpen: false }),
}));
