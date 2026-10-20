import { describe, it, expect, beforeEach, vi } from "vitest";
import { usePaletteStore } from "./paletteStore";
import type { Command } from "../engine";

const cmd = (overrides: Partial<Command> = {}): Command => ({
  id: "test",
  title: "Test",
  run: vi.fn(),
  ...overrides,
});

const reset = () =>
  usePaletteStore.setState({
    commands: [],
    normalized: [],
    results: [],
    isOpen: false,
    query: "",
    selectedIndex: 0,
  });

describe("paletteStore", () => {
  beforeEach(reset);

  // ─── registerCommands ─────────────────────────────────────────────────────

  it("stores commands and initializes results on registerCommands", () => {
    const commands = [cmd({ id: "a" }), cmd({ id: "b" })];
    usePaletteStore.getState().registerCommands(commands);
    const { results } = usePaletteStore.getState();
    expect(results).toHaveLength(2);
    expect(results.every((r) => r.titleIndexes === null && r.subtitleIndexes === null)).toBe(true);
  });

  it("resets selectedIndex to 0 on registerCommands when the selected command is gone", () => {
    usePaletteStore.setState({ selectedIndex: 5 });
    usePaletteStore.getState().registerCommands([cmd()]);
    expect(usePaletteStore.getState().selectedIndex).toBe(0);
  });

  it("keeps the selected command selected when commands are re-registered", () => {
    usePaletteStore.getState().registerCommands([cmd({ id: "a" }), cmd({ id: "b" })]);
    usePaletteStore.getState().selectNext();
    usePaletteStore.getState().registerCommands([
      cmd({ id: "new" }),
      cmd({ id: "a" }),
      cmd({ id: "b" }),
    ]);
    const { results, selectedIndex } = usePaletteStore.getState();
    expect(results[selectedIndex].item.id).toBe("b");
  });

  it("keeps the current query applied when commands are re-registered", () => {
    const commands = () => [
      cmd({ id: "settings", title: "Open Settings" }),
      cmd({ id: "home", title: "Go Home" }),
    ];
    usePaletteStore.getState().registerCommands(commands());
    usePaletteStore.getState().setQuery("settings");
    usePaletteStore.getState().registerCommands(commands());

    const { query, results } = usePaletteStore.getState();
    expect(query).toBe("settings");
    expect(results.map((r) => r.item.id)).toEqual(["settings"]);
  });

  it("orders results group by group, the order the list displays them in", () => {
    usePaletteStore.getState().registerCommands([
      cmd({ id: "a", group: "X" }),
      cmd({ id: "b", group: "Y" }),
      cmd({ id: "c", group: "X" }),
    ]);
    expect(usePaletteStore.getState().results.map((r) => r.item.id)).toEqual([
      "a",
      "c",
      "b",
    ]);
  });

  // ─── setQuery ─────────────────────────────────────────────────────────────

  it("filters results when query is set", () => {
    usePaletteStore.getState().registerCommands([
      cmd({ id: "settings", title: "Open Settings" }),
      cmd({ id: "home", title: "Go Home" }),
    ]);
    usePaletteStore.getState().setQuery("settings");
    const { results } = usePaletteStore.getState();
    expect(results.some((r) => r.item.id === "settings")).toBe(true);
    expect(results.every((r) => r.item.id !== "home")).toBe(true);
  });

  it("resets selectedIndex to 0 when query changes", () => {
    usePaletteStore.getState().registerCommands([cmd(), cmd({ id: "b" })]);
    usePaletteStore.setState({ selectedIndex: 1 });
    usePaletteStore.getState().setQuery("test");
    expect(usePaletteStore.getState().selectedIndex).toBe(0);
  });

  // ─── selectNext / selectPrev ──────────────────────────────────────────────

  it("selectNext advances selectedIndex", () => {
    usePaletteStore.getState().registerCommands([cmd(), cmd({ id: "b" })]);
    usePaletteStore.getState().selectNext();
    expect(usePaletteStore.getState().selectedIndex).toBe(1);
  });

  it("selectNext wraps around to 0 at end of list", () => {
    usePaletteStore.getState().registerCommands([cmd(), cmd({ id: "b" })]);
    usePaletteStore.setState({ selectedIndex: 1 });
    usePaletteStore.getState().selectNext();
    expect(usePaletteStore.getState().selectedIndex).toBe(0);
  });

  it("selectPrev wraps around to last item from 0", () => {
    usePaletteStore.getState().registerCommands([cmd(), cmd({ id: "b" })]);
    usePaletteStore.getState().selectPrev();
    expect(usePaletteStore.getState().selectedIndex).toBe(1);
  });

  it("selectNext/selectPrev stay at 0 when results are empty", () => {
    usePaletteStore.getState().selectNext();
    expect(usePaletteStore.getState().selectedIndex).toBe(0);
    usePaletteStore.getState().selectPrev();
    expect(usePaletteStore.getState().selectedIndex).toBe(0);
  });

  // ─── open / close ─────────────────────────────────────────────────────────

  it("open sets isOpen to true", () => {
    usePaletteStore.getState().open();
    expect(usePaletteStore.getState().isOpen).toBe(true);
  });

  it("open resets the query, results and selection from the last session", () => {
    usePaletteStore.getState().registerCommands([
      cmd({ id: "settings", title: "Open Settings" }),
      cmd({ id: "home", title: "Go Home" }),
    ]);
    usePaletteStore.getState().setQuery("settings");
    usePaletteStore.setState({ selectedIndex: 1 });

    usePaletteStore.getState().open();
    const state = usePaletteStore.getState();
    expect(state.query).toBe("");
    expect(state.results).toHaveLength(2);
    expect(state.selectedIndex).toBe(0);
  });

  it("open does nothing when the palette is already open", () => {
    usePaletteStore.getState().registerCommands([cmd({ id: "a" }), cmd({ id: "b" })]);
    usePaletteStore.getState().open();
    usePaletteStore.getState().setQuery("b");
    usePaletteStore.getState().open();
    expect(usePaletteStore.getState().query).toBe("b");
  });

  // The list stays as it was while the close animation plays.
  it("close sets isOpen to false and leaves the list unchanged", () => {
    usePaletteStore.setState({ isOpen: true, query: "foo", selectedIndex: 2 });
    usePaletteStore.getState().close();
    const state = usePaletteStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.query).toBe("foo");
    expect(state.selectedIndex).toBe(2);
  });

  it("select moves the selection, ignoring indexes outside the results", () => {
    usePaletteStore.getState().registerCommands([cmd({ id: "a" }), cmd({ id: "b" })]);
    usePaletteStore.getState().select(1);
    expect(usePaletteStore.getState().selectedIndex).toBe(1);
    usePaletteStore.getState().select(5);
    expect(usePaletteStore.getState().selectedIndex).toBe(1);
  });
});
