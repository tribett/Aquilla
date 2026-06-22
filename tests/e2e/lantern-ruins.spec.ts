import { expect, type Page, test } from "@playwright/test";
import { followPath, lightCreedBeacons, pressAndSettle } from "./helpers/creedBeacons";

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
  await pressAndSettle(page, "E");
}

test("opens the Lantern Ruins after the fear echo and lights the creed beacons", async ({ page }) => {
  test.setTimeout(90_000);

  await page.goto("/?skipTitle=1&skipIntro=1");

  await expect(page.locator("#game-root canvas")).toBeVisible();

  const areaLabel = page.locator("#area-label");
  const debugState = page.locator("#debug-state");
  const questPrompt = page.locator("#quest-prompt");
  const questMessage = page.locator("#quest-message");
  const creedObjective = page.locator("#objective-creed");
  const inventoryObjective = page.locator("#objective-inventory");

  await enterOldPasture(page);
  await followPath(page, ["ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight"]);
  await pressAndSettle(page, "E");
  await pressAndSettle(page, "E");

  await expect(debugState).toContainText("FearEcho calmed");

  await followPath(page, [
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
  await expect(questPrompt).toContainText("find the grove lantern");
  await page.keyboard.press("E");
  await expect(areaLabel).toContainText("Old Pasture");
  await expect(questMessage).toContainText("The Lantern Ruins wait for the grove lantern");

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
    "ArrowDown",
    "ArrowDown",
    "ArrowDown",
  ]);
  await expect(questPrompt).toContainText("track the old scent");
  await page.keyboard.press("F");
  await expect(inventoryObjective).toContainText("Inventory: Staff, Grove Lantern");

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
  await expect(questPrompt).toContainText("enter the Lantern Ruins");
  await pressAndSettle(page, "E");

  await expect(areaLabel).toContainText("Lantern Ruins");
  await expect(debugState).toContainText("Area lantern-ruins");
  await expect(debugState).toContainText("Room lantern-beacon-hall");
  await expect(creedObjective).toContainText("Creed beacons 0/3");

  await lightCreedBeacons(page);

  await expect(questMessage).toContainText("Spirit");
  await expect(debugState).toContainText("Ruins restored");
});
