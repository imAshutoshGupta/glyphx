import "@testing-library/jest-dom/vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GlyphX } from "./CommandPaletteProvider";
import type { GlyphXProps } from "./types";
import type { Command } from "../engine";
import { usePaletteStore } from "../state/paletteStore";

afterEach(cleanup);

beforeEach(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  usePaletteStore.setState({
    commands: [],
    normalized: [],
    results: [],
    isOpen: false,
    query: "",
    selectedIndex: 0,
  });
});

const makeCommands = (): Command[] => [
  { id: "home", title: "Go Home", group: "Nav", run: vi.fn() },
  { id: "settings", title: "Open Settings", group: "Nav", run: vi.fn() },
  { id: "invite", title: "Invite Member", group: "Team", run: vi.fn() },
];

// is the palette visible?
const isOpen = () => screen.queryByPlaceholderText("Type a command…") !== null;

const getInput = () => screen.getByRole("combobox", { hidden: true });

// query a command row by accessible name (hidden: true bypasses Radix's aria-hidden on siblings)
const getItem = (name: RegExp | string) =>
  screen.getByRole("option", { name, hidden: true });
const queryItem = (name: RegExp | string) =>
  screen.queryByRole("option", { name, hidden: true });

// the highlighted row
const getSelected = () =>
  screen.getByRole("option", { selected: true, hidden: true });

// type into the search input via fireEvent (more reliable for controlled inputs in jsdom)
const typeQuery = (text: string) => {
  fireEvent.change(getInput(), { target: { value: text } });
};

// open the palette via its default keyboard shortcut (Ctrl/⌘+Shift+P)
const openPalette = () =>
  fireEvent.keyDown(window, { key: "p", ctrlKey: true, shiftKey: true });

// Commands run once the palette has finished closing, which Radix completes
// in a timeout.
const waitForRun = (command: Command) =>
  waitFor(() => expect(command.run).toHaveBeenCalledOnce());

// A parent that controls the palette through `open` / `onOpenChange`.
function ControlledHost(props: Omit<GlyphXProps, "open" | "onOpenChange">) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open palette</button>
      <output data-testid="parent-state">{String(open)}</output>
      <GlyphX {...props} open={open} onOpenChange={setOpen} />
    </>
  );
}
const parentState = () => screen.getByTestId("parent-state").textContent;
const clickParentOpen = () =>
  fireEvent.click(screen.getByRole("button", { name: "Open palette", hidden: true }));

// ─── open / close ─────────────────────────────────────────────────────────────

describe("open and close", () => {
  it("palette is not visible on initial render", () => {
    render(<GlyphX commands={makeCommands()} />);
    expect(isOpen()).toBe(false);
  });

  it("opens when the default shortcut is pressed", () => {
    render(<GlyphX commands={makeCommands()} />);
    openPalette();
    expect(isOpen()).toBe(true);
  });

  it("closes when Escape is pressed", async () => {
    const user = userEvent.setup();
    render(<GlyphX commands={makeCommands()} />);
    openPalette();
    await user.keyboard("{Escape}");
    expect(isOpen()).toBe(false);
  });

  it("returns focus to where it was after closing", async () => {
    const user = userEvent.setup();
    render(
      <>
        <input data-testid="editor" />
        <GlyphX commands={makeCommands()} />
      </>
    );
    const editor = screen.getByTestId("editor");
    editor.focus();
    openPalette();
    await waitFor(() => expect(getInput()).toHaveFocus());

    await user.keyboard("{Escape}");
    await waitFor(() => expect(editor).toHaveFocus());
  });

  it("opens and closes via controlled open prop", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <GlyphX commands={makeCommands()} open={false} onOpenChange={onOpenChange} />
    );
    expect(isOpen()).toBe(false);

    rerender(<GlyphX commands={makeCommands()} open={true} onOpenChange={onOpenChange} />);
    expect(isOpen()).toBe(true);

    rerender(<GlyphX commands={makeCommands()} open={false} onOpenChange={onOpenChange} />);
    expect(isOpen()).toBe(false);
  });

  it("calls onOpenChange(true) when the default shortcut is pressed", () => {
    const onOpenChange = vi.fn();
    render(<GlyphX commands={makeCommands()} open={false} onOpenChange={onOpenChange} />);
    openPalette();
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("controlled: follows the open prop instead of opening itself", () => {
    const onOpenChange = vi.fn();
    render(<GlyphX commands={makeCommands()} open={false} onOpenChange={onOpenChange} />);
    openPalette();
    // The parent didn't set open, so the palette stays closed.
    expect(isOpen()).toBe(false);
  });

  it("controlled: tells the parent when a command closes the palette, so it can reopen", async () => {
    const commands = makeCommands();
    render(<ControlledHost commands={commands} />);

    clickParentOpen();
    expect(isOpen()).toBe(true);

    fireEvent.keyDown(getInput(), { key: "Enter" });
    await waitForRun(commands[0]);
    expect(isOpen()).toBe(false);
    expect(parentState()).toBe("false");

    clickParentOpen();
    expect(isOpen()).toBe(true);
  });

  it("calls onOpenChange(false) once when Escape closes the palette", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<GlyphX commands={makeCommands()} onOpenChange={onOpenChange} />);
    openPalette();
    onOpenChange.mockClear();

    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
  });

  it("opens via a custom shortcut and ignores the default", () => {
    render(<GlyphX commands={makeCommands()} shortcut={{ key: "j" }} />);

    // the default shortcut no longer opens it
    openPalette();
    expect(isOpen()).toBe(false);

    // the configured one does
    fireEvent.keyDown(window, { key: "j", ctrlKey: true });
    expect(isOpen()).toBe(true);
  });

  it("opens via any of several shortcuts", () => {
    render(
      <GlyphX commands={makeCommands()} shortcut={[{ key: "p", shift: true }, { key: "k" }]} />
    );
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(isOpen()).toBe(true);
  });
});

