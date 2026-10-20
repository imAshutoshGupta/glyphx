import type { SearchResult } from "../engine/search";
import type { Command } from "../engine";

export type GroupedResults<T extends Command = Command> = {
  group: string;
  items: SearchResult<T>[];
}[];

export function groupResults<T extends Command>(
  results: SearchResult<T>[]
): GroupedResults<T> {
  const map = new Map<string, SearchResult<T>[]>();

  for (const result of results) {
    const group = result.item.group ?? "Other";

    if (!map.has(group)) {
      map.set(group, []);
    }

    map.get(group)!.push(result);
  }

  return Array.from(map.entries()).map(([group, items]) => ({
    group,
    items,
  }));
}
