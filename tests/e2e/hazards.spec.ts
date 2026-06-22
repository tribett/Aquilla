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

test("thorn snares cost resolve until Aquilla restores them with the staff", async ({ page }) => {
  await page.goto("/?skipTitle=1&motion=120&skipIntro=1");

  const debugState = page.locator("#debug-state");
  const questPrompt = page.locator("#quest-prompt");
  const questMessage = page.locator("#quest-message");
  const thornsObjective = page.locator("#objective-thorns");

  await expect(debugState).toContainText("Resolve 3/3");
  await expect(thornsObjective).toContainText("Thorn snares 0/2");

  await followPath(page, ["ArrowUp"]);
  await expect(questPrompt).toContainText("restore the thorn snare");

  await page.keyboard.press("ArrowUp");

  await expect(debugState).toContainText("Resolve 2/3");
  await expect(debugState).toContainText("Aquilla 5,4");
  await expect(questMessage).toContainText("steps back");

  await page.keyboard.press("E");

  await expect(thornsObjective).toContainText("Thorn snares 1/2");
  await expect(questMessage).toContainText("wounded becomes a way");

  await pressAndSettle(page, "ArrowUp");

  await expect(debugState).toContainText("Aquilla 5,3");
  await expect(debugState).toContainText("Resolve 2/3");
});