// ─── theme ────────────────────────────────────────────────────────────────────

describe("theme", () => {
  const dialog = () => screen.getByRole("dialog", { hidden: true });

  it("follows the system color scheme by default", () => {
    render(<GlyphX commands={makeCommands()} />);
    openPalette();
    expect(dialog()).not.toHaveAttribute("data-glyphx-theme");
  });

  it("can be set to light or dark", () => {
    const { rerender } = render(<GlyphX commands={makeCommands()} theme="dark" />);
    openPalette();
    expect(dialog()).toHaveAttribute("data-glyphx-theme", "dark");

    rerender(<GlyphX commands={makeCommands()} theme="light" />);
    expect(dialog()).toHaveAttribute("data-glyphx-theme", "light");
  });
});

// ─── search ───────────────────────────────────────────────────────────────────

describe("search", () => {
  it("shows all commands when opened with no query", () => {
    render(<GlyphX commands={makeCommands()} />);
    openPalette();

    expect(getItem(/Go Home/)).toBeInTheDocument();
    expect(getItem(/Open Settings/)).toBeInTheDocument();
    expect(getItem(/Invite Member/)).toBeInTheDocument();
  });

  it("filters commands as the user types", () => {
    render(<GlyphX commands={makeCommands()} />);
    openPalette();
    typeQuery("settings");

    expect(getItem(/Open Settings/)).toBeInTheDocument();
    expect(queryItem(/Go Home/)).toBeNull();
  });

  it("shows empty state when query matches nothing", () => {
    render(<GlyphX commands={makeCommands()} />);
    openPalette();
    typeQuery("zzzzzzz");

    expect(screen.getByRole("status", { hidden: true })).toHaveTextContent(
      "No matching commands"
    );
  });

  it("resets query when palette is closed and reopened", async () => {
    const user = userEvent.setup();
    render(<GlyphX commands={makeCommands()} />);
    openPalette();
    typeQuery("settings");
    await user.keyboard("{Escape}");
    openPalette();

    expect(getItem(/Go Home/)).toBeInTheDocument();
    expect(getItem(/Open Settings/)).toBeInTheDocument();
  });

  it("keeps the search when the commands prop changes while open", () => {
    const { rerender } = render(<GlyphX commands={makeCommands()} />);
    openPalette();
    typeQuery("invite");

    // e.g. a parent re-render that passes a new (unmemoized) array
    rerender(<GlyphX commands={makeCommands()} />);

    expect(getInput()).toHaveValue("invite");
    expect(getItem(/Invite Member/)).toBeInTheDocument();
    expect(queryItem(/Go Home/)).toBeNull();
  });
});

// ─── keyboard navigation ──────────────────────────────────────────────────────

