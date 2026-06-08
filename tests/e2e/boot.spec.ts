import { expect, test } from "@playwright/test";

test("loads Aquilla and renders a nonblank game canvas", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/");

  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  await expect(page.locator("#debug-state")).toContainText("Aquilla");

  const pixel = await canvas.evaluate((node) => {
    const canvasElement = node as HTMLCanvasElement;
    const context = canvasElement.getContext("2d");
    if (!context) return null;
    return Array.from(context.getImageData(20, 20, 1, 1).data);
  });

  expect(pixel).not.toEqual([0, 0, 0, 0]);
  expect(errors).toEqual([]);
});
