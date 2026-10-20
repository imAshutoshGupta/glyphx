import { Check } from "lucide-react";
import { render } from "../render";
import { Layout } from "../components/Layout";
import {
  AUTHOR_EMAIL,
  AUTHOR_GITHUB,
  CONTACT_URL,
  GITHUB_PRIVACY_URL,
  ISSUES_URL,
  LICENSE_URL,
  REPO_URL,
} from "../links";
import { THEME_STORAGE_KEY } from "../theme";

const SUMMARY = [
  "No cookies, analytics, ads or tracking scripts.",
  "No accounts, forms or comments, so nothing you type here is sent anywhere.",
  "No fonts, images or scripts from other companies: every file comes from this site.",
  "One setting saved in your browser: your light or dark choice, if you make one.",
  "The GlyphX library makes no network requests and collects no data.",
];

function Privacy() {
  return (
    <div className="container">
      <header className="page-header">
        <h1>Privacy and data</h1>
        <p>
          The short version: this website doesn't track you, and GlyphX itself
          never collects anything.
        </p>
      </header>

      <div className="prose">
        <p className="muted">Effective 20 October 2026.</p>

        <div className="summary-box">
          <ul>
            {SUMMARY.map((item) => (
              <li key={item}>
                <Check size={16} aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <section aria-labelledby="who">
          <h2 id="who">Who runs this website</h2>
          <p>
            GlyphX is a project by{" "}
            <a href={AUTHOR_GITHUB}>Ashutosh Gupta</a>. This website
            documents it and lets you try it. Its source code is public on{" "}
            <a href={REPO_URL}>GitHub</a>.
          </p>
        </section>

        <section aria-labelledby="collect">
          <h2 id="collect">What we collect</h2>
          <p>
            Nothing. The website has no server of its own and no database: it's
            a set of static files. When you search in the command palette, the
            search happens entirely in your browser.
          </p>
        </section>

        <section aria-labelledby="hosting">
          <h2 id="hosting">Hosting</h2>
          <p>
            The website is hosted on GitHub Pages. Like any web host, GitHub
            receives technical information when your browser asks for a page,
            such as your IP address, and may keep it in logs to run and secure
            the service. We have no access to those logs. GitHub describes how
            it handles this data in the{" "}
            <a href={GITHUB_PRIVACY_URL}>GitHub General Privacy Statement</a>.
          </p>
        </section>

        <section aria-labelledby="storage">
          <h2 id="storage">What's stored in your browser</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Where</th>
                  <th scope="col">Value</th>
                  <th scope="col">Why</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>{THEME_STORAGE_KEY}</code>
                  </td>
                  <td>Local storage</td>
                  <td>
                    <code>light</code> or <code>dark</code>
                  </td>
                  <td>
                    To show the site in the theme you picked next time. Saved
                    only when you pick light or dark.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            It never leaves your device. To remove it, switch to the system
            theme, or clear this site's data in your browser's settings.
            Accent colors and playground settings aren't saved: they reset when
            you reload the page.
          </p>
        </section>

        <section aria-labelledby="clipboard">
          <h2 id="clipboard">Your clipboard</h2>
          <p>
            The site writes to your clipboard only when you press a Copy button
            or run a copy command. It never reads your clipboard.
          </p>
        </section>

        <section aria-labelledby="links">
          <h2 id="links">Links to other websites</h2>
          <p>
            Links to GitHub, npm and other sites (including example.com, which a
            playground command opens) take you to services with their own
            privacy policies.
          </p>
        </section>

        <section aria-labelledby="library">
          <h2 id="library">The GlyphX library</h2>
          <p>When you add GlyphX to your own app:</p>
          <ul>
            <li>It makes no network requests and sends no telemetry.</li>
            <li>It doesn't use cookies, local storage or any other storage.</li>
            <li>
              Your commands, and anything people type into the palette, stay in
              your app's memory.
            </li>
            <li>Commands run your own code and nothing else.</li>
          </ul>
          <p>
            In other words, GlyphX adds nothing to the data your app collects.
          </p>
        </section>

        <section aria-labelledby="how">
          <h2 id="how">How this website works</h2>
          <p>
            The pages are built from the <code>site/</code> folder of the{" "}
            <a href={REPO_URL}>GlyphX repository</a> and published by GitHub
            Actions every time the main branch changes. There's no server-side
            code and no sign-in. Everything, including the command palette on
            every page, runs in your browser.
          </p>
        </section>

        <section aria-labelledby="children">
          <h2 id="children">Children</h2>
          <p>
            This website is for software developers and isn't aimed at
            children. It doesn't collect personal data from anyone.
          </p>
        </section>

        <section aria-labelledby="changes">
          <h2 id="changes">Changes to this page</h2>
          <p>
            If anything here changes, we'll update this page and the date at
            the top. Every past version is in the repository's history on
            GitHub.
          </p>
        </section>

        <section aria-labelledby="contact">
          <h2 id="contact">Questions</h2>
          <p>
            Email <a href={CONTACT_URL}>{AUTHOR_EMAIL}</a>, or{" "}
            <a href={ISSUES_URL}>open an issue on GitHub</a>. Issues are public,
            so please don't include private information there.
          </p>
        </section>

        <section aria-labelledby="license">
          <h2 id="license">License and warranty</h2>
          <p>
            GlyphX is released under the{" "}
            <a href={LICENSE_URL}>PolyForm Noncommercial License 1.0.0</a>: it's
            free for personal and other noncommercial use, and commercial use
            needs the author's permission. The software is provided “as is”,
            without warranty of any kind.
            Website content © 2026 Ashutosh Gupta.
          </p>
        </section>
      </div>
    </div>
  );
}

render(
  <Layout page="privacy">
    <Privacy />
  </Layout>
);
