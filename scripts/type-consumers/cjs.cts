import { GlyphX, type Command, type GlyphXProps } from "glyphx";

const commands: Command[] = [{ id: "home", title: "Go Home", run: () => {} }];
const props: GlyphXProps = { commands, theme: "dark", shortcut: [{ key: "k" }] };

export const element = GlyphX(props);

// Fails if the types didn't load: an unresolved type would accept anything.
// @ts-expect-error -- not a valid theme
export const invalid: GlyphXProps = { commands, theme: "blue" };
