import { expect, type Page } from "@playwright/test";

async function readPlayerTile(page: Page): Promise<{ x: number; y: number }> {
  const text = await page.locator("#debug-state").textContent();
  const match = text?.match(/Aquilla (\d+),(\d+)/);

  if (!match) {
    throw new Error("Could not read Aquilla position from debug state.");
  }

  return { x: Number(match[1]), y: Number(match[2]) };
}

async function settleMove(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key);
  await page.waitForTimeout(650);
}

export async function pressGameKey(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key);
  await page.waitForTimeout(450);
}

export async function focusGame(page: Page): Promise<void> {
  const canvas = page.locator("#game-root canvas");
  await expect(canvas).toBeVisible();
  await canvas.click({ position: { x: 160, y: 160 }, force: true });
  await page.waitForTimeout(200);
}

export async function walkToTile(page: Page, targetX: number, targetY: number): Promise<void> {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const { x, y } = await readPlayerTile(page);

    if (x === targetX && y === targetY) {
      return;
    }

    if (x < targetX) {
      await settleMove(page, "ArrowRight");
    } else if (x > targetX) {
      await settleMove(page, "ArrowLeft");
    } else if (y < targetY) {
      await settleMove(page, "ArrowDown");
    } else if (y > targetY) {
      await settleMove(page, "ArrowUp");
    }
  }

  const stuck = await readPlayerTile(page);
  throw new Error(`Failed to reach tile ${targetX},${targetY}. Stopped at ${stuck.x},${stuck.y}.`);
}

export async function walkCorridorTile(page: Page, targetX: number, targetY: number): Promise<void> {
  const current = await readPlayerTile(page);

  if (current.x === 2 && current.y === 6) {
    await walkToTile(page, 1, 6);
    await walkToTile(page, 1, 9);
  }

  await walkToTile(page, targetX, targetY);
}

export async function traverseRoomEast(page: Page): Promise<void> {
  const debugState = page.locator("#debug-state");
  const beforeRoom = (await debugState.textContent())?.match(/Room ([^\n]+)/)?.[1];
  let start = await readPlayerTile(page);

  if (start.x === 2 && start.y === 6) {
    await walkToTile(page, 1, 6);
    await walkToTile(page, 1, 9);
    start = await readPlayerTile(page);
  }

  for (const corridorY of [start.y, 9, 6]) {
    await walkToTile(page, start.x, corridorY);

    for (let step = 0; step < 24; step += 1) {
      await settleMove(page, "ArrowRight");
      const afterRoom = (await debugState.textContent())?.match(/Room ([^\n]+)/)?.[1];

      if (afterRoom && afterRoom !== beforeRoom) {
        await focusGame(page);
        return;
      }
    }
  }

  throw new Error(`Failed to traverse east from room ${beforeRoom ?? "unknown"}.`);
}

export async function reachRoom(page: Page, roomId: string): Promise<void> {
  const debugState = page.locator("#debug-state");

  for (let attempt = 0; attempt < 4; attempt += 1) {
    if ((await debugState.textContent())?.includes(`Room ${roomId}`)) {
      return;
    }

    await traverseRoomEast(page);
  }

  throw new Error(`Failed to reach room ${roomId}.`);
}

export async function calmEpicSentinel(page: Page): Promise<void> {
  await pressGameKey(page, "D");
  await pressGameKey(page, "E");
  await pressGameKey(page, "E");
}

export async function completeEmberFenChannels(page: Page): Promise<void> {
  const questMessage = page.locator("#quest-message");

  await focusGame(page);
  await calmEpicSentinel(page);

  await walkCorridorTile(page, 6, 9);
  await pressGameKey(page, "E");
  await walkCorridorTile(page, 8, 9);
  await pressGameKey(page, "E");
  await walkCorridorTile(page, 10, 9);
  await pressGameKey(page, "E");

  await traverseRoomEast(page);

  await walkCorridorTile(page, 8, 9);
  await pressGameKey(page, "E");
  await expect(questMessage).toContainText("Ember Fen");
}

