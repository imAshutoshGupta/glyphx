import { useEffect, useRef, useState } from "react";

// Copies text and reports success for a moment, for "Copy" buttons.
export function useCopy() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard access can be blocked; the button just doesn't confirm.
    }
  };

  return { copied, copy };
}
