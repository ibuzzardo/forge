import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("globals.css", () => {
  it("defines Tailwind layers and root/dark theme variables", async () => {
    const cssPath = path.resolve(process.cwd(), "src/app/globals.css");
    const css = await readFile(cssPath, "utf8");

    expect(css).toContain("@tailwind base;");
    expect(css).toContain("@tailwind components;");
    expect(css).toContain("@tailwind utilities;");

    expect(css).toContain(":root {");
    expect(css).toContain(".dark {");

    expect(css).toContain("--background:");
    expect(css).toContain("--foreground:");
    expect(css).toContain("--primary:");
    expect(css).toContain("--secondary:");
    expect(css).toContain("--accent:");
    expect(css).toContain("--destructive:");
    expect(css).toContain("--chart-1:");
    expect(css).toContain("--chart-5:");
  });

  it("applies global border and body typography utilities", async () => {
    const cssPath = path.resolve(process.cwd(), "src/app/globals.css");
    const css = await readFile(cssPath, "utf8");

    expect(css).toContain("@apply border-border;");
    expect(css).toContain("@apply bg-background text-foreground font-sans antialiased;");
  });
});
