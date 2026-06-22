import { test } from "@playwright/test";
import { completeChapterOne } from "./helpers/chapterOne";

test("finishes the current arc in the Sanctum and marks the game complete", async ({ page }) => {
  test.setTimeout(120_000);

  await completeChapterOne(page);
});
