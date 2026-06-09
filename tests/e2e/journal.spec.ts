import { expect, test } from "@playwright/test";

test("opens a journal overlay and pauses movement while it is open", async ({ page }) => {
  await page.goto("/");

  const journal = page.locator("#journal-panel");
  const debugState = page.locator("#debug-state");

  await expect(page.getByText("J journal")).toBeVisible();
  await expect(journal).toHaveCount(1);
  await expect(journal).toBeHidden();
  await expect(debugState).toContainText("Aquilla 5,5");

  await page.keyboard.press("J");

  await expect(journal).toBeVisible();
  await expect(journal).toContainText("Journal");
  await expect(journal).toContainText("Lost sheep 0/3");

  await page.keyboard.press("ArrowRight");

  await expect(debugState).toContainText("Aquilla 5,5");

  await page.keyboard.press("Escape");

  await expect(journal).toBeHidden();

  await page.keyboard.press("ArrowRight");

  await expect(debugState).toContainText("Aquilla 6,5");
});

test("updates journal objectives from restored game state", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press("H");
  await page.keyboard.press("H");
  await page.keyboard.press("H");
  await page.keyboard.press("W");
  await page.keyboard.press("D");
  await page.keyboard.press("G");
  await page.keyboard.press("B");
  await page.keyboard.press("R");
  await page.keyboard.press("J");

  const journal = page.locator("#journal-panel");
  await expect(journal).toBeVisible();
  await expect(journal).toContainText("Lost sheep 3/3");
  await expect(journal).toContainText("Spring restored");
  await expect(journal).toContainText("Guardian calmed");
  await expect(journal).toContainText("Fold bell rung");
  await expect(journal).toContainText("Fold restored");
});
