import type { GameState } from "./types";
import { hasFlag } from "./flags";

export interface Achievement {
  id: string;
  /** Steam API name — map 1:1 when configuring Steamworks stats/achievements. */
  steamApiName: string;
  label: string;
  description: string;
  isUnlocked: (state: GameState) => boolean;
}

export const ACHIEVEMENTS: readonly Achievement[] = [
  {
    id: "fold-restored",
    steamApiName: "FOLD_RESTORED",
    label: "Refuge Remembered",
    description: "Restore the Fold of the Lost.",
    isUnlocked: (state) => state.objectives.foldRestored,
  },
  {
    id: "story-chapter-one",
    steamApiName: "CHAPTER_ONE",
    label: "Sent Forth",
    description: "Complete Chapter I and receive the wider calling.",
    isUnlocked: (state) => state.objectives.storyComplete,
  },
  {
    id: "lantern-of-witness",
    steamApiName: "LANTERN_CLAIMED",
    label: "Lantern of Witness",
    description: "Claim the Lantern of Witness at the Ashen Spire.",
    isUnlocked: (state) => hasFlag(state, "lanternOfWitnessClaimed"),
  },
  {
    id: "harp-of-remembrance",
    steamApiName: "HARP_CLAIMED",
    label: "Harp of Remembrance",
    description: "Play the full harp melody in the Monastic Ruins.",
    isUnlocked: (state) => hasFlag(state, "harpOfRemembranceClaimed"),
  },
  {
    id: "lucent-court",
    steamApiName: "LUCENT_SHATTERED",
    label: "False Unity Broken",
    description: "Calm the Lucent Court Sentinel.",
    isUnlocked: (state) => hasFlag(state, "lucentCourtDefeated"),
  },
  {
    id: "crown-witness",
    steamApiName: "CROWN_WITNESS",
    label: "Crown Witness",
    description: "Close the epic witness with Elder Mara in Briarfold.",
    isUnlocked: (state) => hasFlag(state, "crownWitnessComplete"),
  },
];

export function getUnlockedAchievementIds(state: GameState): string[] {
  return ACHIEVEMENTS.filter((achievement) => achievement.isUnlocked(state)).map(
    (achievement) => achievement.id,
  );
}

export function getAchievementLog(state: GameState): string[] {
  return ACHIEVEMENTS.map((achievement) => {
    const unlocked = achievement.isUnlocked(state);
    return `${unlocked ? "✓" : "·"} ${achievement.label}: ${achievement.description}`;
  });
}

export function getAchievementProgress(state: GameState): { unlocked: number; total: number } {
  const unlocked = ACHIEVEMENTS.filter((achievement) => achievement.isUnlocked(state)).length;
  return { unlocked, total: ACHIEVEMENTS.length };
}
