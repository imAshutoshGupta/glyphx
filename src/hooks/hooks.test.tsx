// @vitest-environment jsdom
import { renderHook, cleanup, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useCommandShortcut } from "./useCommandShortcut";
import { usePaletteNavigation } from "./usePaletteNavigation";
import { useAutoScroll } from "./useAutoScroll";
import { usePaletteStore } from "../state/paletteStore";
import type { Command } from "../engine";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const setPlatform = (platform: string) =>
  vi.spyOn(navigator, "platform", "get").mockReturnValue(platform);

const press = (init: KeyboardEventInit) => {
  const event = new KeyboardEvent("keydown", {
    bubbles: true,
    cancelable: true,
    ...init,
  });
  window.dispatchEvent(event);
  return event;
};

describe("useCommandShortcut", () => {
  it("fires on Cmd+Shift+P by default on macOS", () => {
    setPlatform("MacIntel");
    const onTrigger = vi.fn();
    renderHook(() => useCommandShortcut(onTrigger));

    const event = press({ key: "p", metaKey: true, shiftKey: true });
    expect(onTrigger).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
  });

  it("fires on Ctrl+Shift+P by default on non-mac platforms", () => {
    setPlatform("Win32");
    const onTrigger = vi.fn();
    renderHook(() => useCommandShortcut(onTrigger));

    press({ key: "p", metaKey: true, shiftKey: true });
    expect(onTrigger).not.toHaveBeenCalled();

    press({ key: "p", ctrlKey: true, shiftKey: true });
    expect(onTrigger).toHaveBeenCalledOnce();
  });

  it("matches the key case-insensitively", () => {
    setPlatform("MacIntel");
    const onTrigger = vi.fn();
    renderHook(() => useCommandShortcut(onTrigger));

    // Shift makes browsers report an uppercase key
    press({ key: "P", metaKey: true, shiftKey: true });
    expect(onTrigger).toHaveBeenCalledOnce();
  });

  it("requires the primary modifier", () => {
    setPlatform("MacIntel");
    const onTrigger = vi.fn();
    renderHook(() => useCommandShortcut(onTrigger));

    const event = press({ key: "p", shiftKey: true });
    expect(onTrigger).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  it("matches shift and alt exactly", () => {
    setPlatform("MacIntel");
    const onTrigger = vi.fn();
    renderHook(() => useCommandShortcut(onTrigger, { key: "k" }));

    press({ key: "k", metaKey: true, shiftKey: true });
    press({ key: "k", metaKey: true, altKey: true });
    expect(onTrigger).not.toHaveBeenCalled();

    press({ key: "k", metaKey: true });
    expect(onTrigger).toHaveBeenCalledOnce();
  });

  it("supports alt in a custom shortcut", () => {
    setPlatform("MacIntel");
    const onTrigger = vi.fn();
    renderHook(() => useCommandShortcut(onTrigger, { key: "j", alt: true }));

    press({ key: "j", metaKey: true });
    expect(onTrigger).not.toHaveBeenCalled();

    press({ key: "j", metaKey: true, altKey: true });
    expect(onTrigger).toHaveBeenCalledOnce();
  });

  it("prefers userAgentData.platform when available", () => {
    setPlatform("Win32");
    Object.defineProperty(navigator, "userAgentData", {
      configurable: true,
      value: { platform: "macOS" },
    });
    try {
      const onTrigger = vi.fn();
      renderHook(() => useCommandShortcut(onTrigger));

      press({ key: "p", metaKey: true, shiftKey: true });
      expect(onTrigger).toHaveBeenCalledOnce();
    } finally {
      delete (navigator as { userAgentData?: unknown }).userAgentData;
    }
  });

  it("removes the listener on unmount", () => {
    setPlatform("MacIntel");
    const onTrigger = vi.fn();
    const { unmount } = renderHook(() => useCommandShortcut(onTrigger));
    unmount();

    press({ key: "p", metaKey: true, shiftKey: true });
    expect(onTrigger).not.toHaveBeenCalled();
  });
});

describe("usePaletteNavigation", () => {
  const makeCommands = (): Command[] => [
    { id: "a", title: "Alpha", run: vi.fn() },
    { id: "b", title: "Bravo", run: vi.fn() },
  ];

  beforeEach(() => {
    usePaletteStore.setState({
      commands: [],
      normalized: [],
      results: [],
      isOpen: false,
      query: "",
      selectedIndex: 0,
    });
  });

  const setup = (open = true) => {
    const commands = makeCommands();
    act(() => {
      usePaletteStore.getState().registerCommands(commands);
      if (open) usePaletteStore.getState().open();
    });
    renderHook(() => usePaletteNavigation());
    return commands;
  };

  it("ignores keys while the palette is closed", () => {
    setup(false);
    const event = press({ key: "ArrowDown" });
    expect(usePaletteStore.getState().selectedIndex).toBe(0);
    expect(event.defaultPrevented).toBe(false);
  });

  it("moves the selection with the arrow keys", () => {
    setup();
    act(() => void press({ key: "ArrowDown" }));
    expect(usePaletteStore.getState().selectedIndex).toBe(1);

    act(() => void press({ key: "ArrowUp" }));
    expect(usePaletteStore.getState().selectedIndex).toBe(0);
  });

  it("runs the selected command and closes on Enter", () => {
    const commands = setup();
    act(() => void press({ key: "ArrowDown" }));
    act(() => void press({ key: "Enter" }));

    expect(commands[1].run).toHaveBeenCalledOnce();
    expect(commands[0].run).not.toHaveBeenCalled();
    expect(usePaletteStore.getState().isOpen).toBe(false);
  });

  it("closes without running anything on Escape", () => {
    const commands = setup();
    act(() => void press({ key: "Escape" }));

    expect(usePaletteStore.getState().isOpen).toBe(false);
    expect(commands[0].run).not.toHaveBeenCalled();
  });

  it("does nothing on Enter when there are no results", () => {
    setup();
    act(() => usePaletteStore.getState().setQuery("zzzzzz"));
    act(() => void press({ key: "Enter" }));

    expect(usePaletteStore.getState().isOpen).toBe(true);
  });
});

describe("useAutoScroll", () => {
  it("scrolls the element into view only when active", () => {
    const el = document.createElement("div");
    el.scrollIntoView = vi.fn();
    const ref = { current: el };

    const { rerender } = renderHook(
      ({ active }) => useAutoScroll(ref, active),
      { initialProps: { active: false } }
    );
    expect(el.scrollIntoView).not.toHaveBeenCalled();

    rerender({ active: true });
    expect(el.scrollIntoView).toHaveBeenCalledWith({
      block: "nearest",
      inline: "nearest",
    });
  });

  it("is a no-op when the ref is empty", () => {
    expect(() =>
      renderHook(() => useAutoScroll({ current: null }, true))
    ).not.toThrow();
  });
});
