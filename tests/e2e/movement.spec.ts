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

async function pressAndSettle(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key);
  await page.waitForTimeout(450);
}

test("moves Aquilla right with the keyboard and refreshes debug state", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("#debug-state")).toContainText("Aquilla 5,5");

  await page.keyboard.press("ArrowRight");

  await expect(page.locator("#debug-state")).toContainText("Aquilla 6,5");
});

test("animates Aquilla between tiles instead of jumping instantly", async ({ page }) => {
  await page.goto("/");

  const start = await canvasSignature(page);

  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(80);
  const midway = await canvasSignature(page);

  await page.waitForTimeout(460);
  const end = await canvasSignature(page);

  expect(midway).not.toBe(start);
  expect(midway).not.toBe(end);
  await expect(page.locator("#debug-state")).toContainText("Aquilla 6,5");
});

test("blocks Aquilla from entering water tiles in the art map", async ({ page }) => {
  await page.goto("/");

  await pressAndSettle(page, "ArrowRight");
  await pressAndSettle(page, "ArrowRight");
  await pressAndSettle(page, "ArrowRight");
  await pressAndSettle(page, "ArrowDown");
  await pressAndSettle(page, "ArrowDown");
  await pressAndSettle(page, "ArrowDown");
  await pressAndSettle(page, "ArrowDown");
  await pressAndSettle(page, "ArrowDown");
  await expect(page.locator("#debug-state")).toContainText("Aquilla 8,10");

  await pressAndSettle(page, "ArrowLeft");

  await expect(page.locator("#debug-state")).toContainText("Aquilla 8,10");
});
