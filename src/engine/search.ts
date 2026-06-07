import fuzzysort from "fuzzysort";
import type { NormalizedCommand } from "./normalize";

export type SearchResult<T> = {
  item: T;
  titleIndexes: readonly number[] | null;
  subtitleIndexes: readonly number[] | null;
};

function splitIndexes(
  raw: readonly number[],
  titleLength: number,
  subtitleLength: number
): { titleIndexes: number[]; subtitleIndexes: number[] } {
  const subtitleStart = titleLength + 1; // +1 for the space separator
  const subtitleEnd = subtitleStart + subtitleLength;

  const titleIdxs: number[] = [];
  const subtitleIdxs: number[] = [];

  for (const i of raw) {
    if (i < titleLength) {
      titleIdxs.push(i);
    } else if (subtitleLength > 0 && i >= subtitleStart && i < subtitleEnd) {
      subtitleIdxs.push(i - subtitleStart);
    }
  }

  return { titleIndexes: titleIdxs, subtitleIndexes: subtitleIdxs };
}

export function searchCommands(
  commands: NormalizedCommand[],
  query: string
): SearchResult<NormalizedCommand>[] {
  if (!query.trim()) {
    return commands.map((cmd) => ({
      item: cmd,
      titleIndexes: null,
      subtitleIndexes: null,
    }));
  }

  const results = fuzzysort.go(query, commands, {
    key: "searchText",
    threshold: -1000,
  });

  return results.map((r) => {
    const { titleIndexes, subtitleIndexes } = splitIndexes(
      r.indexes,
      r.obj.titleLength,
      r.obj.subtitleLength
    );

    return {
      item: r.obj,
      titleIndexes: titleIndexes.length > 0 ? titleIndexes : null,
      subtitleIndexes: subtitleIndexes.length > 0 ? subtitleIndexes : null,
    };
  });
}
