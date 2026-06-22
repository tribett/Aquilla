import { expect, type Page } from "@playwright/test";
import { followPath, lightCreedBeacons, pressAndSettle } from "./creedBeacons";

export async function enterOldPasture(page: Page): Promise<void> {
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
  await pressAndSettle(page, "E");
}

export async function restoreLanternRuins(page: Page): Promise<void> {
  await enterOldPasture(page);
  await followPath(page, ["ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight"]);
  await pressAndSettle(page, "E");
  await pressAndSettle(page, "E");
  await followPath(page, [
    "ArrowLeft",
    "ArrowLeft",
    "ArrowLeft",
    "ArrowLeft",
    "ArrowDown",
    "ArrowDown",
    "ArrowDown",
  ]);
  await pressAndSettle(page, "F");
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
  await pressAndSettle(page, "E");
  await lightCreedBeacons(page);
}

export async function completeChapterOne(page: Page): Promise<void> {
  await page.goto("/?skipTitle=1&skipIntro=1");

  const areaLabel = page.locator("#area-label");
  const debugState = page.locator("#debug-state");
  const questPrompt = page.locator("#quest-prompt");
  const questMessage = page.locator("#quest-message");
  const sanctumObjective = page.locator("#objective-sanctum");

  await restoreLanternRuins(page);

  await expect(debugState).toContainText("Ruins restored");

  await followPath(page, ["ArrowRight", "ArrowRight", "ArrowRight"]);
  await expect(questPrompt).toContainText("enter the Sanctum");
  await pressAndSettle(page, "E");

  await expect(areaLabel).toContainText("Sanctum");
  await expect(debugState).toContainText("Area sanctum");
  await expect(sanctumObjective).toContainText("Sanctum witness 0/3");

  await followPath(page, ["ArrowRight", "ArrowRight", "ArrowRight"]);
  await expect(questPrompt).toContainText("Remember");
  await pressAndSettle(page, "E");

  await expect(sanctumObjective).toContainText("Sanctum witness 1/3");
  await expect(questMessage).toContainText("gift");

  await followPath(page, ["ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight"]);
  await expect(questPrompt).toContainText("Receive");
  await pressAndSettle(page, "E");

  await expect(sanctumObjective).toContainText("Sanctum witness 2/3");
  await expect(questMessage).toContainText("Christ");

  await followPath(page, ["ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight"]);
  await expect(questPrompt).toContainText("Return");
  await pressAndSettle(page, "E");

  await expect(sanctumObjective).toContainText("Sanctum witness 3/3");
  await expect(questMessage).toContainText("sent");
  await expect(debugState).toContainText("Game complete");

  await followPath(page, [
    "ArrowLeft",
    "ArrowLeft",
    "ArrowLeft",
    "ArrowLeft",
    "ArrowLeft",
    "ArrowLeft",
    "ArrowLeft",
    "ArrowLeft",
    "ArrowLeft",
    "ArrowLeft",
    "ArrowLeft",
    "ArrowLeft",
    "ArrowLeft",
    "ArrowLeft",
  ]);
  await expect(questPrompt).toContainText("return to Briarfold");
  await pressAndSettle(page, "E");

  await expect(areaLabel).toContainText("Briarfold");
  await expect(debugState).toContainText("Home returned");
  await expect(page.locator("#objective-homecoming")).toContainText("Returned home");

  await followPath(page, ["ArrowLeft", "ArrowLeft"]);
  await expect(questPrompt).toContainText("close the witness");
  await pressAndSettle(page, "E");
  await pressAndSettle(page, "E");
  await pressAndSettle(page, "E");
  await pressAndSettle(page, "E");
  await pressAndSettle(page, "E");
  await pressAndSettle(page, "E");
  await pressAndSettle(page, "E");

  await expect(page.locator("#objective-story")).toContainText("Story complete");
  await expect(page.locator("#ending-panel")).toBeVisible();
  await expect(debugState).toContainText("Story complete");
}
