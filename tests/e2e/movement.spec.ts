import { expect, test } from "@playwright/test";

test("moves Aquilla right with the keyboard and refreshes debug state", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("#debug-state")).toContainText("Aquilla 5,5");

  await page.keyboard.press("ArrowRight");

  await expect(page.locator("#debug-state")).toContainText("Aquilla 6,5");
});
