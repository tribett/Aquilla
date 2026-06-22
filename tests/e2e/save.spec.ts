import { expect, test } from "@playwright/test";

test("autosaves progress across reloads and resets with a new-game key", async ({ page }) => {
  await page.goto("/?skipTitle=1&skipIntro=1");
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  const debugState = page.locator("#debug-state");
  const sheepObjective = page.locator("#objective-sheep");

  await expect(page.getByText("N reset")).toBeVisible();
  await expect(debugState).toContainText("Sheep 0/3");

  await page.keyboard.press("H");

  await expect(debugState).toContainText("Sheep 1/3");
  await expect(sheepObjective).toContainText("Lost sheep 1/3");

  await page.reload();

  await expect(debugState).toContainText("Sheep 1/3");
  await expect(sheepObjective).toContainText("Lost sheep 1/3");

  await page.keyboard.press("N");

  await expect(debugState).toContainText("Sheep 0/3");
  await expect(sheepObjective).toContainText("Lost sheep 0/3");

  await page.reload();

  await expect(debugState).toContainText("Sheep 0/3");
  await expect(sheepObjective).toContainText("Lost sheep 0/3");
});
