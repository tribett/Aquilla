import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/game/createInitialState";
import { returnToBriarfoldForCrownWitness } from "../../src/game/areas";
import { resolveEncounter } from "../../src/game/encounters";
import { redirectEmberChannel, completeEmberFenShrine } from "../../src/game/emberFen";
import { singMonasticHymn } from "../../src/game/monasticRuins";
import { playHarpNote } from "../../src/game/harpOfRemembrance";
import { completeCathedralWorship } from "../../src/game/cathedral";
import { claimLanternOfWitness } from "../../src/game/epicAreas";
import { completeCrownWitness } from "../../src/game/crownWitness";
import { setFlag } from "../../src/game/flags";
import type { GameState } from "../../src/game/types";

describe("epic progression chain", () => {
  it("clears Acts II–V flags in order through mercy encounters", () => {
    let state: GameState = setFlag(
      {
        ...createInitialState(),
        chapter: 2,
        currentArea: "ember-fen",
        currentRoom: "ember-cistern-channels",
        inventory: ["shepherd-staff"],
        region: "ashen-moor",
      },
      "ashenMoorUnlocked",
    );

    const emberSentinel = resolveEncounter(
      { ...state, dog: { ...state.dog, command: "distract" } },
      { id: "ember-fen-sentinel", kind: "false-light-sentinel", state: "hostile" },
      "staff-calm",
    );
    state = emberSentinel.state;

    state = redirectEmberChannel(state, "north").state;
    state = redirectEmberChannel(state, "center").state;
    state = redirectEmberChannel(state, "south").state;
    state = completeEmberFenShrine({ ...state, currentRoom: "ember-cistern-heart" }).state;

    expect(state.flags.emberFenComplete).toBe(true);

    state = {
      ...state,
      currentArea: "ashen-spire",
      currentRoom: "ashen-spire-ascent",
      dog: { ...state.dog, command: "distract" },
    };
    state = resolveEncounter(
      state,
      { id: "ashen-spire-archon", kind: "false-light-archon", state: "hostile" },
      "staff-calm",
    ).state;

    state = claimLanternOfWitness({
      ...state,
      currentRoom: "ashen-spire-apex",
    }).state;

    expect(state.inventory).toContain("lantern-of-witness");

    state = {
      ...state,
      chapter: 3,
      currentArea: "monastic-ruins",
      currentRoom: "monastic-nave",
      region: "high-kingsroad",
      flags: { ...state.flags, kingsroadUnlocked: true, lanternOfWitnessClaimed: true },
      dog: { ...state.dog, command: "distract" },
    };

    state = resolveEncounter(
      state,
      { id: "memory-thief", kind: "false-light-sentinel", state: "hostile" },
      "staff-calm",
    ).state;

    state = singMonasticHymn(state, "faith").state;
    state = singMonasticHymn(state, "hope").state;
    state = singMonasticHymn(state, "love").state;

    expect(state.flags.monasticRuinsComplete).toBe(true);

    state = {
      ...state,
      currentArea: "monastic-ruins",
      currentRoom: "monastic-choir",
    };

    state = playHarpNote(state, "1").state;
    state = playHarpNote(state, "2").state;
    state = playHarpNote(state, "3").state;
    state = playHarpNote(state, "4").state;
    state = playHarpNote(state, "5").state;

    expect(state.inventory).toContain("harp-of-remembrance");

    state = {
      ...state,
      chapter: 4,
      currentArea: "forgotten-cathedral",
      currentRoom: "cathedral-choir",
      inventory: [...state.inventory, "harp-of-remembrance"],
      region: "elarion",
      flags: { ...state.flags, elarionUnlocked: true },
    };

    state = completeCathedralWorship(state, "praise").state;
    state = completeCathedralWorship(state, "confession").state;
    state = completeCathedralWorship(state, "sending").state;

    expect(state.flags.cathedralComplete).toBe(true);

    state = {
      ...state,
      currentArea: "lucent-sanctum",
      currentRoom: "lucent-antechamber",
      dog: { ...state.dog, command: "distract" },
    };

    state = resolveEncounter(
      state,
      { id: "lucent-court-sentinel", kind: "false-light-sentinel", state: "hostile" },
      "staff-calm",
    ).state;

    expect(state.flags.lucentCourtDefeated).toBe(true);
    expect(state.chapter).toBe(5);

    state = returnToBriarfoldForCrownWitness({
      ...state,
      currentRoom: "lucent-throne",
    });

    expect(state.currentArea).toBe("briarfold");
    expect(state.chapter).toBe(5);

    const crown = completeCrownWitness(state);
    expect(crown.state.flags.crownWitnessComplete).toBe(true);
  });
});
