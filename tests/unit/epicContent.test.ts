import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/game/createInitialState";
import { redirectEmberChannel, completeEmberFenShrine } from "../../src/game/emberFen";
import { singMonasticHymn } from "../../src/game/monasticRuins";
import { playHarpNote } from "../../src/game/harpOfRemembrance";
import { completeCathedralWorship } from "../../src/game/cathedral";
import { claimLanternOfWitness } from "../../src/game/epicAreas";
import { getSideQuestCompletion } from "../../src/game/sideQuests";
import { setFlag } from "../../src/game/flags";
import type { GameState } from "../../src/game/types";

describe("epic content", () => {
  it("cleanses Ember Fen channels in order", () => {
    let state: GameState = {
      ...createInitialState(),
      currentArea: "ember-fen",
      region: "ashen-moor",
    };

    const wrong = redirectEmberChannel(state, "south");
    expect(wrong.message).toContain("order");

    state = redirectEmberChannel(state, "north").state;
    state = redirectEmberChannel(state, "center").state;
    state = redirectEmberChannel(state, "south").state;

    const shrine = completeEmberFenShrine({
      ...state,
      currentRoom: "ember-cistern-heart",
    });
    expect(shrine.state.flags.emberFenComplete).toBe(true);
  });

  it("sings monastic hymns after receiving the lantern and calming the Memory Thief", () => {
    let state: GameState = setFlag(
      {
        ...createInitialState(),
        currentArea: "monastic-ruins",
        currentRoom: "monastic-nave",
        inventory: ["shepherd-staff", "lantern-of-witness"],
        region: "high-kingsroad",
        flags: { memoryThiefDefeated: true },
      },
      "lanternOfWitnessClaimed",
    );

    state = singMonasticHymn(state, "faith").state;
    state = singMonasticHymn(state, "hope").state;
    const love = singMonasticHymn(state, "love");

    expect(love.state.flags.monasticRuinsComplete).toBe(true);
  });

  it("plays the harp melody in order", () => {
    let state: GameState = {
      ...createInitialState(),
      currentArea: "monastic-ruins",
      flags: { monasticRuinsComplete: true },
      inventory: ["shepherd-staff", "lantern-of-witness"],
      region: "high-kingsroad",
    };

    state = playHarpNote(state, "1").state;
    state = playHarpNote(state, "2").state;
    state = playHarpNote(state, "3").state;
    state = playHarpNote(state, "4").state;
    const finale = playHarpNote(state, "5");

    expect(finale.state.inventory).toContain("harp-of-remembrance");
  });

  it("requires archon defeat before claiming the lantern", () => {
    const state: GameState = setFlag(
      {
        ...createInitialState(),
        currentArea: "ashen-spire",
        currentRoom: "ashen-spire-apex",
        flags: { emberFenComplete: true },
        region: "ashen-moor",
      },
      "emberFenComplete",
    );

    const blocked = claimLanternOfWitness(state);
    expect(blocked.message).toContain("Archon");

    const cleared = claimLanternOfWitness({
      ...state,
      currentRoom: "ashen-spire-apex",
      flags: { ...state.flags, ashenSpireDefeated: true },
    });
    expect(cleared.state.inventory).toContain("lantern-of-witness");
  });

  it("tracks side quest completion across chapters", () => {
    const state = createInitialState();
    const start = getSideQuestCompletion(state);

    expect(start.total).toBeGreaterThanOrEqual(5);
    expect(start.complete).toBe(0);
  });

  it("restores the cathedral in worship order", () => {
    let state: GameState = {
      ...createInitialState(),
      currentArea: "forgotten-cathedral",
      inventory: ["shepherd-staff", "harp-of-remembrance"],
      region: "elarion",
    };

    state = completeCathedralWorship(state, "praise").state;
    state = completeCathedralWorship(state, "confession").state;
    const sending = completeCathedralWorship(state, "sending");

    expect(sending.state.flags.cathedralComplete).toBe(true);
  });
});
