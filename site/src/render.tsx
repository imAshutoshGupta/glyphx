import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
// Typefaces are bundled and served from this site (no font CDN).
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "glyphx/style.css";
import "./site.css";

// Each page's entry file calls this with its page component.
export function render(page: ReactNode) {
  createRoot(document.getElementById("root")!).render(<StrictMode>{page}</StrictMode>);
}
