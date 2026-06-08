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
  await expect(page.locator("#debug-state")).toContainText("Greenward");
  await expect(page.locator("#debug-state")).toContainText("Art Bible");

  const pixel = await canvas.evaluate((node) => {
    const canvasElement = node as HTMLCanvasElement;
    const context = canvasElement.getContext("2d");
    if (!context) return null;
    return Array.from(context.getImageData(20, 20, 1, 1).data);
  });

  expect(pixel).not.toEqual([0, 0, 0, 0]);
  const artBibleColors = await canvas.evaluate((node) => {
    const canvasElement = node as HTMLCanvasElement;
    const context = canvasElement.getContext("2d");
    if (!context) return { hasTrueLight: false, hasFalseLight: false };

    const { data } = context.getImageData(0, 0, canvasElement.width, canvasElement.height);
    let hasTrueLight = false;
    let hasFalseLight = false;

    for (let index = 0; index < data.length; index += 4) {
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];

      if (red === 224 && green === 169 && blue === 58) hasTrueLight = true;
      if (red === 182 && green === 236 && blue === 200) hasFalseLight = true;
      if (hasTrueLight && hasFalseLight) break;
    }

    return { hasTrueLight, hasFalseLight };
  });

  expect(artBibleColors).toEqual({ hasTrueLight: true, hasFalseLight: true });
  expect(errors).toEqual([]);
});
