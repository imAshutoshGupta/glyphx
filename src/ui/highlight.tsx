export function highlightText(text: string, indexes: readonly number[] | null) {
  if (!indexes || indexes.length === 0) {
    return text;
  }

  const matched = new Set(indexes);

  // Coalesce consecutive matched / unmatched characters into a single span per
  // run, rather than one span per character. A 30-char title with a 3-char
  // match becomes ~3 spans instead of 30 — a huge DOM-node reduction across a
  // full result list, which is what keeps scrolling smooth.
  const runs: { text: string; highlight: boolean }[] = [];

  for (let i = 0; i < text.length; i++) {
    const highlight = matched.has(i);
    const last = runs[runs.length - 1];

    if (last && last.highlight === highlight) {
      last.text += text[i];
    } else {
      runs.push({ text: text[i], highlight });
    }
  }

  return runs.map((run, i) =>
    run.highlight ? (
      <span key={i} className="text-[rgb(var(--glyphx-accent))]">
        {run.text}
      </span>
    ) : (
      <span key={i}>{run.text}</span>
    )
  );
}
