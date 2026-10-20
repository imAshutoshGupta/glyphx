export type Command = {
    id: string;
    title: string;
    subtitle?: string;
    keywords?: string[];
    shortcut?: string;
    group?: string;
    // May return anything, including a promise: GlyphX doesn't use the
    // result or wait for it. (A void return type would reject one-liners
    // like `() => window.open(url)`.)
    run: () => unknown;
  };
  