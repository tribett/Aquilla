import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/game/createInitialState";
import { getCurrentStoryBeat, getJournalStoryBeats, markIntroSeen } from "../../src/game/journal";

describe("journal story beats", () => {
  it("tracks the calling through the sent-forth finale", () => {
    const initialState = createInitialState();

    expect(getCurrentStoryBeat(initialState)).toContain("Elder Mara");
    expect(getJournalStoryBeats(initialState)[0]).toMatch(/^· /);

    const introSeen = markIntroSeen(initialState);
    const foldRestored = {
      ...introSeen,
      objectives: { ...introSeen.objectives, foldRestored: true },
    };
    const finaleState = {
      ...foldRestored,
      objectives: {
        ...foldRestored.objectives,
        fearEchoCalmed: true,
        gameComplete: true,
        hiddenGroveFound: true,
        hiddenGroveLanternClaimed: true,
        lanternRuinsRestored: true,
        returnedHome: true,
        storyComplete: true,
        sanctumWitnessSteps: 3,
      },
      inventory: [...foldRestored.inventory, "grove-lantern" as const],
    };

    const beats = getJournalStoryBeats(finaleState);

    expect(beats.slice(0, 7).every((beat) => beat.startsWith("✓"))).toBe(true);
    expect(beats[7]).toMatch(/^· /);
    expect(getCurrentStoryBeat(finaleState)).toContain("Ember Fen");
  });
});
