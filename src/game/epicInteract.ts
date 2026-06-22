import { setFlag } from "./flags";
import type { GameState, Vector2 } from "./types";
import { completeCathedralWorship, getNextCathedralWorship } from "./cathedral";
import {
  completeEmberFenShrine,
  getNextEmberChannel,
  isNearEmberChannel,
  isNearEmberShrine,
  redirectEmberChannel,
  type EmberChannelId,
} from "./emberFen";
import {
  ASHFORD_GUIDE_POSITION,
  ASHEN_SPIRE_LANTERN_POSITION,
  CATHEDRAL_WORSHIP_POSITIONS,
  ELARION_INSCRIPTION_POSITION,
  KINGSROAD_WAYMARK_POSITION,
  LUCENT_THRONE_WAYMARK_POSITION,
} from "./epicPositions";
import { claimLanternOfWitness, unlockElarion, unlockKingsroad } from "./epicAreas";
import { returnToBriarfoldForCrownWitness } from "./areas";
import { getNextHarpNote, playHarpNote, type HarpNote } from "./harpOfRemembrance";
import { getNextMonasticHymn, isNearMonasticHymn, singMonasticHymn, type MonasticHymnId } from "./monasticRuins";
import { gatherAshfordFlower } from "./sideQuests";
import { openUndercroftSeal } from "./undercroft";

export interface EpicInteractResult {
  frequency?: number;
  message: string;
  playRestore?: boolean;
  playVictory?: boolean;
  state: GameState;
}

function near(position: Vector2, target: Vector2, range = 1.5): boolean {
  return Math.hypot(position.x - target.x, position.y - target.y) <= range;
}

export function interactAshfordCrossing(state: GameState): EpicInteractResult {
  if (near(state.player.position, { x: 4, y: 1 }) || near(state.player.position, { x: 14, y: 1 })) {
    const gathered = gatherAshfordFlower(state);
    const count = [state.flags.ashfordFlower1, state.flags.ashfordFlower2, state.flags.ashfordFlower3].filter(Boolean).length;
    return {
      message:
        count >= 3
          ? "Three moor flowers are gathered for Elder Mara's table."
          : `Aquilla gathers a moor flower (${count}/3).`,
      state: gathered,
    };
  }

  if (near(state.player.position, ASHFORD_GUIDE_POSITION)) {
    if (state.flags.ashfordMet) {
      return { message: "Pilgrim Elias points east toward Ember Fen.", state };
    }

    return {
      message: "Pilgrim Elias warns of false fire on the Ashen Moor.",
      state: setFlag(state, "ashfordMet"),
    };
  }

  return { message: "Ashford Crossing: east toward Ember Fen.", state };
}

export function interactEmberFen(state: GameState): EpicInteractResult {
  if (state.currentRoom === "ember-cistern-channels") {
    const channels: EmberChannelId[] = ["north", "center", "south"];

    for (const channel of channels) {
      if (isNearEmberChannel(state.player.position, channel)) {
        const result = redirectEmberChannel(state, channel);
        return {
          message: result.message,
          state: result.state,
        };
      }
    }

    const next = getNextEmberChannel(state);
    return {
      message: next
        ? `Redirect the ${next} fen channel with the Shepherd's Staff.`
        : "All channels run clear. Press onward to the heart shrine.",
      state,
    };
  }

  if (state.currentRoom === "ember-cistern-heart" && isNearEmberShrine(state.player.position)) {
    const result = completeEmberFenShrine(state);
    return {
      message: result.message,
      playRestore: Boolean(result.state.flags.emberFenComplete && !state.flags.emberFenComplete),
      state: result.state,
    };
  }

  return { message: "Explore the cistern channels, then cleanse the heart shrine.", state };
}

export function interactAshenSpire(state: GameState): EpicInteractResult {
  if (state.currentRoom === "ashen-spire-apex" && near(state.player.position, ASHEN_SPIRE_LANTERN_POSITION)) {
    const result = claimLanternOfWitness(state);
    const unlocked = unlockKingsroad(result.state);
    return {
      message: result.message,
      playRestore: Boolean(unlocked.flags.lanternOfWitnessClaimed && !state.flags.lanternOfWitnessClaimed),
      state: unlocked,
    };
  }

  return {
    message: state.flags.ashenSpireDefeated
      ? "Press E at the lantern altar to claim the Lantern of Witness."
      : "Calm the False-Light Archon: distract with Bracken, then steady with the staff.",
    state,
  };
}

export function interactKingsroadPass(state: GameState): EpicInteractResult {
  if (state.currentRoom === "undercroft-seal") {
    const seal = openUndercroftSeal(state);
    return {
      message: seal.message,
      playRestore: Boolean(seal.state.flags.undercroftSealOpened && !state.flags.undercroftSealOpened),
      state: seal.state,
    };
  }

  if (near(state.player.position, KINGSROAD_WAYMARK_POSITION)) {
    if (state.flags.kingsroadWaymarkRead) {
      return { message: "The waymark names the road to the Monastic Ruins.", state };
    }

    return {
      message: "The waymark reads: 'Walk mercy; the King's servants remember.'",
      state: {
        ...state,
        flags: { ...state.flags, kingsroadWaymarkRead: true },
      },
    };
  }

  return { message: "The High Kingsroad stretches toward the Monastic Ruins.", state };
}

