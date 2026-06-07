import { describe, it, expect, vi } from "vitest";
import { normalizeCommands } from "./normalize";
import { searchCommands } from "./search";
import { executeCommand } from "./execute";
import type { Command } from "./command";

const cmd = (overrides: Partial<Command> = {}): Command => ({
  id: "test",
  title: "Test Command",
  run: vi.fn(),
  ...overrides,
});

// ─── normalizeCommands ────────────────────────────────────────────────────────

describe("normalizeCommands", () => {
  it("builds searchText from title", () => {
    const [result] = normalizeCommands([cmd({ title: "Open Settings" })]);
    expect(result.searchText).toBe("open settings");
  });

  it("includes subtitle in searchText", () => {
    const [result] = normalizeCommands([
      cmd({ title: "Go Home", subtitle: "Navigate to homepage" }),
    ]);
    expect(result.searchText).toContain("navigate to homepage");
  });

  it("includes keywords in searchText", () => {
    const [result] = normalizeCommands([
      cmd({ title: "Go Home", keywords: ["nav", "start"] }),
    ]);
    expect(result.searchText).toContain("nav");
    expect(result.searchText).toContain("start");
  });

  it("preserves all original Command fields", () => {
    const original = cmd({ id: "abc", title: "Foo", group: "Bar" });
    const [result] = normalizeCommands([original]);
    expect(result.id).toBe("abc");
    expect(result.group).toBe("Bar");
    expect(result.run).toBe(original.run);
  });

  it("handles empty keywords array without throwing", () => {
    expect(() => normalizeCommands([cmd({ keywords: [] })])).not.toThrow();
  });

  it("stores titleLength equal to lowercased title length", () => {
    const [result] = normalizeCommands([cmd({ title: "Open Settings" })]);
    expect(result.titleLength).toBe("open settings".length);
  });

  it("stores subtitleLength equal to lowercased subtitle length", () => {
    const [result] = normalizeCommands([
      cmd({ title: "Go Home", subtitle: "Navigate" }),
    ]);
    expect(result.subtitleLength).toBe("navigate".length);
  });

  it("stores subtitleLength of 0 when no subtitle", () => {
    const [result] = normalizeCommands([cmd()]);
    expect(result.subtitleLength).toBe(0);
  });
});

// ─── searchCommands ───────────────────────────────────────────────────────────

describe("searchCommands", () => {
  const commands = normalizeCommands([
    cmd({ id: "1", title: "Open Settings" }),
    cmd({ id: "2", title: "Go to Dashboard" }),
    cmd({ id: "3", title: "Invite Team Member" }),
  ]);

  it("returns all commands with null indexes for empty query", () => {
    const results = searchCommands(commands, "");
    expect(results).toHaveLength(3);
    expect(results.every((r) => r.titleIndexes === null)).toBe(true);
    expect(results.every((r) => r.subtitleIndexes === null)).toBe(true);
  });

  it("returns all commands with null indexes for whitespace-only query", () => {
    const results = searchCommands(commands, "   ");
    expect(results.every((r) => r.titleIndexes === null)).toBe(true);
  });

  it("returns matching results for a real query", () => {
    const results = searchCommands(commands, "settings");
    expect(results.some((r) => r.item.id === "1")).toBe(true);
  });

  it("returns non-null titleIndexes for a title match", () => {
    const results = searchCommands(commands, "settings");
    const match = results.find((r) => r.item.id === "1");
    expect(match?.titleIndexes).not.toBeNull();
  });

  it("filters out non-matching results for specific query", () => {
    const results = searchCommands(commands, "settings");
    expect(results.every((r) => r.item.id !== "2")).toBe(true);
  });

  it("returns empty array when nothing matches", () => {
    const results = searchCommands(commands, "zzzzzzzzz");
    expect(results).toHaveLength(0);
  });

  it("returns subtitleIndexes offset to subtitle-local positions", () => {
    const withSubtitle = normalizeCommands([
      cmd({ id: "s", title: "Go Home", subtitle: "Navigate here" }),
    ]);
    const results = searchCommands(withSubtitle, "navigate");
    const match = results.find((r) => r.item.id === "s");
    expect(match?.subtitleIndexes).not.toBeNull();
    // indexes should be within bounds of the subtitle string
    const subtitleLen = "Navigate here".length;
    for (const i of match!.subtitleIndexes!) {
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(subtitleLen);
    }
  });

  it("returns null subtitleIndexes when match is only in title", () => {
    const withSubtitle = normalizeCommands([
      cmd({ id: "s", title: "Open Settings", subtitle: "Configure options" }),
    ]);
    const results = searchCommands(withSubtitle, "open");
    const match = results.find((r) => r.item.id === "s");
    expect(match?.titleIndexes).not.toBeNull();
    expect(match?.subtitleIndexes).toBeNull();
  });
});

// ─── executeCommand ───────────────────────────────────────────────────────────

describe("executeCommand", () => {
  it("calls command.run()", async () => {
    const run = vi.fn();
    await executeCommand(cmd({ run }));
    expect(run).toHaveBeenCalledOnce();
  });

  it("handles async run() without throwing", async () => {
    const run = vi.fn().mockResolvedValue(undefined);
    await expect(executeCommand(cmd({ run }))).resolves.toBeUndefined();
  });

  it("catches and logs errors from run() without propagating", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const run = vi.fn().mockRejectedValue(new Error("boom"));
    await expect(executeCommand(cmd({ run }))).resolves.toBeUndefined();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
