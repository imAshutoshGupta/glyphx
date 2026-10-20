import { CommandDialog } from "./CommandDialog";
import { usePaletteStore } from "../state/paletteStore";
import { CommandInput } from "./CommandInput";
import { CommandList } from "./CommandList";
import { usePaletteNavigation } from "../hooks/usePaletteNavigation";

type Props = {
  onOpenChange?: (open: boolean) => void;
};

export function CommandPalette({ onOpenChange }: Props) {
  const isOpen = usePaletteStore((s) => s.isOpen);
  const close = usePaletteStore((s) => s.close);

  usePaletteNavigation();

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={(o) => {
        if (!o) close();
        onOpenChange?.(o);
      }}
    >
      <div className="relative flex flex-col gap-2 p-2">
        <span
          className="
          absolute right-3 top-3
          text-xs text-[rgb(var(--glyphx-muted))]
          pointer-events-none
          select-none
        "
        >
          <kbd className="rounded border px-1.5 py-0.5 text-[10px]">Esc</kbd> to
          close
        </span>

        <CommandInput />
        <CommandList />
      </div>
    </CommandDialog>
  );
}
