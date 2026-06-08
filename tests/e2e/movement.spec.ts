import { expect, test } from "@playwright/test";

test("moves Aquilla right with the keyboard and refreshes debug state", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("#debug-state")).toContainText("Aquilla 5,5");

  await page.keyboard.press("ArrowRight");

  await expect(page.locator("#debug-state")).toContainText("Aquilla 6,5");
});

test("blocks Aquilla from entering water tiles in the art map", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await expect(page.locator("#debug-state")).toContainText("Aquilla 8,10");

  await page.keyboard.press("ArrowLeft");

  await expect(page.locator("#debug-state")).toContainText("Aquilla 8,10");
});
