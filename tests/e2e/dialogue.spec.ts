import { expect, type Page, test } from "@playwright/test";

async function pressAndSettle(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key);
  await page.waitForTimeout(450);
}

test("opens with Elder Mara's calling before gameplay", async ({ page }) => {
  await page.goto("/?skipTitle=1");

  const dialogue = page.locator("#dialogue-panel");

  await expect(dialogue).toBeVisible();
  await expect(dialogue.locator("#dialogue-speaker")).toContainText("Elder Mara");
  await expect(dialogue.locator("#dialogue-text")).toContainText("scattered");
});

test("speaks with Elder Mara and pauses movement during dialogue", async ({ page }) => {
  await page.goto("/?skipTitle=1&skipIntro=1");

  const dialogue = page.locator("#dialogue-panel");
  const prompt = page.locator("#quest-prompt");
  const debugState = page.locator("#debug-state");

  await expect(dialogue).toHaveCount(1);
  await expect(dialogue).toBeHidden();
  await expect(debugState).toContainText("Aquilla 5,5");

  await pressAndSettle(page, "ArrowLeft");

  await expect(prompt).toContainText("speak with Elder Mara");
  await expect(debugState).toContainText("Aquilla 4,5");

  await page.keyboard.press("E");

  await expect(dialogue).toBeVisible();
  await expect(dialogue.locator("#dialogue-speaker")).toContainText("Elder Mara");
  await expect(dialogue.locator("#dialogue-text")).toContainText("Mercy is not weakness");

  await page.keyboard.press("ArrowRight");

  await expect(debugState).toContainText("Aquilla 4,5");

  await page.keyboard.press("E");
  await expect(dialogue.locator("#dialogue-text")).toContainText("The Fold was built");

  await page.keyboard.press("E");
  await expect(dialogue.locator("#dialogue-text")).toContainText("Courage is obedience");

  await page.keyboard.press("E");

  await expect(dialogue).toBeHidden();

  await pressAndSettle(page, "ArrowRight");

  await expect(debugState).toContainText("Aquilla 5,5");
});

test("closes dialogue with Escape without advancing the story", async ({ page }) => {
  await page.goto("/?skipTitle=1&skipIntro=1");

  const dialogue = page.locator("#dialogue-panel");

  await pressAndSettle(page, "ArrowLeft");
  await page.keyboard.press("E");

  await expect(dialogue).toBeVisible();
  await expect(dialogue.locator("#dialogue-text")).toContainText("Mercy is not weakness");

  await page.keyboard.press("Escape");

  await expect(dialogue).toBeHidden();
});
