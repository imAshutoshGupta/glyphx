import { GlyphX, type Command, type GlyphXProps } from "glyphx";

const commands: Command[] = [{ id: "home", title: "Go Home", run: () => {} }];
const props: GlyphXProps = { commands, theme: "dark", shortcut: [{ key: "k" }] };

export const element = GlyphX(props);

// Fails if the types didn't load: an unresolved type would accept anything.
// @ts-expect-error -- not a valid theme
export const invalid: GlyphXProps = { commands, theme: "blue" };

// run may return anything, like window.open's Window or a router's promise.
export const oneLiners: Command[] = [
  { id: "count", title: "Count", run: () => 42 },
  { id: "later", title: "Later", run: () => Promise.resolve(true) },
];
