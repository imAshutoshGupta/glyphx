import type { KeyboardEvent as ReactKeyboardEvent } from "react";
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

  it("accepts several shortcuts", () => {
    setPlatform("MacIntel");
    const onTrigger = vi.fn();
    renderHook(() =>
      useCommandShortcut(onTrigger, [{ key: "p", shift: true }, { key: "k" }])
    );

    press({ key: "p", metaKey: true, shiftKey: true });
    press({ key: "k", metaKey: true });
    expect(onTrigger).toHaveBeenCalledTimes(2);
  });

  it("matches the physical key when the layout types a non-Latin character", () => {
    setPlatform("Win32");
    const onTrigger = vi.fn();
    renderHook(() => useCommandShortcut(onTrigger));

    // Ctrl+Shift+P on a Russian layout
    press({ key: "З", code: "KeyP", ctrlKey: true, shiftKey: true });
    expect(onTrigger).toHaveBeenCalledOnce();
  });

  it("matches the physical key when Option changes the character on macOS", () => {
    setPlatform("MacIntel");
    const onTrigger = vi.fn();
    renderHook(() => useCommandShortcut(onTrigger, { key: "j", alt: true }));

    press({ key: "∆", code: "KeyJ", metaKey: true, altKey: true });
    expect(onTrigger).toHaveBeenCalledOnce();
  });

  it("goes by the typed letter on remapped Latin layouts", () => {
    setPlatform("MacIntel");
    const onTrigger = vi.fn();
    renderHook(() => useCommandShortcut(onTrigger));

    // Dvorak: the key in QWERTY's P position types L.
    press({ key: "L", code: "KeyP", metaKey: true, shiftKey: true });
    expect(onTrigger).not.toHaveBeenCalled();
  });

  it("ignores keydown events without a key (browser autofill)", () => {
    setPlatform("MacIntel");
    const onTrigger = vi.fn();
    renderHook(() => useCommandShortcut(onTrigger));

    const event = new KeyboardEvent("keydown", { metaKey: true, shiftKey: true });
    Object.defineProperty(event, "key", { value: undefined });
    expect(() => window.dispatchEvent(event)).not.toThrow();
    expect(onTrigger).not.toHaveBeenCalled();
  });

  it("calls the latest callback without re-adding the listener on each render", () => {
    setPlatform("MacIntel");
    const addListener = vi.spyOn(window, "addEventListener");
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(
      // An inline shortcut object, as consumers usually pass it.
      ({ onTrigger }) => useCommandShortcut(onTrigger, { key: "j" }),
      { initialProps: { onTrigger: first } }
    );
    rerender({ onTrigger: second });

    press({ key: "j", metaKey: true });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledOnce();
    expect(addListener.mock.calls.filter(([type]) => type === "keydown")).toHaveLength(1);
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

  const setup = () => {
    const commands = makeCommands();
    act(() => usePaletteStore.getState().registerCommands(commands));
    const onSelect = vi.fn();
    const { result } = renderHook(() => usePaletteNavigation(onSelect));

    // The handler is attached to the dialog with onKeyDown, so it receives
    // React keyboard events.
    const keyDown = (key: string, { isComposing = false, keyCode = 0 } = {}) => {
      const event = { key, keyCode, nativeEvent: { isComposing }, preventDefault: vi.fn() };
      act(() => result.current(event as unknown as ReactKeyboardEvent));
      return event;
    };

    return { commands, onSelect, keyDown };
  };

  it("moves the selection with the arrow keys", () => {
    const { keyDown } = setup();
    keyDown("ArrowDown");
    expect(usePaletteStore.getState().selectedIndex).toBe(1);

    keyDown("ArrowUp");
    expect(usePaletteStore.getState().selectedIndex).toBe(0);
  });

  it("picks the selected command on Enter", () => {
    const { commands, onSelect, keyDown } = setup();
    keyDown("ArrowDown");
    const event = keyDown("Enter");

    expect(onSelect).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ id: "b", run: commands[1].run })
    );
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("does nothing on Enter when there are no results", () => {
    const { onSelect, keyDown } = setup();
    act(() => usePaletteStore.getState().setQuery("zzzzzz"));
    keyDown("Enter");

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("leaves keys to an IME while it is composing text", () => {
    const { onSelect, keyDown } = setup();
    keyDown("ArrowDown", { isComposing: true });
    const enter = keyDown("Enter", { isComposing: true });
    // Safari: the Enter that ends composition has isComposing false.
    keyDown("Enter", { keyCode: 229 });

    expect(usePaletteStore.getState().selectedIndex).toBe(0);
    expect(onSelect).not.toHaveBeenCalled();
    expect(enter.preventDefault).not.toHaveBeenCalled();
  });

  it("leaves other keys, including Escape, alone", () => {
    const { onSelect, keyDown } = setup();
    const letter = keyDown("a");
    const escape = keyDown("Escape");

    expect(letter.preventDefault).not.toHaveBeenCalled();
    expect(escape.preventDefault).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
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
