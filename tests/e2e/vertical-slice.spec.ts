import { expect, type Page, test } from "@playwright/test";

async function canvasSignature(page: Page): Promise<string> {
  return page.locator("canvas").evaluate((node) => {
    const canvas = node as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    if (!context) return "no-context";

    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    let hash = 2166136261;
    for (let index = 0; index < data.length; index += 1) {
      hash ^= data[index];
      hash = Math.imul(hash, 16777619);
    }

    return hash.toString(16);
  });
}

async function expectCanvasChanged(page: Page, previous: string): Promise<string> {
  await expect.poll(() => canvasSignature(page)).not.toBe(previous);
  return canvasSignature(page);
}

test("plays the staff dog and Fold completion loop with hotkeys", async ({ page }) => {
  await page.goto("/");

  const debugState = page.locator("#debug-state");

  await page.keyboard.press("H");
  await expect(debugState).toContainText("Sheep 1/3");

  await page.keyboard.press("H");
  await expect(debugState).toContainText("Sheep 2/3");

  await page.keyboard.press("H");
  await expect(debugState).toContainText("Sheep 3/3");

  await page.keyboard.press("W");
  await expect(debugState).toContainText("Water restored");

  await page.keyboard.press("D");
  await page.keyboard.press("G");
  await expect(debugState).toContainText("Guardian calmed");

  await page.keyboard.press("R");
  await expect(debugState).toContainText("Fold restored");
});

test("renders objective progress visibly on the game canvas", async ({ page }) => {
  await page.goto("/");

  let signature = await canvasSignature(page);

  await page.keyboard.press("H");
  signature = await expectCanvasChanged(page, signature);

  await page.keyboard.press("H");
  await page.keyboard.press("H");
  await page.keyboard.press("W");
  signature = await expectCanvasChanged(page, signature);

  await page.keyboard.press("D");
  await page.keyboard.press("G");
  signature = await expectCanvasChanged(page, signature);

  await page.keyboard.press("R");
  await expectCanvasChanged(page, signature);
});
