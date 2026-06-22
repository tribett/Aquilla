import { expect, test } from "@playwright/test";
import { completeAshenSpireAndLantern, completeCrownWitness, completeLucentThroneReturn } from "./helpers/epicPlaythrough";
import { pressAndSettle } from "./helpers/creedBeacons";

async function calmNearbyBoss(page: import("@playwright/test").Page): Promise<void> {
  await pressAndSettle(page, "D");
  await pressAndSettle(page, "E");
  await pressAndSettle(page, "E");
}

test("calms the False-Light Archon with distract and staff mercy", async ({ page }) => {
  await page.goto("/?skipTitle=1&skipIntro=1&preset=ashen-boss");

  const questMessage = page.locator("#quest-message");

  await calmNearbyBoss(page);

  await expect(questMessage).toContainText("Archon scatters");
});

test("claims the Lantern of Witness at the Ashen Spire apex", async ({ page }) => {
  await page.goto("/?skipTitle=1&skipIntro=1&motion=120&preset=ashen-lantern");

  await completeAshenSpireAndLantern(page);
});

test("closes the Crown Witness with Elder Mara", async ({ page }) => {
  await page.goto("/?skipTitle=1&skipIntro=1&preset=crown-ready");

  await completeCrownWitness(page);
});

test("returns home from the Lucent throne for the Crown Witness", async ({ page }) => {
  await page.goto("/?skipTitle=1&skipIntro=1&preset=lucent-throne");

  await completeLucentThroneReturn(page);
});
