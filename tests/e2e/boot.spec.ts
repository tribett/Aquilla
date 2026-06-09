import { expect, type Page, test } from "@playwright/test";

interface Box {
  bottom: number;
  left: number;
  right: number;
  top: number;
}

interface Viewport {
  height: number;
  width: number;
}

function boxesIntersect(first: Box, second: Box): boolean {
  return (
    first.left < second.right &&
    first.right > second.left &&
    first.top < second.bottom &&
    first.bottom > second.top
  );
}

async function expectCanvasAndDebugSeparated(
  page: Page,
  viewport: Viewport,
): Promise<void> {
  await page.setViewportSize(viewport);
  await page.goto("/");

  const canvas = page.locator("canvas");
  const debugState = page.locator("#debug-state");
  await expect(canvas).toBeVisible();
  await expect(debugState).toBeVisible();

  const layout = await page.evaluate(() => {
    const canvasElement = document.querySelector("canvas");
    const debugElement = document.querySelector("#debug-state");

    if (!canvasElement || !debugElement) {
      throw new Error("Missing canvas or debug overlay");
    }

    const toBox = (rect: DOMRect): Box => ({
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
      top: rect.top,
    });

    return {
      canvas: toBox(canvasElement.getBoundingClientRect()),
      canvasHost: toBox(canvasElement.parentElement?.getBoundingClientRect() ?? canvasElement.getBoundingClientRect()),
      debug: toBox(debugElement.getBoundingClientRect()),
      documentWidth: document.documentElement.scrollWidth,
      viewport: { height: window.innerHeight, width: window.innerWidth },
    };
  });

  expect(boxesIntersect(layout.canvas, layout.debug)).toBe(false);
  expect(layout.canvas.left).toBeGreaterThanOrEqual(0);
  expect(layout.canvas.top).toBeGreaterThanOrEqual(0);
  expect(layout.canvas.right).toBeLessThanOrEqual(layout.viewport.width);
  expect(layout.canvas.bottom).toBeLessThanOrEqual(layout.viewport.height);
  expect(layout.canvasHost.right - layout.canvasHost.left).toBeGreaterThanOrEqual(240);
  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewport.width);
}

test("loads Aquilla and renders a nonblank game canvas", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/");

  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  await expect(page.getByRole("heading", { name: "Aquilla" })).toBeVisible();
  await expect(page.getByText("Gather. Guard. Restore.")).toBeVisible();
  await expect(page.getByText("Arrow keys")).toBeVisible();
  await expect(page.getByText("E interact")).toBeVisible();
  await expect(page.locator("#quest-prompt")).toContainText("Move near");
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

test("keeps debug state outside the game canvas on desktop", async ({ page }) => {
  await expectCanvasAndDebugSeparated(page, { width: 1280, height: 720 });
});

test("keeps debug state outside the game canvas at tablet widths", async ({ page }) => {
  await expectCanvasAndDebugSeparated(page, { width: 900, height: 720 });
});

test("keeps debug state outside the game canvas on compact screens", async ({ page }) => {
  await expectCanvasAndDebugSeparated(page, { width: 640, height: 480 });
});

test("keeps a playable canvas size in short compact viewports", async ({ page }) => {
  await expectCanvasAndDebugSeparated(page, { width: 390, height: 360 });
});
