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

  it("resets selectedIndex to 0 on registerCommands", () => {
    usePaletteStore.setState({ selectedIndex: 5 });
    usePaletteStore.getState().registerCommands([cmd()]);
    expect(usePaletteStore.getState().selectedIndex).toBe(0);
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

  it("close sets isOpen to false and resets query and selectedIndex", () => {
    usePaletteStore.setState({ isOpen: true, query: "foo", selectedIndex: 2 });
    usePaletteStore.getState().close();
    const state = usePaletteStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.query).toBe("");
    expect(state.selectedIndex).toBe(0);
  });
});
