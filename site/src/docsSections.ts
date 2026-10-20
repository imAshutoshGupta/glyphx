// The documentation page's sections, in order. The docs sidebar and the
// palette's "Docs: …" commands are both built from this list.
export const DOC_SECTIONS = [
  { id: "installation", title: "Installation" },
  { id: "quick-start", title: "Quick start" },
  { id: "commands", title: "Commands" },
  { id: "groups-and-search", title: "Groups, subtitles and search" },
  { id: "running-commands", title: "Running commands" },
  { id: "shortcuts", title: "Keyboard shortcuts" },
  { id: "controlled-mode", title: "Opening it from your own UI" },
  { id: "theming", title: "Themes and colors" },
  { id: "nextjs", title: "Next.js" },
  { id: "script-tag", title: "Without a bundler" },
  { id: "typescript", title: "TypeScript" },
  { id: "accessibility", title: "Accessibility" },
  { id: "testing", title: "Testing your app" },
  { id: "tips", title: "Tips and tricks" },
  { id: "faq", title: "FAQ and troubleshooting" },
  { id: "api", title: "API reference" },
] as const;

export type DocSectionId = (typeof DOC_SECTIONS)[number]["id"];