export async function completeAshenSpireAndLantern(page: Page): Promise<void> {
  const questMessage = page.locator("#quest-message");
  const debugState = page.locator("#debug-state");

  await focusGame(page);
  await pressGameKey(page, "E");
  await expect(questMessage).toContainText("Lantern of Witness");
  await expect(debugState).toContainText("lantern-of-witness");
  await expect(debugState).toContainText("Area kingsroad-pass");
}

export async function completeAshenSpireBoss(page: Page): Promise<void> {
  const questMessage = page.locator("#quest-message");

  await focusGame(page);
  await calmEpicSentinel(page);
  await expect(questMessage).toContainText("Archon scatters");
}

export async function completeMonasticAct(page: Page): Promise<void> {
  const questMessage = page.locator("#quest-message");
  const debugState = page.locator("#debug-state");

  await focusGame(page);
  await calmEpicSentinel(page);

  await walkCorridorTile(page, 5, 9);
  await pressGameKey(page, "E");
  await walkCorridorTile(page, 9, 9);
  await pressGameKey(page, "E");
  await walkCorridorTile(page, 13, 9);
  await pressGameKey(page, "E");
  await expect(questMessage).toContainText("Monastic Ruins are restored");

  await reachRoom(page, "monastic-choir");

  for (const note of ["1", "2", "3", "4", "5"] as const) {
    await pressGameKey(page, note);
  }

  await expect(questMessage).toContainText("Harp");
  await expect(debugState).toContainText("harp-of-remembrance");
  await expect(debugState).toContainText("Area elarion-gate");
}

export async function completeCathedralWorship(page: Page): Promise<void> {
  const questMessage = page.locator("#quest-message");

  await focusGame(page);

  await walkCorridorTile(page, 6, 9);
  await pressGameKey(page, "E");
  await walkCorridorTile(page, 9, 9);
  await pressGameKey(page, "E");
  await walkCorridorTile(page, 12, 9);
  await pressGameKey(page, "E");
  await expect(questMessage).toContainText("Forgotten Cathedral shines");
}

export async function completeLucentBoss(page: Page): Promise<void> {
  const questMessage = page.locator("#quest-message");

  await focusGame(page);
  await walkCorridorTile(page, 9, 9);
  await calmEpicSentinel(page);
  await expect(questMessage).toContainText("False unity shatters");
}

export async function completeLucentThroneReturn(page: Page): Promise<void> {
  const areaLabel = page.locator("#area-label");
  const debugState = page.locator("#debug-state");

  await focusGame(page);
  await walkCorridorTile(page, 9, 9);
  await pressGameKey(page, "E");

  await expect(areaLabel).toContainText("Briarfold");
  await expect(debugState).toContainText("Area briarfold");
}

export async function completeLucentCourtAndReturn(page: Page): Promise<void> {
  await completeLucentBoss(page);
  await completeLucentThroneReturn(page);
}

export async function completeCathedralAndLucent(page: Page): Promise<void> {
  await completeCathedralWorship(page);
  await completeLucentCourtAndReturn(page);
}

export async function completeCrownWitness(page: Page): Promise<void> {
  const questPrompt = page.locator("#quest-prompt");
  const dialogue = page.locator("#dialogue-panel");
  const endingPanel = page.locator("#ending-panel");

  await focusGame(page);
  await expect(questPrompt).toContainText("Elder Mara");

  await pressGameKey(page, "E");
  await expect(dialogue).toBeVisible();
  await expect(dialogue.locator("#dialogue-text")).toContainText("False light could not hold");

  await pressGameKey(page, "E");
  await expect(dialogue.locator("#dialogue-text")).toContainText("Crown Witness is not a trophy");

  await pressGameKey(page, "E");
  await expect(dialogue.locator("#dialogue-text")).toContainText("wider than fear");

  await pressGameKey(page, "E");
  await expect(dialogue.locator("#dialogue-text")).toContainText("Shepherd's mercy");

  await pressGameKey(page, "E");
  await expect(dialogue).toBeHidden();

  await expect(endingPanel).toBeVisible();
  await expect(page.locator("#quest-message")).toContainText("Aquilla's epic witness is complete");
}

/** @deprecated Use completeEmberFenChannels + completeAshenSpireAndLantern */
export async function completeEmberFen(page: Page): Promise<void> {
  await completeEmberFenChannels(page);
  await completeAshenSpireAndLantern(page);
}
