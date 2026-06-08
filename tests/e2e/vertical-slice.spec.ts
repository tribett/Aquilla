import { expect, test } from "@playwright/test";

test("plays the staff dog and Fold completion loop with hotkeys", async ({ page }) => {
  await page.goto("/");

  const debugState = page.locator("#debug-state");

  await page.keyboard.press("H");
  await expect(debugState).toContainText("Sheep 1/3");

  await page.keyboard.press("H");
  await expect(debugState).toContainText("Sheep 2/3");

  await page.keyboard.press("H");
  await expect(debugState).toContainText("Sheep 3/3");

  await page.keyboard.press("W");
  await expect(debugState).toContainText("Water restored");

  await page.keyboard.press("D");
  await page.keyboard.press("G");
  await expect(debugState).toContainText("Guardian calmed");

  await page.keyboard.press("R");
  await expect(debugState).toContainText("Fold restored");
});
