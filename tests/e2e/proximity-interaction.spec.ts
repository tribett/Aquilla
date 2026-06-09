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
  const areaLabel = page.locator("#area-label");
  const sheepObjective = page.locator("#objective-sheep");
  const waterObjective = page.locator("#objective-water");
  const guardianObjective = page.locator("#objective-guardian");
  const foldObjective = page.locator("#objective-fold");

  await expect(sheepObjective).toContainText("Lost sheep 0/3");
  await expect(areaLabel).toContainText("Area: Briarfold");
  await expect(waterObjective).toContainText("Spring dry");
  await expect(guardianObjective).toContainText("Guardian hostile");
  await expect(foldObjective).toContainText("Fold lost");

  await followPath(page, ["ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight"]);
  await expect(questPrompt).toContainText("Press E");
  await page.keyboard.press("E");
  await expect(debugState).toContainText("Sheep 1/3");
  await expect(sheepObjective).toContainText("Lost sheep 1/3");
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
  await expect(waterObjective).toContainText("Spring restored");

  await followPath(page, ["ArrowRight", "ArrowRight", "ArrowUp", "ArrowUp", "ArrowUp", "ArrowUp", "ArrowUp"]);
  await page.keyboard.press("E");
  await expect(debugState).toContainText("Dog distract");
  await page.keyboard.press("E");
  await expect(debugState).toContainText("Guardian calmed");
  await expect(guardianObjective).toContainText("Guardian calmed");

  await followPath(page, ["ArrowDown", "ArrowRight", "ArrowRight", "ArrowRight"]);
  await expect(questPrompt).toContainText("Press F then S");
  await page.keyboard.press("F");
  await expect(debugState).toContainText("Dog fetch 9,6");
  await page.keyboard.press("S");
  await expect(debugState).toContainText("ShepherdGate open");
  await followPath(page, ["ArrowRight", "ArrowRight", "ArrowRight"]);
  await page.keyboard.press("E");
  await expect(debugState).toContainText("Fold restored");
  await expect(foldObjective).toContainText("Fold restored");
  await expect(questMessage).toContainText("Fold");

  await page.keyboard.press("E");

  await expect(debugState).toContainText("Area old-pasture");
  await expect(debugState).toContainText("Aquilla 2,6");
  await expect(areaLabel).toContainText("Area: Old Pasture");
  await expect(questPrompt).toContainText("Explore the old pasture");
  await expect(questMessage).toContainText("Briarfold lies behind");
});
