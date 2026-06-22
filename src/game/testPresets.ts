import type { GameState } from "./types";
import { createInitialState } from "./createInitialState";

export type TestPresetId =
  | "act2-ashford"
  | "ashen-lantern"
  | "cathedral-choir"
  | "crown-ready"
  | "ember-boss"
  | "ashen-boss"
  | "monastic-boss"
  | "lucent-boss"
  | "lucent-throne";

function chapterOneCompleteObjectives(): GameState["objectives"] {
  const objectives = createInitialState().objectives;

  return {
    ...objectives,
    creedBeaconsLit: objectives.requiredCreedBeacons,
    fearEchoCalmed: true,
    foldBellRung: true,
    foldRestored: true,
    gameComplete: true,
    gatheredSheep: objectives.requiredSheep,
    guardianCalmed: true,
    hiddenGroveFound: true,
    hiddenGroveLanternClaimed: true,
    lanternRuinsRestored: true,
    returnedHome: true,
    sanctumWitnessSteps: objectives.requiredSanctumWitnessSteps,
    storyComplete: true,
    waterRestored: true,
  };
}

export function getTestPresetState(preset: string): GameState | undefined {
  switch (preset as TestPresetId) {
    case "act2-ashford":
      return {
        ...createInitialState(),
        chapter: 2,
        currentArea: "ashford-crossing",
        currentRoom: "ashford-main",
        flags: { ashenMoorUnlocked: true },
        inventory: ["shepherd-staff", "grove-lantern"],
        objectives: chapterOneCompleteObjectives(),
        player: { ...createInitialState().player, position: { x: 2, y: 6 } },
        region: "ashen-moor",
      };
    case "ashen-lantern":
      return {
        ...createInitialState(),
        chapter: 2,
        currentArea: "ashen-spire",
        currentRoom: "ashen-spire-apex",
        flags: { ashenSpireDefeated: true, emberFenComplete: true },
        inventory: ["shepherd-staff"],
        player: { ...createInitialState().player, position: { x: 9, y: 9 } },
        region: "ashen-moor",
      };
    case "cathedral-choir":
      return {
        ...createInitialState(),
        chapter: 4,
        currentArea: "forgotten-cathedral",
        currentRoom: "cathedral-choir",
        flags: {
          elarionUnlocked: true,
          harpOfRemembranceClaimed: true,
          kingsroadUnlocked: true,
          lanternOfWitnessClaimed: true,
          monasticRuinsComplete: true,
        },
        inventory: ["shepherd-staff", "lantern-of-witness", "harp-of-remembrance"],
        player: { ...createInitialState().player, position: { x: 9, y: 9 } },
        region: "elarion",
      };
    case "crown-ready":
      return {
        ...createInitialState(),
        chapter: 5,
        currentArea: "briarfold",
        currentRoom: "briarfold-main",
        flags: { lucentCourtDefeated: true },
        inventory: ["shepherd-staff", "lantern-of-witness", "harp-of-remembrance"],
        objectives: {
          ...createInitialState().objectives,
          gatheredSheep: 3,
          waterRestored: true,
          guardianCalmed: true,
          foldBellRung: true,
          foldRestored: true,
          fearEchoCalmed: true,
          creedBeaconsLit: 3,
          lanternRuinsRestored: true,
          sanctumWitnessSteps: 3,
          gameComplete: true,
          returnedHome: true,
        },
        player: { ...createInitialState().player, position: { x: 3, y: 5 } },
        region: "briarfold-valley",
      };
    case "ember-boss":
      return {
        ...createInitialState(),
        chapter: 2,
        currentArea: "ember-fen",
        currentRoom: "ember-cistern-channels",
        flags: { emberFenComplete: false },
        inventory: ["shepherd-staff"],
        player: { ...createInitialState().player, position: { x: 9, y: 9 } },
        region: "ashen-moor",
      };
    case "ashen-boss":
      return {
        ...createInitialState(),
        chapter: 2,
        currentArea: "ashen-spire",
        currentRoom: "ashen-spire-ascent",
        flags: { ashenSpireDefeated: false, emberFenComplete: true },
        inventory: ["shepherd-staff"],
        player: { ...createInitialState().player, position: { x: 9, y: 9 } },
        region: "ashen-moor",
      };
    case "monastic-boss":
      return {
        ...createInitialState(),
        chapter: 3,
        currentArea: "monastic-ruins",
        currentRoom: "monastic-nave",
        flags: { kingsroadUnlocked: true, lanternOfWitnessClaimed: true },
        inventory: ["shepherd-staff", "lantern-of-witness"],
        player: { ...createInitialState().player, position: { x: 9, y: 9 } },
        region: "high-kingsroad",
      };
    case "lucent-boss":
      return {
        ...createInitialState(),
        chapter: 4,
        currentArea: "lucent-sanctum",
        currentRoom: "lucent-antechamber",
        flags: { cathedralComplete: true, elarionUnlocked: true },
        inventory: ["shepherd-staff", "lantern-of-witness", "harp-of-remembrance"],
        player: { ...createInitialState().player, position: { x: 9, y: 9 } },
        region: "elarion",
      };
    case "lucent-throne":
      return {
        ...createInitialState(),
        chapter: 5,
        currentArea: "lucent-sanctum",
        currentRoom: "lucent-throne",
        flags: { cathedralComplete: true, lucentCourtDefeated: true },
        inventory: ["shepherd-staff", "lantern-of-witness", "harp-of-remembrance"],
        player: { ...createInitialState().player, position: { x: 9, y: 9 } },
        region: "elarion",
      };
    default:
      return undefined;
  }
}

export function readTestPresetFromUrl(): string | undefined {
  const preset = new URLSearchParams(window.location.search).get("preset");

  return preset ?? undefined;
}
