import "@testing-library/jest-dom/vitest";

if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string): MediaQueryList => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: (): void => {
        // Deprecated API intentionally no-op for compatibility.
      },
      removeListener: (): void => {
        // Deprecated API intentionally no-op for compatibility.
      },
      addEventListener: (): void => {
        // No-op for test environment.
      },
      removeEventListener: (): void => {
        // No-op for test environment.
      },
      dispatchEvent: (): boolean => false
    })
  });
}
