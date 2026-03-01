import { afterEach, describe, expect, it, vi } from "vitest";

describe("test setup matchMedia polyfill", () => {
  const original = Object.getOwnPropertyDescriptor(window, "matchMedia");

  afterEach(() => {
    vi.resetModules();

    if (original) {
      Object.defineProperty(window, "matchMedia", original);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete (window as Window & { matchMedia?: unknown }).matchMedia;
  });

  it("defines window.matchMedia when missing", async () => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete (window as Window & { matchMedia?: unknown }).matchMedia;

    await import("@/test/setup");

    expect(window.matchMedia).toBeTypeOf("function");

    const result = window.matchMedia("(min-width: 768px)");
    expect(result.matches).toBe(false);
    expect(result.media).toBe("(min-width: 768px)");
    expect(result.addEventListener).toBeTypeOf("function");
    expect(result.removeEventListener).toBeTypeOf("function");
    expect(result.dispatchEvent(new Event("change"))).toBe(false);
  });

  it("does not override an existing window.matchMedia", async () => {
    const existing = vi.fn((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => true)
    })) as unknown as typeof window.matchMedia;

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: existing
    });

    await import("@/test/setup");

    expect(window.matchMedia).toBe(existing);
  });
});
