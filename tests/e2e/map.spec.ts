import { expect, test } from "@playwright/test";

test("opens an area map overlay and pauses movement while it is open", async ({ page }) => {
  await page.goto("/?skipTitle=1&skipIntro=1");

  const map = page.locator("#map-panel");
  const debugState = page.locator("#debug-state");

  await expect(page.getByText("M map")).toBeVisible();
  await expect(map).toHaveCount(1);
  await expect(map).toBeHidden();
  await expect(debugState).toContainText("Aquilla 5,5");

  await page.keyboard.press("M");

  await expect(map).toBeVisible();
  await expect(map).toContainText("Area Map");
  await expect(map).toContainText("Current: Briarfold");
  await expect(map).toContainText("Briarfold current");
  await expect(map).toContainText("Old Pasture locked");
  await expect(map).toContainText("Lantern Ruins locked");
  await expect(map).toContainText("Sanctum locked");
  await expect(map).toContainText("Next gate: Restore the Fold to open the Old Pasture.");
  await expect(map).toContainText("Inventory: Staff");

  await page.keyboard.press("ArrowRight");

  await expect(debugState).toContainText("Aquilla 5,5");

  await page.keyboard.press("Escape");

  await expect(map).toBeHidden();

  await page.keyboard.press("ArrowRight");

  await expect(debugState).toContainText("Aquilla 6,5");
});

test("updates the area map as Aquilla opens the wider road", async ({ page }) => {
  await page.goto("/?skipTitle=1&skipIntro=1");

  await page.keyboard.press("H");
  await page.keyboard.press("H");
  await page.keyboard.press("H");
  await page.keyboard.press("W");
  await page.keyboard.press("D");
  await page.keyboard.press("G");
  await page.keyboard.press("B");
  await page.keyboard.press("R");
  await page.keyboard.press("M");

  const map = page.locator("#map-panel");

  await expect(map).toBeVisible();
  await expect(map).toContainText("Briarfold current");
  await expect(map).toContainText("Old Pasture open");
  await expect(map).toContainText("Next gate: Calm the fear echo in the Old Pasture.");
});
