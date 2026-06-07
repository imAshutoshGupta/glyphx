import { describe, it, expect, vi } from "vitest";
import { groupResults } from "./groupResults";
import type { SearchResult } from "../engine/search";
import type { Command } from "../engine";

const result = (id: string, group?: string): SearchResult<Command> => ({
  item: { id, title: id, group, run: vi.fn() },
  titleIndexes: null,
  subtitleIndexes: null,
});

describe("groupResults", () => {
  it("returns empty array for empty input", () => {
    expect(groupResults([])).toEqual([]);
  });

  it("groups items by their group field", () => {
    const groups = groupResults([
      result("a", "Nav"),
      result("b", "Nav"),
      result("c", "Settings"),
    ]);
    expect(groups).toHaveLength(2);
    const nav = groups.find((g) => g.group === "Nav")!;
    expect(nav.items).toHaveLength(2);
  });

  it("uses 'Other' as default group when group is undefined", () => {
    const groups = groupResults([result("a")]);
    expect(groups[0].group).toBe("Other");
  });

  it("preserves insertion order of groups", () => {
    const groups = groupResults([
      result("a", "First"),
      result("b", "Second"),
      result("c", "First"),
    ]);
    expect(groups[0].group).toBe("First");
    expect(groups[1].group).toBe("Second");
  });

  it("keeps items within a group in insertion order", () => {
    const groups = groupResults([
      result("a", "Nav"),
      result("b", "Nav"),
    ]);
    expect(groups[0].items[0].item.id).toBe("a");
    expect(groups[0].items[1].item.id).toBe("b");
  });
});
