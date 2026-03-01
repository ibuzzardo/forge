import path from "node:path";
import { describe, expect, it } from "vitest";
import config from "../../../../vitest.config";

describe("vitest.config", () => {
  it("uses src alias mapped to an absolute src path", () => {
    const aliasPath = config.resolve?.alias?.["@"]; 

    expect(typeof aliasPath).toBe("string");
    expect(path.isAbsolute(aliasPath as string)).toBe(true);
    expect((aliasPath as string).endsWith(`${path.sep}src`)).toBe(true);
  });

  it("configures jsdom test environment and setup file", () => {
    expect(config.test?.environment).toBe("jsdom");
    expect(config.test?.globals).toBe(true);
    expect(config.test?.setupFiles).toEqual(["./src/test/setup-tests.ts"]);
  });

  it("includes and excludes expected test patterns", () => {
    expect(config.test?.include).toEqual(["src/**/*.test.ts", "src/**/*.test.tsx"]);
    expect(config.test?.exclude).toEqual([
      "node_modules",
      ".next",
      "dist",
      "coverage",
      "e2e"
    ]);
  });

  it("enables consistent mock lifecycle options", () => {
    expect(config.test?.clearMocks).toBe(true);
    expect(config.test?.restoreMocks).toBe(true);
    expect(config.test?.mockReset).toBe(true);
  });

  it("defines coverage provider/reporters and source include rules", () => {
    const coverage = config.test?.coverage;

    expect(coverage?.provider).toBe("v8");
    expect(coverage?.reporter).toEqual(["text", "html", "lcov"]);
    expect(coverage?.reportsDirectory).toBe("./coverage");
    expect(coverage?.include).toEqual(["src/**/*.{ts,tsx}"]);
    expect(coverage?.exclude).toEqual([
      "src/**/*.d.ts",
      "src/**/__tests__/**",
      "src/test/**",
      "src/**/index.ts"
    ]);
  });
});
