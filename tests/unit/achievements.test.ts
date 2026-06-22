import { describe, expect, it } from "vitest";
import { ACHIEVEMENTS, getAchievementLog, getUnlockedAchievementIds } from "../../src/game/achievements";
import { createInitialState } from "../../src/game/createInitialState";
import { setFlag } from "../../src/game/flags";

describe("achievements", () => {
  it("defines six Steam-mapped achievements", () => {
    expect(ACHIEVEMENTS).toHaveLength(6);
    ACHIEVEMENTS.forEach((achievement) => {
      expect(achievement.steamApiName).toMatch(/^[A-Z0-9_]+$/);
    });
  });

  it("unlocks the Crown Witness when the finale flag is set", () => {
    const state = setFlag(createInitialState(), "crownWitnessComplete");

    expect(getUnlockedAchievementIds(state)).toContain("crown-witness");
    expect(getAchievementLog(state).some((line) => line.startsWith("✓ Crown Witness"))).toBe(true);
  });
});
