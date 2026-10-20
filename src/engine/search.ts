import fuzzysort from "fuzzysort";
import type { NormalizedCommand } from "./normalize";

export type SearchResult<T> = {
  item: T;
  titleIndexes: readonly number[] | null;
  subtitleIndexes: readonly number[] | null;
};

// Title, subtitle and keywords are matched as separate fields, so a match
// never spans two of them. A match in the title ranks above an equally good
// match in the subtitle, which ranks above one in the keywords.
const SEARCH_KEYS = ["title", "subtitle", "keywordsText"] as const;
const SUBTITLE_WEIGHT = 0.9;
const KEYWORDS_WEIGHT = 0.8;

const nonEmpty = (indexes: readonly number[]) =>
  indexes.length > 0 ? indexes : null;

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
    keys: SEARCH_KEYS,
    scoreFn: ([title, subtitle, keywords]) =>
      Math.max(
        title.score,
        subtitle.score * SUBTITLE_WEIGHT,
        keywords.score * KEYWORDS_WEIGHT
      ),
  });

  return results.map((r) => ({
    item: r.obj,
    titleIndexes: nonEmpty(r[0].indexes),
    subtitleIndexes: nonEmpty(r[1].indexes),
  }));
}
