import { expect, test } from "@playwright/test";

test("loads the Aquilla shell", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/");

  await expect(page.locator("#game-root")).toBeVisible();
  await expect(page.locator("body")).toHaveAttribute("data-game", "aquilla");
  expect(errors).toEqual([]);
});
