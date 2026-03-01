import { describe, expect, it } from "vitest";
import config from "../../tailwind.config";

describe("tailwind.config", () => {
  it("uses class-based dark mode and expected content globs", () => {
    expect(config.darkMode).toEqual(["class"]);
    expect(config.content).toEqual(
      expect.arrayContaining([
        "./src/app/**/*.{ts,tsx}",
        "./src/components/**/*.{ts,tsx}",
        "./src/hooks/**/*.{ts,tsx}",
        "./src/lib/**/*.{ts,tsx}"
      ])
    );
  });

  it("defines theme tokens used by app styles", () => {
    const extend = config.theme?.extend as Record<string, any>;

    expect(extend.colors.primary.DEFAULT).toBe("hsl(var(--primary))");
    expect(extend.colors.primary.foreground).toBe("hsl(var(--primary-foreground))");
    expect(extend.colors.chart["1"]).toBe("hsl(var(--chart-1))");
    expect(extend.borderRadius.lg).toBe("0.5rem");
    expect(extend.fontFamily.sans).toEqual(
      expect.arrayContaining(["var(--font-inter)", "Inter", "ui-sans-serif"])
    );
  });

  it("registers animation plugin", () => {
    expect(config.plugins).toBeDefined();
    expect(Array.isArray(config.plugins)).toBe(true);
    expect((config.plugins as unknown[]).length).toBeGreaterThan(0);
  });
});
