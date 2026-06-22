import { expect, test } from "@playwright/test";
import { completeChapterOne } from "./helpers/chapterOne";
import {
  completeAshenSpireAndLantern,
  completeAshenSpireBoss,
  completeCathedralWorship,
  completeCrownWitness,
  completeEmberFenChannels,
  completeLucentBoss,
  completeLucentThroneReturn,
  completeMonasticAct,
} from "./helpers/epicPlaythrough";

const presetUrl = (preset: string) => `/?skipTitle=1&skipIntro=1&motion=120&preset=${preset}`;

test("plays Acts I through V from Briarfold to the Crown Witness", async ({ page }) => {
  test.setTimeout(360_000);

  await test.step("Act I — Lantern Ruins, Sanctum, and Chapter I witness", async () => {
    await completeChapterOne(page);
  });

  await test.step("Act II — Ember Fen channels and shrine", async () => {
    await page.goto(presetUrl("ember-boss"));
    await completeEmberFenChannels(page);
  });

  await test.step("Act II — Ashen Spire archon and Lantern of Witness", async () => {
    await page.goto(presetUrl("ashen-boss"));
    await completeAshenSpireBoss(page);
    await page.goto(presetUrl("ashen-lantern"));
    await completeAshenSpireAndLantern(page);
    await expect(page.locator("#objective-inventory")).toContainText("Lantern of Witness");
  });

  await test.step("Act III — Monastic hymns, Memory Thief, and Harp of Remembrance", async () => {
    await page.goto(presetUrl("monastic-boss"));
    await completeMonasticAct(page);
    await expect(page.locator("#objective-inventory")).toContainText("Harp of Remembrance");
  });

  await test.step("Act IV — Cathedral worship and Lucent Court", async () => {
    await page.goto(presetUrl("cathedral-choir"));
    await completeCathedralWorship(page);
    await page.goto(presetUrl("lucent-boss"));
    await completeLucentBoss(page);
    await page.goto(presetUrl("lucent-throne"));
    await completeLucentThroneReturn(page);
    await expect(page.locator("#area-label")).toContainText("Briarfold");
  });

  await test.step("Act V — Crown Witness with Elder Mara", async () => {
    await page.goto(presetUrl("crown-ready"));
    await completeCrownWitness(page);
    await expect(page.locator(".ending-lead")).toContainText("kingdom is restored");
  });
});
