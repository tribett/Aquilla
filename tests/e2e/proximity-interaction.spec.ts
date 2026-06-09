import { expect, type Page, test } from "@playwright/test";

async function pressAndSettle(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key);
  await page.waitForTimeout(450);
}

async function followPath(page: Page, keys: string[]): Promise<void> {
  for (const key of keys) {
    await pressAndSettle(page, key);
  }
}

test("plays the Fold loop through proximity prompts and one interact key", async ({ page }) => {
  await page.goto("/");

  const questPrompt = page.locator("#quest-prompt");
  const questMessage = page.locator("#quest-message");
  const debugState = page.locator("#debug-state");

  await followPath(page, ["ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight"]);
  await expect(questPrompt).toContainText("Press E");
  await page.keyboard.press("E");
  await expect(debugState).toContainText("Sheep 1/3");
  await expect(questMessage).toContainText("sheepdog");

  await followPath(page, ["ArrowDown", "ArrowDown", "ArrowRight", "ArrowRight", "ArrowRight"]);
  await page.keyboard.press("E");
  await expect(debugState).toContainText("Sheep 2/3");

  await followPath(page, ["ArrowDown", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowLeft", "ArrowLeft"]);
  await page.keyboard.press("E");
  await expect(debugState).toContainText("Sheep 3/3");

  await followPath(page, ["ArrowLeft"]);
  await expect(questPrompt).toContainText("dry channel");
  await page.keyboard.press("E");
  await expect(debugState).toContainText("Water restored");

  await followPath(page, ["ArrowRight", "ArrowRight", "ArrowUp", "ArrowUp", "ArrowUp", "ArrowUp", "ArrowUp"]);
  await page.keyboard.press("E");
  await expect(debugState).toContainText("Dog distract");
  await page.keyboard.press("E");
  await expect(debugState).toContainText("Guardian calmed");

  await followPath(page, [
    "ArrowDown",
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
    "ArrowRight",
  ]);
  await page.keyboard.press("E");
  await expect(debugState).toContainText("Fold restored");
  await expect(questMessage).toContainText("Fold");
});
