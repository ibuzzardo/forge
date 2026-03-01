import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Inter: () => ({ variable: "--font-inter-mock" })
}));

vi.mock("@/lib/config/env", () => ({
  env: {
    NEXT_PUBLIC_APP_NAME: "Forge Test App"
  }
}));

import RootLayout, { metadata } from "@/app/layout";

describe("app layout", () => {
  it("exports metadata with app name title", () => {
    expect(metadata.title).toBe("Forge Test App");
    expect(metadata.description).toBe("Forge client portal");
  });

  it("renders html/body shell with expected classes", () => {
    const tree = RootLayout({ children: <div id="child" /> });

    expect(tree.type).toBe("html");
    expect(tree.props.lang).toBe("en");
    expect(tree.props.className).toBe("--font-inter-mock");

    const body = tree.props.children;
    expect(body.type).toBe("body");
    expect(body.props.className).toContain("font-sans");
    expect(body.props.className).toContain("antialiased");
    expect(body.props.children.props.id).toBe("child");
  });
});
