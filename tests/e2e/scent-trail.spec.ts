import { expect, type Page, test } from "@playwright/test";

async function pressAndSettle(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key);
  await page.waitForTimeout(150);
}

async function followPath(page: Page, keys: string[]): Promise<void> {
  for (const key of keys) {
    await pressAndSettle(page, key);
  }
}

async function enterOldPasture(page: Page): Promise<void> {
  await page.keyboard.press("H");
  await page.keyboard.press("H");
  await page.keyboard.press("H");
  await page.keyboard.press("W");
  await page.keyboard.press("D");
  await page.keyboard.press("G");
  await page.keyboard.press("B");
  await page.keyboard.press("R");
  await followPath(page, [
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
    "ArrowDown",
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
  ]);
  await page.keyboard.press("E");
}

test("tracks an old scent trail into a hidden grove with the sheepdog", async ({ page }) => {
  await page.goto("/?skipTitle=1&motion=120&skipIntro=1");

  const debugState = page.locator("#debug-state");
  const inventoryObjective = page.locator("#objective-inventory");
  const groveObjective = page.locator("#objective-grove");
  const questPrompt = page.locator("#quest-prompt");
  const questMessage = page.locator("#quest-message");

  await expect(inventoryObjective).toContainText("Inventory: Staff");
  await expect(groveObjective).toContainText("Hidden grove hidden");

  await enterOldPasture(page);

  await expect(debugState).toContainText("Area old-pasture");

  await followPath(page, ["ArrowDown", "ArrowDown", "ArrowDown"]);

  await expect(debugState).toContainText("Aquilla 2,9");
  await expect(questPrompt).toContainText("track the old scent");

  await page.keyboard.press("F");

  await expect(debugState).toContainText("Dog fetch 3,11");
  await expect(debugState).toContainText("Grove found");
  await expect(debugState).toContainText("Inventory shepherd-staff,grove-lantern");
  await expect(inventoryObjective).toContainText("Inventory: Staff, Grove Lantern");
  await expect(groveObjective).toContainText("Hidden grove found");
  await expect(questMessage).toContainText("grove lantern");
});
