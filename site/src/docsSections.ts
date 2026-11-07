// The documentation page's sections, in order. The docs sidebar and the
// palette's "Docs: …" commands are both built from this list.
//
// `group` is the sidebar heading the section is listed under; sections of a
// group must be next to each other. `subsections` are the section's h3
// headings, shown indented in the sidebar while that section is being read.
export const DOC_SECTIONS = [
  { id: "installation", title: "Installation", group: "Getting started" },
  { id: "quick-start", title: "Quick start", group: "Getting started" },
  { id: "commands", title: "Commands", group: "Getting started" },
  {
    id: "groups-and-search",
    title: "Groups, subtitles and search",
    group: "Guides",
    subsections: [
      { id: "how-search-works", title: "How search works" },
      { id: "how-groups-are-ordered", title: "How groups are ordered" },
    ],
  },
  { id: "running-commands", title: "Running commands", group: "Guides" },
  {
    id: "shortcuts",
    title: "Keyboard shortcuts",
    group: "Guides",
    subsections: [
      { id: "change-the-shortcut", title: "Change the shortcut" },
      { id: "inside-the-palette", title: "Inside the palette" },
    ],
  },
  { id: "controlled-mode", title: "Opening it from your own UI", group: "Guides" },
  {
    id: "theming",
    title: "Themes and colors",
    group: "Guides",
    subsections: [
      { id: "light-dark-system", title: "Light, dark or system" },
      { id: "colors", title: "Colors" },
      { id: "dark-mode-colors", title: "Different colors in dark mode" },
      { id: "styling-parts", title: "Styling individual parts" },
      { id: "frosted-glass", title: "Frosted glass" },
    ],
  },
  { id: "nextjs", title: "Next.js", group: "Guides" },
  { id: "script-tag", title: "Without a bundler", group: "Guides" },
  { id: "testing", title: "Testing your app", group: "Guides" },
  {
    id: "api",
    title: "API reference",
    group: "Reference",
    subsections: [
      { id: "api-props", title: "Props" },
      { id: "api-types", title: "Types" },
      { id: "api-entry-points", title: "Package entry points" },
    ],
  },
  { id: "typescript", title: "TypeScript", group: "Reference" },
  { id: "accessibility", title: "Accessibility", group: "Reference" },
  { id: "tips", title: "Tips and tricks", group: "Help" },
  { id: "faq", title: "FAQ and troubleshooting", group: "Help" },
] as const;

export type DocSectionId = (typeof DOC_SECTIONS)[number]["id"];

export type DocSection = {
  id: DocSectionId;
  title: string;
  group: string;
  subsections?: readonly { id: string; title: string }[];
};

// The sections, grouped under their sidebar headings, in order.
export const DOC_GROUPS = DOC_SECTIONS.reduce<{ title: string; sections: DocSection[] }[]>(
  (groups, section) => {
    const last = groups[groups.length - 1];
    if (last && last.title === section.group) last.sections.push(section);
    else groups.push({ title: section.group, sections: [section] });
    return groups;
  },
  []
);
