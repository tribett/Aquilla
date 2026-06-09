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

async function restoreLanternRuins(page: Page): Promise<void> {
  await enterOldPasture(page);
  await followPath(page, ["ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight"]);
  await page.keyboard.press("E");
  await page.keyboard.press("E");
  await followPath(page, [
    "ArrowLeft",
    "ArrowLeft",
    "ArrowLeft",
    "ArrowLeft",
    "ArrowDown",
    "ArrowDown",
    "ArrowDown",
  ]);
  await page.keyboard.press("F");
  await followPath(page, [
    "ArrowUp",
    "ArrowUp",
    "ArrowUp",
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
  ]);
  await page.keyboard.press("E");
  await followPath(page, ["ArrowRight", "ArrowRight", "ArrowRight"]);
  await page.keyboard.press("E");
  await followPath(page, ["ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight"]);
  await page.keyboard.press("E");
  await followPath(page, ["ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight"]);
  await page.keyboard.press("E");
}

test("finishes the current arc in the Sanctum and marks the game complete", async ({ page }) => {
  await page.goto("/?motion=120");

  const areaLabel = page.locator("#area-label");
  const debugState = page.locator("#debug-state");
  const questPrompt = page.locator("#quest-prompt");
  const questMessage = page.locator("#quest-message");
  const sanctumObjective = page.locator("#objective-sanctum");

  await restoreLanternRuins(page);

  await expect(debugState).toContainText("Ruins restored");

  await followPath(page, ["ArrowRight", "ArrowRight"]);
  await expect(questPrompt).toContainText("enter the Sanctum");
  await page.keyboard.press("E");

  await expect(areaLabel).toContainText("Area: Sanctum");
  await expect(debugState).toContainText("Area sanctum");
  await expect(sanctumObjective).toContainText("Sanctum witness 0/3");

  await followPath(page, ["ArrowRight", "ArrowRight", "ArrowRight"]);
  await expect(questPrompt).toContainText("Remember");
  await page.keyboard.press("E");

  await expect(sanctumObjective).toContainText("Sanctum witness 1/3");
  await expect(questMessage).toContainText("gift");

  await followPath(page, ["ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight"]);
  await expect(questPrompt).toContainText("Receive");
  await page.keyboard.press("E");

  await expect(sanctumObjective).toContainText("Sanctum witness 2/3");
  await expect(questMessage).toContainText("Christ");

  await followPath(page, ["ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight"]);
  await expect(questPrompt).toContainText("Return");
  await page.keyboard.press("E");

  await expect(sanctumObjective).toContainText("Sanctum witness 3/3");
  await expect(questMessage).toContainText("sent");
  await expect(debugState).toContainText("Game complete");
});
