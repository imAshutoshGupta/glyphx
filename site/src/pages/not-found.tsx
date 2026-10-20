import { render } from "../render";
import { Layout } from "../components/Layout";
import { useSite } from "../context";
import { PAGES } from "../links";
import { MOD } from "../platform";

function NotFound() {
  const { openPalette } = useSite();

  return (
    <div className="container not-found">
      <p className="eyebrow">404</p>
      <h1>This page doesn't exist</h1>
      <p>
        It may have moved, or the link may have a typo. The command palette can
        take you anywhere on this site.
      </p>
      <div className="hero-actions">
        <button type="button" className="button button-primary" onClick={() => openPalette()}>
          Open the palette
          <kbd className="kbd keyboard-only">{MOD} K</kbd>
        </button>
        <a className="button button-secondary" href={PAGES.home}>
          Go to the homepage
        </a>
      </div>
    </div>
  );
}

render(
  <Layout page="not-found">
    <NotFound />
  </Layout>
);
