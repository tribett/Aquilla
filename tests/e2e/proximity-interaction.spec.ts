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

async function walkUntilDebugContains(page: Page, text: string, key: string, maxSteps = 20): Promise<void> {
  const debugState = page.locator("#debug-state");

  for (let step = 0; step < maxSteps; step += 1) {
    const content = await debugState.textContent();
    if (content?.includes(text)) return;

    await pressAndSettle(page, key);

    if ((await debugState.textContent())?.includes(text)) return;
  }

  await expect(debugState).toContainText(text);
}

test("plays the Fold loop through proximity prompts and one interact key", async ({ page }) => {
  await page.goto("/?skipTitle=1&skipIntro=1&motion=120");

  const questPrompt = page.locator("#quest-prompt");
  const questMessage = page.locator("#quest-message");
  const debugState = page.locator("#debug-state");
  const areaLabel = page.locator("#area-label");
  const sheepObjective = page.locator("#objective-sheep");
  const waterObjective = page.locator("#objective-water");
  const guardianObjective = page.locator("#objective-guardian");
  const foldObjective = page.locator("#objective-fold");
  const bellObjective = page.locator("#objective-bell");

  await expect(sheepObjective).toContainText("Lost sheep 0/3");
  await expect(areaLabel).toContainText("Briarfold");
  await expect(waterObjective).toContainText("Spring dry");
  await expect(guardianObjective).toContainText("Guardian hostile");
  await expect(foldObjective).toContainText("Fold lost");
  await expect(bellObjective).toContainText("Fold bell silent");

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
  await expect(questPrompt).toContainText("ring the old fold-bell");
  await page.keyboard.press("E");
  await expect(debugState).toContainText("Bell rung");
  await expect(bellObjective).toContainText("Fold bell rung");
  await page.keyboard.press("E");
  await expect(debugState).toContainText("Area fold-of-the-lost");

  await walkUntilDebugContains(page, "Room fold-heart", "ArrowRight");
  await followPath(page, ["ArrowRight", "ArrowRight", "ArrowRight", "ArrowUp"]);
  await page.keyboard.press("E");
  await expect(debugState).toContainText("Fold restored");
  await expect(debugState).toContainText("Area briarfold");
  await expect(foldObjective).toContainText("Fold restored");
  await expect(questMessage).toContainText("Fold");

  await followPath(page, ["ArrowRight"]);
  await page.keyboard.press("E");

  await expect(debugState).toContainText("Area old-pasture");
  await expect(debugState).toContainText("Aquilla 2,6");
  await expect(areaLabel).toContainText("Old Pasture");
  await expect(questPrompt).toContainText("Explore the old pasture");
  await expect(questMessage).toContainText("Briarfold lies behind");
});
