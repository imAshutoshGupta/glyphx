import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import type { KeyboardEventHandler, ReactNode } from "react";
import type { GlyphXTheme } from "../palette/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Called just before focus moves into the dialog.
  onOpenAutoFocus: () => void;
  // Called after the dialog has closed, when focus would return to the page.
  onCloseAutoFocus: (event: Event) => void;
  onKeyDown: KeyboardEventHandler<HTMLDivElement>;
  theme: GlyphXTheme;
  children: ReactNode;
};

export function CommandDialog({
  open,
  onOpenChange,
  onOpenAutoFocus,
  onCloseAutoFocus,
  onKeyDown,
  theme,
  children,
}: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="glyphx-overlay" />

        {/* The open/close animations are on the Overlay and Content
            themselves, so Radix keeps both mounted until the close animation
            has finished. */}
        <Dialog.Content
          className="glyphx-content"
          data-glyphx-theme={theme === "system" ? undefined : theme}
          onKeyDown={onKeyDown}
          onOpenAutoFocus={onOpenAutoFocus}
          onCloseAutoFocus={onCloseAutoFocus}
        >
          <VisuallyHidden.Root>
            <Dialog.Title>Command Palette</Dialog.Title>
            <Dialog.Description>Type to search and run commands</Dialog.Description>
          </VisuallyHidden.Root>

          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
