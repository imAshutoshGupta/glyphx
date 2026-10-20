// Types a search into the open palette, for the home page's "Type …" cards.
// GlyphX has no prop for an initial search, so this sets the input's value
// the way typing would and lets React see the change. It waits a few frames
// for the palette to appear.
export function typeIntoPalette(query: string, framesLeft = 30) {
  const input = document.querySelector<HTMLInputElement>(".glyphx-input");
  if (!input) {
    if (framesLeft > 0) requestAnimationFrame(() => typeIntoPalette(query, framesLeft - 1));
    return;
  }
  const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  setValue.call(input, query);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}
