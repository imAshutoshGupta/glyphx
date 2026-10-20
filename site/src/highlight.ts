// A small syntax highlighter for the code samples on this site: enough to
// color keywords, strings, comments and tags without shipping a library.

export type Language = "tsx" | "css" | "bash" | "html";

export type Token = { text: string; kind: string | null };

type Rule = [RegExp, string | null];

const RULES: Record<Language, Rule[]> = {
  tsx: [
    [/\/\/[^\n]*|\/\*[\s\S]*?\*\//y, "comment"],
    [/`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/y, "string"],
    [/<\/?[A-Za-z][\w.]*|\/?>/y, "tag"],
    [
      /\b(?:import|from|export|default|const|let|function|return|if|else|type|as|async|await|new|typeof|extends|try|catch|throw)\b/y,
      "keyword",
    ],
    [/\b(?:true|false|null|undefined)\b|\b\d+(?:\.\d+)?\b/y, "number"],
    [/[A-Za-z_$][\w$]*(?=\s*\()/y, "function"],
    [/[A-Za-z_$][\w$]*/y, null],
    [/\s+/y, null],
    [/./y, null],
  ],
  css: [
    [/\/\*[\s\S]*?\*\//y, "comment"],
    [/"[^"\n]*"|'[^'\n]*'/y, "string"],
    [/@[\w-]+/y, "keyword"],
    [/-{0,2}[a-zA-Z][\w-]*(?=\s*:(?!\w))/y, "property"],
    [/[\w-]+(?=\()/y, "function"],
    [/[.:#[\]="\w-]+(?=[^{};]*\{)/y, "tag"],
    [/#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|rem|em|%|ms|s|vh|vw)?\b/y, "number"],
    [/\s+/y, null],
    [/./y, null],
  ],
  bash: [
    [/#[^\n]*/y, "comment"],
    [/"[^"\n]*"|'[^'\n]*'/y, "string"],
    [/\b(?:npm|pnpm|yarn|bun|npx|git)\b/y, "keyword"],
    [/\s--?[\w-]+/y, "property"],
    [/\s+/y, null],
    [/./y, null],
  ],
  html: [
    [/<!--[\s\S]*?-->/y, "comment"],
    [/<\/?[\w-]+|\/?>/y, "tag"],
    [/"[^"]*"|'[^']*'/y, "string"],
    [/[\w-]+(?==)/y, "property"],
    [/\s+/y, null],
    [/./y, null],
  ],
};

export function tokenize(code: string, language: Language): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < code.length) {
    for (const [pattern, kind] of RULES[language]) {
      pattern.lastIndex = index;
      const match = pattern.exec(code);
      if (!match || match[0].length === 0) continue;

      const last = tokens[tokens.length - 1];
      // Merge plain text runs to keep the DOM small.
      if (kind === null && last?.kind === null) last.text += match[0];
      else tokens.push({ text: match[0], kind });

      index += match[0].length;
      break;
    }
  }

  return tokens;
}
