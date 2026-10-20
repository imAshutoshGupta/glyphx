import { GlyphX, type Command, type GlyphXProps } from "glyphx";

const commands: Command[] = [{ id: "home", title: "Go Home", run: () => {} }];
const props: GlyphXProps = { commands, theme: "dark", shortcut: [{ key: "k" }] };

export const element = GlyphX(props);
