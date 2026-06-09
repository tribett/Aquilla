import { expect, test } from "@playwright/test";

test("sheepdog follows, stays, and fetches toward the nearest lost sheep", async ({ page }) => {
  await page.goto("/?motion=120");

  const debugState = page.locator("#debug-state");
  const questMessage = page.locator("#quest-message");

  await expect(debugState).toContainText("Dog follow 4,5");

  await page.keyboard.press("ArrowRight");

  await expect(debugState).toContainText("Aquilla 6,5");
  await expect(debugState).toContainText("Dog follow 5,5");

  await page.keyboard.press("S");

  await expect(debugState).toContainText("Dog stay 5,5");
  await expect(questMessage).toContainText("waits and watches");

  await page.keyboard.press("ArrowRight");

  await expect(debugState).toContainText("Aquilla 7,5");
  await expect(debugState).toContainText("Dog stay 5,5");

  await page.keyboard.press("S");

  await expect(debugState).toContainText("Dog follow 5,5");

  await page.keyboard.press("F");

  await expect(debugState).toContainText("Dog fetch 9,5");
  await expect(questMessage).toContainText("runs ahead toward Lost Sheep 1");
  await expect(debugState).toContainText("Sheep 0/3");
});