export function interactMonasticRuins(state: GameState): EpicInteractResult {
  if (state.currentRoom === "monastic-nave") {
    const hymns: MonasticHymnId[] = ["faith", "hope", "love"];

    for (const hymn of hymns) {
      if (isNearMonasticHymn(state.player.position, hymn)) {
        const result = singMonasticHymn(state, hymn);
        return {
          message: result.message,
          playRestore: Boolean(result.state.flags.monasticRuinsComplete && !state.flags.monasticRuinsComplete),
          state: result.state,
        };
      }
    }

    const next = getNextMonasticHymn(state);
    return {
      message: next ? `Sing the ${next} hymn at its stone.` : "The choir waits beyond the nave.",
      state,
    };
  }

  if (state.currentRoom === "monastic-choir" && state.flags.monasticRuinsComplete) {
    const note = getNextHarpNote(state);
    return {
      message: note
        ? `Play harp note ${note} (press ${note}).`
        : "The Harp of Remembrance is ready to be claimed.",
      state,
    };
  }

  const next = getNextMonasticHymn(state);
  return {
    message: next
      ? `Sing the ${next} hymn at its stone.`
      : "The harp waits at the center altar.",
    state,
  };
}

export function interactElarionGate(state: GameState): EpicInteractResult {
  if (near(state.player.position, ELARION_INSCRIPTION_POSITION)) {
    if (state.flags.elarionInscriptionRead) {
      return { message: "Elarion's gate remembers the King's name.", state };
    }

    return {
      message: "The inscription reads: 'False light cannot crown what grace has redeemed.'",
      state: {
        ...state,
        flags: { ...state.flags, elarionInscriptionRead: true },
      },
    };
  }

  return { message: "Elarion Gate opens toward the Forgotten Cathedral.", state };
}

export function interactForgottenCathedral(state: GameState): EpicInteractResult {
  if (state.currentRoom !== "cathedral-choir") {
    return { message: "The cathedral choir waits deeper within Elarion.", state };
  }

  const next = getNextCathedralWorship(state);

  if (next && near(state.player.position, CATHEDRAL_WORSHIP_POSITIONS.praise) && next === "praise") {
    const result = completeCathedralWorship(state, "praise");
    return { message: result.message, state: result.state };
  }

  if (next && near(state.player.position, CATHEDRAL_WORSHIP_POSITIONS.confession) && next === "confession") {
    const result = completeCathedralWorship(state, "confession");
    return { message: result.message, state: result.state };
  }

  if (next && near(state.player.position, CATHEDRAL_WORSHIP_POSITIONS.sending) && next === "sending") {
    const result = completeCathedralWorship(state, "sending");
    return {
      message: result.message,
      playRestore: Boolean(result.state.flags.cathedralComplete && !state.flags.cathedralComplete),
      state: result.state,
    };
  }

  return {
    message: next
      ? `Offer ${next} at the cathedral stone.`
      : "The cathedral shines; the Lucent Sanctum waits.",
    state,
  };
}

export function interactLucentSanctum(state: GameState): EpicInteractResult {
  if (state.currentRoom === "lucent-throne") {
    if (!state.flags.lucentCourtDefeated) {
      return { message: "False unity still binds the Lucent throne.", state };
    }

    if (near(state.player.position, LUCENT_THRONE_WAYMARK_POSITION)) {
      return {
        message: "Aquilla walks the green road home for the Crown Witness.",
        playVictory: true,
        state: returnToBriarfoldForCrownWitness(state),
      };
    }

    return {
      message: "Press E at the throne waymark to return to Briarfold.",
      state,
    };
  }

  if (state.currentRoom !== "lucent-antechamber") {
    return { message: "The Lucent Court waits in the antechamber.", state };
  }

  if (!state.flags.cathedralComplete) {
    return { message: "Restore cathedral worship before facing the Lucent Court.", state };
  }

  return {
    message: state.flags.lucentCourtDefeated
      ? "Walk east to the throne, then return home."
      : "Calm the Lucent Court Sentinel: distract with Bracken, then steady with the staff.",
    state,
  };
}

export function pressHarpKey(state: GameState, note: HarpNote): EpicInteractResult {
  if (state.currentArea !== "monastic-ruins" || state.currentRoom !== "monastic-choir") {
    return { message: "", state };
  }

  const result = playHarpNote(state, note);
  const unlocked = result.state.flags.harpOfRemembranceClaimed
    ? unlockElarion(result.state)
    : result.state;

  return {
    frequency: result.frequency,
    message: result.message,
    playRestore: Boolean(unlocked.flags.harpOfRemembranceClaimed && !state.flags.harpOfRemembranceClaimed),
    state: unlocked,
  };
}
