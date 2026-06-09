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

test("opens a Shepherd's Gate when the sheepdog holds the pressure plate", async ({ page }) => {
  await page.goto("/?motion=120");

  const debugState = page.locator("#debug-state");
  const questPrompt = page.locator("#quest-prompt");
  const questMessage = page.locator("#quest-message");

  await expect(debugState).toContainText("ShepherdGate closed");

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
  ]);

  await expect(debugState).toContainText("Aquilla 13,6");
  await expect(questPrompt).toContainText("Press F then S");

  await page.keyboard.press("ArrowRight");

  await expect(debugState).toContainText("Aquilla 13,6");
  await expect(debugState).toContainText("ShepherdGate closed");

  await page.keyboard.press("F");

  await expect(debugState).toContainText("Dog fetch 9,6");
  await expect(questMessage).toContainText("old pressure plate");

  await page.keyboard.press("S");

  await expect(debugState).toContainText("Dog stay 9,6");
  await expect(debugState).toContainText("ShepherdGate open");
  await expect(questMessage).toContainText("Gate grinds open");

  await page.keyboard.press("ArrowRight");

  await expect(debugState).toContainText("Aquilla 14,6");
});
