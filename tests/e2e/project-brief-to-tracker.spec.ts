import { test, expect } from "@playwright/test";

test("project brief page renders at key breakpoints", async ({ page }) => {
  await page.goto("/");

  await page.setViewportSize({ width: 320, height: 800 });
  await expect(page.getByText("Start Your Forge Build")).toBeVisible();

  await page.setViewportSize({ width: 768, height: 900 });
  await expect(page.getByText("Start Your Forge Build")).toBeVisible();

  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(page.getByText("Start Your Forge Build")).toBeVisible();
});
