import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

type PackageJson = {
  name: string;
  version: string;
  private: boolean;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};

const packageJsonPath = path.resolve(process.cwd(), "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as PackageJson;

describe("package.json", () => {
  it("defines expected package identity", () => {
    expect(packageJson.name).toBe("forge");
    expect(packageJson.version).toBe("0.1.0");
    expect(packageJson.private).toBe(true);
  });

  it("exposes expected app scripts", () => {
    expect(packageJson.scripts).toMatchObject({
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
      test: "vitest run",
      "test:watch": "vitest",
      "test:coverage": "vitest run --coverage"
    });
  });

  it("includes runtime dependencies needed by app and UI", () => {
    const deps = packageJson.dependencies;

    expect(deps).toEqual(
      expect.objectContaining({
        next: expect.stringMatching(/^\^/),
        react: expect.stringMatching(/^\^/),
        "react-dom": expect.stringMatching(/^\^/),
        zod: expect.stringMatching(/^\^/),
        "next-themes": expect.stringMatching(/^\^/),
        "lucide-react": expect.stringMatching(/^\^/),
        "class-variance-authority": expect.stringMatching(/^\^/),
        clsx: expect.stringMatching(/^\^/),
        "tailwind-merge": expect.stringMatching(/^\^/)
      })
    );
  });

  it("includes required testing/tooling dev dependencies", () => {
    const devDeps = packageJson.devDependencies;

    expect(devDeps).toEqual(
      expect.objectContaining({
        vitest: expect.stringMatching(/^\^/),
        jsdom: expect.stringMatching(/^\^/),
        "@testing-library/react": expect.stringMatching(/^\^/),
        "@testing-library/jest-dom": expect.stringMatching(/^\^/),
        "@vitest/coverage-v8": expect.stringMatching(/^\^/),
        typescript: expect.stringMatching(/^\^/),
        eslint: expect.stringMatching(/^\^/),
        "eslint-config-next": expect.stringMatching(/^\^/),
        tailwindcss: expect.stringMatching(/^\^/),
        postcss: expect.stringMatching(/^\^/),
        autoprefixer: expect.stringMatching(/^\^/)
      })
    );
  });
});
