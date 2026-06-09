import { expect, type Page, test } from "@playwright/test";

async function pressAndSettle(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key);
  await page.waitForTimeout(150);
}

test("distracts and restores a patrolling thorn prowler without killing it", async ({ page }) => {
  await page.goto("/?motion=120");

  const debugState = page.locator("#debug-state");
  const questPrompt = page.locator("#quest-prompt");
  const questMessage = page.locator("#quest-message");
  const prowlerObjective = page.locator("#objective-prowlers");

  await expect(debugState).toContainText("Resolve 3/3");
  await expect(prowlerObjective).toContainText("Prowlers restored 0/1");

  await pressAndSettle(page, "ArrowRight");

  await expect(debugState).toContainText("Prowler hostile 6,4");

  await page.keyboard.press("ArrowUp");

  await expect(debugState).toContainText("Resolve 2/3");
  await expect(debugState).toContainText("Aquilla 6,5");
  await expect(questMessage).toContainText("prowler");
  await expect(questPrompt).toContainText("ask the sheepdog to distract");

  await page.keyboard.press("E");

  await expect(debugState).toContainText("Dog distract");
  await expect(debugState).toContainText("Prowler distracted 6,4");
  await expect(questMessage).toContainText("draws the prowler");

  await page.keyboard.press("E");

  await expect(prowlerObjective).toContainText("Prowlers restored 1/1");
  await expect(debugState).toContainText("Prowler restored 6,4");
  await expect(questMessage).toContainText("restored");

  await pressAndSettle(page, "ArrowUp");

  await expect(debugState).toContainText("Aquilla 6,4");
  await expect(debugState).toContainText("Resolve 2/3");
});
