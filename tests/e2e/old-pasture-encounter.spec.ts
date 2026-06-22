import { expect, type Page, test } from "@playwright/test";

async function pressAndSettle(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key);
  await page.waitForTimeout(300);
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

test("restores the Old Pasture fear echo without killing it", async ({ page }) => {
  await page.goto("/?skipTitle=1&skipIntro=1");

  const debugState = page.locator("#debug-state");
  const questPrompt = page.locator("#quest-prompt");
  const questMessage = page.locator("#quest-message");
  const fearObjective = page.locator("#objective-fear");

  await expect(fearObjective).toContainText("Fear echo restless");

  await enterOldPasture(page);

  await expect(debugState).toContainText("Area old-pasture");
  await expect(fearObjective).toContainText("Fear echo restless");

  await followPath(page, ["ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight"]);

  await expect(questPrompt).toContainText("steady the fear echo");

  await page.keyboard.press("E");

  await expect(questMessage).toContainText("steadies the fear echo");
  await expect(fearObjective).toContainText("Fear echo restless");

  await page.keyboard.press("E");

  await expect(questMessage).toContainText("releases its borrowed voice");
  await expect(debugState).toContainText("FearEcho calmed");
  await expect(fearObjective).toContainText("Fear echo calmed");
});
