import { expect, type Page } from "@playwright/test";

export async function pressAndSettle(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key);
  await page.waitForTimeout(450);
}

export async function followPath(page: Page, keys: string[]): Promise<void> {
  for (const key of keys) {
    await pressAndSettle(page, key);
  }
}

export async function lightCreedBeacons(page: Page): Promise<void> {
  const creedObjective = page.locator("#objective-creed");
  const questPrompt = page.locator("#quest-prompt");

  await followPath(page, ["ArrowRight", "ArrowRight", "ArrowRight"]);
  await expect(questPrompt).toContainText("Maker beacon");
  await pressAndSettle(page, "E");
  await expect(creedObjective).toContainText("Creed beacons 1/3");

  await followPath(page, ["ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight"]);
  await expect(questPrompt).toContainText("Redeemer beacon");
  await pressAndSettle(page, "E");
  await expect(creedObjective).toContainText("Creed beacons 2/3");

  await followPath(page, ["ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight", "ArrowRight"]);
  await expect(questPrompt).toContainText("Giver beacon");
  await pressAndSettle(page, "E");
  await expect(creedObjective).toContainText("Creed beacons 3/3");
}
