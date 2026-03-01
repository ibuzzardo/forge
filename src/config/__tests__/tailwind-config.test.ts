import { describe, expect, it } from "vitest";
import config from "../../../../tailwind.config";

describe("tailwind.config", () => {
  it("uses class-based dark mode", () => {
    expect(config.darkMode).toEqual(["class"]);
  });

  it("scans app/component/hook/lib source globs", () => {
    expect(config.content).toEqual([
      "./src/app/**/*.{ts,tsx}",
      "./src/components/**/*.{ts,tsx}",
      "./src/hooks/**/*.{ts,tsx}",
      "./src/lib/**/*.{ts,tsx}"
    ]);
  });

  it("defines key extended color tokens", () => {
    const colors = config.theme?.extend?.colors as Record<string, unknown>;

    expect(colors.border).toBe("hsl(var(--border))");
    expect(colors.input).toBe("hsl(var(--border))");
    expect(colors.ring).toBe("hsl(var(--primary))");
    expect(colors.background).toBe("hsl(var(--background))");
    expect(colors.foreground).toBe("hsl(var(--foreground))");
    expect(colors.primary).toEqual({
      DEFAULT: "hsl(var(--primary))",
      foreground: "hsl(var(--primary-foreground))"
    });
    expect(colors.secondary).toEqual({
      DEFAULT: "hsl(var(--secondary))",
      foreground: "hsl(var(--secondary-foreground))"
    });
    expect(colors.destructive).toEqual({
      DEFAULT: "hsl(var(--destructive))",
      foreground: "hsl(var(--destructive-foreground))"
    });
    expect(colors["chart-1"]).toBe("hsl(var(--chart-1))");
    expect(colors["chart-5"]).toBe("hsl(var(--chart-5))");
  });

  it("defines custom radii and font family", () => {
    const extend = config.theme?.extend as {
      borderRadius: Record<string, string>;
      fontFamily: Record<string, string[]>;
    };

    expect(extend.borderRadius).toEqual({
      lg: "0.5rem",
      md: "0.375rem",
      xl: "0.75rem"
    });

    expect(extend.fontFamily.sans).toEqual([
      "var(--font-inter)",
      "Inter",
      "system-ui",
      "sans-serif"
    ]);
  });

  it("registers tailwindcss-animate plugin", () => {
    expect(Array.isArray(config.plugins)).toBe(true);
    expect(config.plugins).toHaveLength(1);
    expect(typeof config.plugins?.[0]).toBe("function");
  });
});
