import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { tokenize, type Language } from "../highlight";
import { useCopy } from "../useCopy";
import { INSTALL_COMMANDS, type PackageManager } from "../links";

const LANGUAGE_LABELS: Record<Language, string> = {
  tsx: "TSX",
  css: "CSS",
  bash: "Terminal",
  html: "HTML",
};

function Highlighted({ code, language }: { code: string; language: Language }) {
  return tokenize(code, language).map((token, i) =>
    token.kind ? (
      <span key={i} className={`tok-${token.kind}`}>
        {token.text}
      </span>
    ) : (
      token.text
    )
  );
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const { copied, copy } = useCopy();
  return (
    <button type="button" className="copy-button" onClick={() => copy(text)}>
      {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}

type CodeProps = {
  code: string;
  language?: Language;
  title?: string;
};

export function Code({ code, language = "tsx", title }: CodeProps) {
  return (
    <figure className="code">
      <div className="code-header">
        <span>{title ?? LANGUAGE_LABELS[language]}</span>
        <CopyButton text={code} />
      </div>
      <pre tabIndex={0} aria-label={title ?? LANGUAGE_LABELS[language]}>
        <code>
          <Highlighted code={code} language={language} />
        </code>
      </pre>
    </figure>
  );
}

// The install command, with a tab for each package manager.
export function InstallTabs() {
  const [manager, setManager] = useState<PackageManager>("npm");
  const managers = Object.keys(INSTALL_COMMANDS) as PackageManager[];
  const command = INSTALL_COMMANDS[manager];

  return (
    <figure className="code">
      <div className="code-header">
        <div className="code-tabs" role="group" aria-label="Package manager">
          {managers.map((name) => (
            <button
              key={name}
              type="button"
              aria-pressed={name === manager}
              onClick={() => setManager(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <CopyButton text={command} />
      </div>
      <pre tabIndex={0} aria-label={`${manager} command`}>
        <code>
          <Highlighted code={command} language="bash" />
        </code>
      </pre>
    </figure>
  );
}
