import { describe, expect, it } from "vitest";
import config from "../../vitest.config";

describe("vitest.config", () => {
  it("defines src alias and jsdom test environment", () => {
    expect(config.resolve?.alias).toBeDefined();
    const alias = config.resolve?.alias as Record<string, string>;
    expect(alias["@"]).toMatch(/\/src$/);

    expect(config.test?.environment).toBe("jsdom");
    expect(config.test?.globals).toBe(true);
  });

  it("includes expected test patterns and setup file", () => {
    expect(config.test?.include).toContain("src/**/*.{test,spec}.{ts,tsx}");
    expect(config.test?.setupFiles).toContain("./src/test/setup.ts");
  });

  it("enables v8 coverage with expected reporters and paths", () => {
    expect(config.test?.coverage?.provider).toBe("v8");
    expect(config.test?.coverage?.reporter).toEqual(["text", "html"]);
    expect(config.test?.coverage?.include).toContain("src/**/*.{ts,tsx}");
    expect(config.test?.coverage?.exclude).toContain("src/**/*.d.ts");
    expect(config.test?.coverage?.exclude).toContain("src/test/**");
  });
});
