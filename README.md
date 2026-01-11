# GlyphX

A fast, keyboard-first, Spotlight-style command palette for React.

Glyph provides a clean, accessible, and native-feeling command menu inspired by macOS Spotlight and modern desktop tools.

## Features

- Keyboard-first UX (`⌘ + K` / `Ctrl + K`)
- Fuzzy search with ranked results
- Arrow-key navigation with auto-scroll
- Grouped commands
- System light / dark mode support
- Glass-style UI
- Accessible by default (Radix Dialog)
- Smooth, GPU-composited animations

## Installation

```bash
npm install glyphx
```
or
```bash
pnpm add glyphx
```
## Basic Usage

```tsx
import { GlyphX } from "glyphx";

const commands = [
  {
    id: "home",
    title: "Go to Home",
    group: "Navigation",
    run: () => {
      console.log("Navigate to home");
    },
  },
];

export default function App() {
  return <GlyphX commands={commands} />;
}
```
Press ⌘ + K on macOS or Ctrl + K on Windows/Linux to open the palette.

---

## Controlled Usage

```tsx
<GlyphX
  commands={commands}
  open={isOpen}
  onOpenChange={setIsOpen}
/>
```

## Command Shape

```ts
type Command = {
  id: string;
  title: string;
  group?: string;
  run: () => void;
};
```

## Design Goals

- Minimal visual noise
- Keyboard dominance
- Instant feedback
- Native-feeling motion
- Easy to integrate and customize

GlyphX is intended as a foundational UI primitive, not a full application.

## Status

GlyphX is in early development.  
APIs may change until a stable release is published.

## License

MIT
