// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GlyphX } from "./CommandPaletteProvider";
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

// query an item button by accessible name (hidden: true bypasses Radix's aria-hidden on siblings)
const getItem = (name: RegExp | string) =>
  screen.getByRole("button", { name, hidden: true });
const queryItem = (name: RegExp | string) =>
  screen.queryByRole("button", { name, hidden: true });

// type into the search input via fireEvent (more reliable for controlled inputs in jsdom)
const typeQuery = (text: string) => {
  const input = screen.getByPlaceholderText("Type a command…");
  fireEvent.change(input, { target: { value: text } });
};

// open the palette via its default keyboard shortcut (Ctrl/⌘+Shift+P)
const openPalette = () =>
  fireEvent.keyDown(window, { key: "p", ctrlKey: true, shiftKey: true });

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

  it("opens via a custom shortcut and ignores the default", () => {
    render(<GlyphX commands={makeCommands()} shortcut={{ key: "j" }} />);

    // the default shortcut no longer opens it
    openPalette();
    expect(isOpen()).toBe(false);

    // the configured one does
    fireEvent.keyDown(window, { key: "j", ctrlKey: true });
    expect(isOpen()).toBe(true);
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

    expect(screen.getByText("No matching commands")).toBeInTheDocument();
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
});

// ─── keyboard navigation ──────────────────────────────────────────────────────

describe("keyboard navigation", () => {
  it("executes the first command on Enter (default selection)", async () => {
    const commands = makeCommands();
    const user = userEvent.setup();
    render(<GlyphX commands={commands} />);
    openPalette();
    await user.keyboard("{Enter}");
    expect(commands[0].run).toHaveBeenCalledOnce();
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
    expect(commands[1].run).toHaveBeenCalledOnce();
    expect(commands[0].run).not.toHaveBeenCalled();
  });

  it("executes the correct command on click", async () => {
    const commands = makeCommands();
    const user = userEvent.setup();
    render(<GlyphX commands={commands} />);
    openPalette();
    await user.click(getItem(/Invite Member/));
    expect(commands[2].run).toHaveBeenCalledOnce();
  });

  it("closes the palette after a click", async () => {
    const user = userEvent.setup();
    render(<GlyphX commands={makeCommands()} />);
    openPalette();
    await user.click(getItem(/Go Home/));
    expect(isOpen()).toBe(false);
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
    expect(command.run).toHaveBeenCalledOnce();
    expect(isOpen()).toBe(false);
  });

  it("closes immediately on Enter without waiting for an async command", async () => {
    const command = pendingCommand();
    const user = userEvent.setup();
    render(<GlyphX commands={[command]} />);
    openPalette();
    await user.keyboard("{Enter}");
    expect(command.run).toHaveBeenCalledOnce();
    expect(isOpen()).toBe(false);
  });
});