describe("keyboard navigation", () => {
  it("executes the first command on Enter (default selection)", async () => {
    const commands = makeCommands();
    const user = userEvent.setup();
    render(<GlyphX commands={commands} />);
    openPalette();
    await user.keyboard("{Enter}");
    await waitForRun(commands[0]);
  });

  it("closes the palette after executing a command via Enter", async () => {
    const user = userEvent.setup();
    render(<GlyphX commands={makeCommands()} />);
    openPalette();
    await user.keyboard("{Enter}");
    expect(isOpen()).toBe(false);
  });

  it("advances selection with ArrowDown and executes the second command on Enter", async () => {
    const commands = makeCommands();
    const user = userEvent.setup();
    render(<GlyphX commands={commands} />);
    openPalette();
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");
    await waitForRun(commands[1]);
    expect(commands[0].run).not.toHaveBeenCalled();
  });

  it("runs the highlighted command when groups are interleaved", async () => {
    // Displayed grouped: X → Alpha, Charlie; Y → Bravo.
    const commands: Command[] = [
      { id: "a", title: "Alpha", group: "X", run: vi.fn() },
      { id: "b", title: "Bravo", group: "Y", run: vi.fn() },
      { id: "c", title: "Charlie", group: "X", run: vi.fn() },
    ];
    render(<GlyphX commands={commands} />);
    openPalette();

    fireEvent.keyDown(getInput(), { key: "ArrowDown" });
    expect(getSelected()).toHaveAccessibleName("Charlie");

    fireEvent.keyDown(getInput(), { key: "Enter" });
    await waitForRun(commands[2]);
    expect(commands[1].run).not.toHaveBeenCalled();
  });

  it("keeps focus in the search input when tabbing", async () => {
    const commands = makeCommands();
    const user = userEvent.setup();
    render(<GlyphX commands={commands} />);
    openPalette();
    await waitFor(() => expect(getInput()).toHaveFocus());

    await user.tab();
    expect(getInput()).toHaveFocus();

    await user.keyboard("{Enter}");
    await waitForRun(commands[0]);
  });

  it("does not run a command on the Enter that ends IME composition", () => {
    const commands = makeCommands();
    render(<GlyphX commands={commands} />);
    openPalette();

    fireEvent.keyDown(getInput(), { key: "Enter", isComposing: true });
    expect(isOpen()).toBe(true);
    expect(commands[0].run).not.toHaveBeenCalled();
  });

  it("lets a command move focus", async () => {
    const command: Command = {
      id: "focus",
      title: "Focus the field",
      run: vi.fn(() => screen.getByTestId("field").focus()),
    };
    render(
      <>
        <input data-testid="field" />
        <GlyphX commands={[command]} />
      </>
    );
    openPalette();
    fireEvent.keyDown(getInput(), { key: "Enter" });

    await waitForRun(command);
    expect(screen.getByTestId("field")).toHaveFocus();
  });
});

// ─── mouse ────────────────────────────────────────────────────────────────────

describe("mouse", () => {
  it("executes the correct command on click", async () => {
    const commands = makeCommands();
    const user = userEvent.setup();
    render(<GlyphX commands={commands} />);
    openPalette();
    await user.click(getItem(/Invite Member/));
    await waitForRun(commands[2]);
  });

  it("closes the palette after a click", async () => {
    const user = userEvent.setup();
    render(<GlyphX commands={makeCommands()} />);
    openPalette();
    await user.click(getItem(/Go Home/));
    expect(isOpen()).toBe(false);
  });

  it("runs a command once when it is double-clicked", async () => {
    const commands = makeCommands();
    const user = userEvent.setup();
    render(<GlyphX commands={commands} />);
    openPalette();
    await user.dblClick(getItem(/Go Home/));
    await waitForRun(commands[0]);
  });

  it("selects the row under the pointer", () => {
    render(<GlyphX commands={makeCommands()} />);
    openPalette();

    fireEvent.pointerMove(getItem(/Invite Member/));
    expect(getSelected()).toHaveAccessibleName("Invite Member");
    expect(screen.getAllByRole("option", { selected: true, hidden: true })).toHaveLength(1);
  });

  // An async command that never settles: the palette must not wait for it.
  const pendingCommand = (): Command => ({
    id: "slow",
    title: "Slow Task",
    run: vi.fn(() => new Promise<void>(() => {})),
  });

  it("closes immediately on click without waiting for an async command", async () => {
    const command = pendingCommand();
    const user = userEvent.setup();
    render(<GlyphX commands={[command]} />);
    openPalette();
    await user.click(getItem(/Slow Task/));
    expect(isOpen()).toBe(false);
    await waitForRun(command);
  });

  it("closes immediately on Enter without waiting for an async command", async () => {
    const command = pendingCommand();
    const user = userEvent.setup();
    render(<GlyphX commands={[command]} />);
    openPalette();
    await user.keyboard("{Enter}");
    expect(isOpen()).toBe(false);
    await waitForRun(command);
  });
});

// ─── accessibility ────────────────────────────────────────────────────────────

describe("accessibility", () => {
  it("points the combobox at the selected option", () => {
    render(<GlyphX commands={makeCommands()} />);
    openPalette();

    const input = getInput();
    const listbox = screen.getByRole("listbox", { hidden: true });
    expect(input).toHaveAttribute("aria-controls", listbox.id);
    expect(input).toHaveAttribute("aria-activedescendant", getSelected().id);

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(getSelected()).toHaveAccessibleName("Open Settings");
    expect(input).toHaveAttribute("aria-activedescendant", getSelected().id);
  });

  it("labels each group with its heading", () => {
    render(<GlyphX commands={makeCommands()} />);
    openPalette();

    expect(screen.getByRole("group", { name: "Team", hidden: true })).toContainElement(
      getItem(/Invite Member/)
    );
  });

  it("describes options with their subtitle and shortcut", () => {
    render(
      <GlyphX
        commands={[
          { id: "a", title: "Go Home", subtitle: "Back to start", shortcut: "⌘ H", run: vi.fn() },
        ]}
      />
    );
    openPalette();

    const option = getItem("Go Home");
    expect(option).toHaveAccessibleName("Go Home");
    expect(option).toHaveAccessibleDescription("Back to start ⌘ H");
  });
});
