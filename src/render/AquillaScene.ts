import Phaser from "phaser";
import { AQUILLA_ART } from "../art/aquillaArt";
import { drawPixelAsset, drawTileScene, hexToNumber } from "../art/pixelRenderer";
import { enterLanternRuinsIfReady, enterOldPastureIfReady, enterSanctumIfReady } from "../game/areas";
import { createInitialState } from "../game/createInitialState";
import {
  CREED_BEACON_ORDER,
  getCreedBeaconLabel,
  getNextCreedBeaconId,
  lightCreedBeacon,
  type CreedBeaconId,
} from "../game/creedBeacons";
import { advanceDialogue, BRIARFOLD_ELDER_DIALOGUE, createDialogueSession } from "../game/dialogue";
import { commandDog, fetchNearestLostSheep, herdNearestSheep, herdSheepById, trailDogAfterPlayerMove } from "../game/dog";
import { restoreFoldIfReady } from "../game/dungeon";
import { resolveEncounter } from "../game/encounters";
import { resolveHazardStep, restoreThornSnare } from "../game/hazards";
import { movePlayer } from "../game/movement";
import { advanceProwlers, distractOrRestoreProwler, resolveProwlerStep } from "../game/prowlers";
import {
  completeSanctumStep,
  getNextSanctumStepId,
  getSanctumStepLabel,
  SANCTUM_STEP_ORDER,
  type SanctumStepId,
} from "../game/sanctum";
import { clearGameSave, loadGameSave, saveGame } from "../game/save";
import {
  canTrackOldPastureScent,
  HIDDEN_GROVE_POSITION,
  OLD_PASTURE_SCENT_START,
  trackOldPastureScent,
} from "../game/scentTrail";
import {
  isShepherdGateOpen,
  sendDogToShepherdGatePlate,
  SHEPHERD_GATE_PLATE_POSITION,
  SHEPHERD_GATE_TILES,
  withShepherdGateCollision,
} from "../game/shepherdGate";
import { useStaffOnObject } from "../game/staff";
import type { DialogueSession } from "../game/dialogue";
import type { AreaId, Creature, Direction, Encounter, GameState, Hazard, Interactable, Sheep, Vector2, WorldMap } from "../game/types";
import { renderDebugOverlay } from "./debugOverlay";
import { renderDialogueHud } from "./dialogueHud";
import { isMapOpen, renderMapHud, setMapOpen, toggleMap } from "./mapHud";
import { isJournalOpen, renderQuestHud, setJournalOpen, toggleJournal } from "./questHud";
import { buildWorldMapFromScene } from "./worldMap";

const PIXEL_SCALE = 2;
const TILE_SIZE = 16 * PIXEL_SCALE;
const SCENE_WIDTH = 20 * TILE_SIZE;
const SCENE_HEIGHT = 13 * TILE_SIZE;
const INTERACTION_RANGE = 1.5;
const DEFAULT_PLAYER_MOVE_DURATION_MS = 260;
const PROTOTYPE_MAP = buildWorldMapFromScene(AQUILLA_ART.sceneMap);
const FOLD_POSITION: Vector2 = { x: 17, y: 7 };
const FOLD_BELL_POSITION: Vector2 = { x: 16, y: 6 };
const BRIARFOLD_ELDER_POSITION: Vector2 = { x: 3, y: 5 };
const GUARDIAN_POSITION: Vector2 = { x: 11, y: 5 };
const WATER_CHANNEL_POSITION: Vector2 = { x: 7, y: 10 };
const OLD_PASTURE_FEAR_ECHO_POSITION: Vector2 = { x: 6, y: 6 };
const OLD_PASTURE_WAYMARK_POSITION: Vector2 = { x: 16, y: 6 };
const LANTERN_RUINS_BEACON_POSITIONS: Record<CreedBeaconId, Vector2> = {
  giver: { x: 15, y: 5 },
  maker: { x: 5, y: 5 },
  redeemer: { x: 10, y: 5 },
};
const LANTERN_RUINS_SANCTUM_GATE_POSITION: Vector2 = { x: 17, y: 6 };
const SANCTUM_STEP_POSITIONS: Record<SanctumStepId, Vector2> = {
  receive: { x: 10, y: 5 },
  remember: { x: 5, y: 5 },
  return: { x: 15, y: 5 },
};
const AREA_SCENE_MAPS: Record<AreaId, readonly string[]> = {
  briarfold: AQUILLA_ART.sceneMap,
  "fold-of-the-lost": AQUILLA_ART.sceneMap,
  "lantern-ruins": AQUILLA_ART.lanternRuinsSceneMap,
  "old-pasture": AQUILLA_ART.oldPastureSceneMap,
  sanctum: AQUILLA_ART.sanctumSceneMap,
};
const AREA_WORLD_MAPS: Record<AreaId, WorldMap> = {
  briarfold: PROTOTYPE_MAP,
  "fold-of-the-lost": PROTOTYPE_MAP,
  "lantern-ruins": buildWorldMapFromScene(AQUILLA_ART.lanternRuinsSceneMap),
  "old-pasture": buildWorldMapFromScene(AQUILLA_ART.oldPastureSceneMap),
  sanctum: buildWorldMapFromScene(AQUILLA_ART.sanctumSceneMap),
};
const ARROW_DIRECTIONS: Partial<Record<string, Direction>> = {
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
};
const INITIAL_QUEST_MESSAGE = "Seek the scattered sheep, restore the spring, and make the Fold ready.";

interface PlayerMovementAnimation {
  durationMs: number;
  from: Vector2;
  startedAtMs: number;
  to: Vector2;
}

function easeInOut(progress: number): number {
  const boundedProgress = Phaser.Math.Clamp(progress, 0, 1);

  return boundedProgress < 0.5
    ? 2 * boundedProgress * boundedProgress
    : 1 - (-2 * boundedProgress + 2) ** 2 / 2;
}

function distanceBetween(first: Vector2, second: Vector2): number {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function getPlayerMoveDurationMs(): number {
  const requestedDuration = Number(
    new URLSearchParams(window.location.search).get("motion"),
  );

  if (Number.isFinite(requestedDuration) && requestedDuration >= 120 && requestedDuration <= 4_000) {
    return requestedDuration;
  }

  return DEFAULT_PLAYER_MOVE_DURATION_MS;
}

export class AquillaScene extends Phaser.Scene {
  private state: GameState = createInitialState();
  private guardian: Encounter = {
    id: "fold-guardian",
    kind: "corrupted-guardian",
    state: "hostile",
  };
  private fearEcho: Encounter = {
    id: "old-pasture-fear-echo",
    kind: "fear-echo",
    state: "hostile",
  };
  private waterChannel: Interactable = {
    id: "dry-channel",
    kind: "water-channel",
    active: false,
  };
  private graphics?: Phaser.GameObjects.Graphics;
  private activeDialogue?: DialogueSession;
  private playerMovement?: PlayerMovementAnimation;
  private dogMovement?: PlayerMovementAnimation;
  private questMessage = INITIAL_QUEST_MESSAGE;

  constructor() {
    super("AquillaScene");
  }

  create(): void {
    this.restoreSavedGame();
    this.cameras.main.setBackgroundColor(AQUILLA_ART.palette.grassBase);
    this.graphics = this.add.graphics();
    this.redrawWorld();
    this.registerKeyboardControls();
    renderDialogueHud();
    setJournalOpen(false);
    setMapOpen(false);
    renderDebugOverlay(this.state);
    this.renderQuestState();
    renderMapHud(this.state);
  }

  update(): void {
    if (!this.playerMovement && !this.dogMovement) return;

    this.redrawWorld();

    if (
      this.playerMovement &&
      Date.now() - this.playerMovement.startedAtMs >= this.playerMovement.durationMs
    ) {
      this.playerMovement = undefined;
    }

    if (this.dogMovement && Date.now() - this.dogMovement.startedAtMs >= this.dogMovement.durationMs) {
      this.dogMovement = undefined;
    }

    if (!this.playerMovement && !this.dogMovement) {
      this.redrawWorld();
    }
  }

  private registerKeyboardControls(): void {
    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      if (this.handleDialogueKey(event.key)) {
        event.preventDefault();
        return;
      }

      if (this.handleOverlayKey(event.key)) {
        event.preventDefault();
        return;
      }

      if (isJournalOpen() || isMapOpen()) {
        event.preventDefault();
        return;
      }

      const direction = ARROW_DIRECTIONS[event.key];
      if (direction) {
        event.preventDefault();
        this.move(direction);
        return;
      }

      if (!this.handleActionKey(event.key)) return;

      event.preventDefault();
    });
  }

  private handleDialogueKey(key: string): boolean {
    if (!this.activeDialogue) return false;

    if (key === "Escape") {
      this.closeDialogue();
      return true;
    }

    if (key.toLowerCase() === "e" || key === " ") {
      this.activeDialogue = advanceDialogue(this.activeDialogue);

      if (this.activeDialogue.complete) {
        this.closeDialogue();
        return true;
      }

      renderDialogueHud(this.activeDialogue);
      return true;
    }

    return true;
  }

  private handleOverlayKey(key: string): boolean {
    if (key.toLowerCase() === "j") {
      setMapOpen(false);
      toggleJournal();
      return true;
    }

    if (key.toLowerCase() === "m") {
      setJournalOpen(false);
      toggleMap();
      return true;
    }

    if (key === "Escape" && (isJournalOpen() || isMapOpen())) {
      setJournalOpen(false);
      setMapOpen(false);
      return true;
    }

    return false;
  }

  private handleActionKey(key: string): boolean {
    switch (key.toLowerCase()) {
      case "d":
        this.state = commandDog(this.state, "distract");
        this.refreshScene();
        return true;
      case "f":
        this.fetchWithDog();
        return true;
      case "n":
        this.resetGame();
        return true;
      case "s":
        this.toggleDogStay();
        return true;
      case " ":
      case "e":
        this.interact();
        return true;
      case "b":
        this.ringFoldBell();
        return true;
      case "g": {
        const result = resolveEncounter(this.state, this.guardian, "staff-calm");
        this.state = result.state;
        this.guardian = result.encounter;
        this.refreshScene();
        return true;
      }
      case "h":
        this.state = herdNearestSheep(commandDog(this.state, "herd"));
        this.refreshScene();
        return true;
      case "r":
        this.state = restoreFoldIfReady(this.state);
        this.refreshScene();
        return true;
      case "w": {
        const result = useStaffOnObject(this.state, this.waterChannel);
        this.state = result.state;
        this.waterChannel = result.object;
        this.refreshScene();
        return true;
      }
      default:
        return false;
    }
  }

  private move(direction: Direction): void {
    if (isJournalOpen() || isMapOpen()) {
      this.playerMovement = undefined;
      this.dogMovement = undefined;
      return;
    }

    const previousPosition = this.state.player.position;
    const renderedFrom = this.getRenderedPlayerTilePosition();
    const dogFrom = this.getRenderedDogTilePosition();
    const previousDogPosition = this.state.dog.position;
    const movedState = movePlayer(this.state, direction, this.getWorldMap());
    const prowlerResult = resolveProwlerStep(movedState, previousPosition);
    const hazardResult = prowlerResult.message
      ? prowlerResult
      : resolveHazardStep(prowlerResult.state, previousPosition);
    const stateAfterDogMovement = hazardResult.message
      ? hazardResult.state
      : trailDogAfterPlayerMove(hazardResult.state, previousPosition);
    this.state = hazardResult.message ? stateAfterDogMovement : advanceProwlers(stateAfterDogMovement);
    const nextPosition = this.state.player.position;
    const nextDogPosition = this.state.dog.position;
    const moved =
      previousPosition.x !== nextPosition.x ||
      previousPosition.y !== nextPosition.y;
    const dogMoved =
      previousDogPosition.x !== nextDogPosition.x ||
      previousDogPosition.y !== nextDogPosition.y;

    if (hazardResult.message) {
      this.playerMovement = undefined;
      this.dogMovement = undefined;
      this.questMessage = hazardResult.message;
    } else if (moved) {
      this.playerMovement = {
        durationMs: getPlayerMoveDurationMs(),
        from: renderedFrom,
        startedAtMs: Date.now(),
        to: nextPosition,
      };

      if (dogMoved) {
        this.dogMovement = {
          durationMs: getPlayerMoveDurationMs(),
          from: dogFrom,
          startedAtMs: Date.now(),
          to: nextDogPosition,
        };
      } else {
        this.dogMovement = undefined;
      }
    } else {
      this.playerMovement = undefined;
      this.dogMovement = undefined;
    }

    this.refreshScene();
  }

  private fetchWithDog(): void {
    const fetchesGatePlate =
      this.state.currentArea === "briarfold" &&
      !isShepherdGateOpen(this.state) &&
      this.isNearShepherdGate();
    const tracksScent = canTrackOldPastureScent(this.state);
    const dogFrom = this.getRenderedDogTilePosition();
    const previousDogPosition = this.state.dog.position;
    const nextState = fetchesGatePlate
      ? sendDogToShepherdGatePlate(this.state)
      : tracksScent
        ? trackOldPastureScent(this.state)
        : fetchNearestLostSheep(this.state);
    const nextDogPosition = nextState.dog.position;
    this.state = nextState;

    if (
      previousDogPosition.x !== nextDogPosition.x ||
      previousDogPosition.y !== nextDogPosition.y
    ) {
      this.dogMovement = {
        durationMs: getPlayerMoveDurationMs(),
        from: dogFrom,
        startedAtMs: Date.now(),
        to: nextDogPosition,
      };
    }

    const fetchedSheep = this.state.sheep.find((sheep) =>
      !sheep.gathered &&
      sheep.position.x === this.state.dog.position.x &&
      sheep.position.y + 1 === this.state.dog.position.y,
    );
    this.questMessage = fetchesGatePlate
      ? "The sheepdog runs back to the old pressure plate by the Shepherd's Gate."
      : tracksScent
        ? "The sheepdog lowers its nose and follows the old scent into a hidden grove; Aquilla receives the grove lantern."
        : fetchedSheep
          ? `The sheepdog runs ahead toward ${fetchedSheep.name}.`
          : "The sheepdog searches, but no lost sheep remain in this pasture.";
    this.refreshScene();
  }

  private toggleDogStay(): void {
    this.state = commandDog(this.state, this.state.dog.command === "stay" ? "follow" : "stay");
    if (isShepherdGateOpen(this.state) && this.state.dog.command === "stay") {
      this.questMessage = "The sheepdog holds the old pressure plate; the Shepherd's Gate grinds open.";
    } else {
      this.questMessage = this.state.dog.command === "stay"
        ? "The sheepdog waits and watches from its place."
        : "The sheepdog returns to Aquilla's side.";
    }
    this.refreshScene();
  }

  private refreshScene(): void {
    this.redrawWorld();
    renderDebugOverlay(this.state);
    this.renderQuestState();
    renderMapHud(this.state);
    renderDialogueHud(this.activeDialogue);
    this.persistGame();
  }

  private interact(): void {
    if (this.state.currentArea === "old-pasture") {
      this.interactOldPasture();
      return;
    }

    if (this.state.currentArea === "lantern-ruins") {
      this.interactLanternRuins();
      return;
    }

    if (this.state.currentArea === "sanctum") {
      this.interactSanctum();
      return;
    }

    const thornSnare = this.getNearbyActiveThornSnare();
    if (thornSnare) {
      const result = restoreThornSnare(this.state, thornSnare.id);
      this.state = result.state;
      this.questMessage = result.message;
      this.refreshScene();
      return;
    }

    const prowler = this.getNearbyActiveProwler();
    if (prowler) {
      const result = distractOrRestoreProwler(this.state, prowler.id);
      this.state = result.state;
      this.questMessage = result.message;
      this.refreshScene();
      return;
    }

    if (this.isNear(BRIARFOLD_ELDER_POSITION)) {
      this.openDialogue();
      return;
    }

    if (this.isNearShepherdGate() && !isShepherdGateOpen(this.state)) {
      this.questMessage = "The Shepherd's Gate is closed; send the sheepdog to the old plate and ask it to stay.";
      this.refreshScene();
      return;
    }

    const sheep = this.getNearbyLostSheep();
    if (sheep) {
      this.state = herdSheepById(commandDog(this.state, "herd"), sheep.id);
      this.questMessage = "The sheepdog guides a lost sheep gently toward the Fold.";
      this.refreshScene();
      return;
    }

    if (this.isNear(WATER_CHANNEL_POSITION) && !this.state.objectives.waterRestored) {
      const result = useStaffOnObject(this.state, this.waterChannel);
      this.state = result.state;
      this.waterChannel = result.object;
      this.questMessage = "The spring runs clear again; mercy makes a path through dry ground.";
      this.refreshScene();
      return;
    }

    if (this.isNear(GUARDIAN_POSITION) && !this.state.objectives.guardianCalmed) {
      if (this.state.dog.command !== "distract") {
        this.state = commandDog(this.state, "distract");
        this.questMessage = "The sheepdog draws the guardian's gaze without striking it.";
      } else {
        const result = resolveEncounter(this.state, this.guardian, "staff-calm");
        this.state = result.state;
        this.guardian = result.encounter;
        this.questMessage = "The guardian remembers its charge and lowers its head.";
      }

      this.refreshScene();
      return;
    }

    if (this.isNear(FOLD_BELL_POSITION) && !this.state.objectives.foldBellRung) {
      this.ringFoldBell();
      return;
    }

    if (this.isNear(FOLD_POSITION)) {
      if (this.state.objectives.foldRestored) {
        this.playerMovement = undefined;
        this.dogMovement = undefined;
        this.state = enterOldPastureIfReady(this.state);
        this.questMessage = "Briarfold lies behind you, restored; the old pasture opens toward the wider kingdom.";
        this.refreshScene();
        return;
      }

      const nextState = restoreFoldIfReady(this.state);
      const restored = !this.state.objectives.foldRestored && nextState.objectives.foldRestored;
      this.state = nextState;
      this.questMessage = restored
        ? "The Fold opens as refuge, not as a reward earned."
        : "The Fold waits until sheep, spring, and guardian are restored.";
      this.refreshScene();
      return;
    }

    this.questMessage = "Move near a sheep, the dry channel, the guardian, or the Fold.";
    this.refreshScene();
  }

  private interactOldPasture(): void {
    if (this.isNear(OLD_PASTURE_FEAR_ECHO_POSITION) && !this.state.objectives.fearEchoCalmed) {
      const result = resolveEncounter(
        this.state,
        this.fearEcho,
        this.fearEcho.state === "stunned" ? "staff-calm" : "staff-stun",
      );
      this.state = result.state;
      this.fearEcho = result.encounter;
      this.questMessage = result.message;
      this.refreshScene();
      return;
    }

    if (this.isNear(OLD_PASTURE_WAYMARK_POSITION)) {
      if (this.state.objectives.fearEchoCalmed && this.state.inventory.includes("grove-lantern")) {
        this.playerMovement = undefined;
        this.dogMovement = undefined;
        this.state = enterLanternRuinsIfReady(this.state);
        this.questMessage = "The eastern waymark opens into the Lantern Ruins, where true light is received in order.";
      } else if (this.state.objectives.fearEchoCalmed) {
        this.questMessage = "The Lantern Ruins wait for the grove lantern carried from the hidden grove.";
      } else {
        this.questMessage = "The eastern waymark names Elarion's road: gather, guard, restore.";
      }

      this.refreshScene();
      return;
    }

    this.questMessage = "Briarfold lies behind you, restored; the old pasture opens toward the wider kingdom.";
    this.refreshScene();
  }

  private ringFoldBell(): void {
    const result = useStaffOnObject(this.state, {
      active: this.state.objectives.foldBellRung,
      id: "fold-bell",
      kind: "bell",
    });
    this.state = result.state;
    this.questMessage = this.state.objectives.foldBellRung
      ? "The old fold-bell rings through the valley; scattered things remember the Shepherd's call."
      : result.message;
    this.refreshScene();
  }

  private interactLanternRuins(): void {
    const beacon = this.getNearbyCreedBeacon();

    if (beacon) {
      const result = lightCreedBeacon(this.state, beacon);
      this.state = result.state;
      this.questMessage = result.message;
      this.refreshScene();
      return;
    }

    if (
      this.state.objectives.lanternRuinsRestored &&
      this.isNear(LANTERN_RUINS_SANCTUM_GATE_POSITION)
    ) {
      this.playerMovement = undefined;
      this.dogMovement = undefined;
      this.state = enterSanctumIfReady(this.state);
      this.questMessage = "The Sanctum opens beyond the beacons: remember, receive, return.";
      this.refreshScene();
      return;
    }

    this.questMessage = this.state.objectives.lanternRuinsRestored
      ? "The Lantern Ruins shine together: Maker, Redeemer, and Giver."
      : "Follow the ruined path and light the creed beacons in order.";
    this.refreshScene();
  }

  private interactSanctum(): void {
    const step = this.getNearbySanctumStep();

    if (step) {
      const result = completeSanctumStep(this.state, step);
      this.state = result.state;
      this.questMessage = result.message;
      this.refreshScene();
      return;
    }

    this.questMessage = this.state.objectives.gameComplete
      ? "Aquilla will return to Briarfold as one sent, not as one who saved himself."
      : "Walk the Sanctum path: remember, receive, return.";
    this.refreshScene();
  }

  private renderQuestState(): void {
    renderQuestHud({
      currentArea: this.state.currentArea,
      inventory: this.state.inventory,
      message: this.questMessage,
      objectives: this.state.objectives,
      prompt: this.getQuestPrompt(),
    });
  }

  private getQuestPrompt(): string {
    if (this.state.currentArea === "lantern-ruins") {
      if (
        this.state.objectives.lanternRuinsRestored &&
        this.isNear(LANTERN_RUINS_SANCTUM_GATE_POSITION)
      ) {
        return "Press E: enter the Sanctum.";
      }

      if (this.state.objectives.lanternRuinsRestored) {
        return "The creed beacons burn together. Follow the eastern path to the Sanctum.";
      }

      const beacon = this.getNearbyCreedBeacon();
      const nextBeacon = getNextCreedBeaconId(this.state);

      if (!beacon) {
        return "Follow the ruined path and light the creed beacons in order.";
      }

      const beaconLabel = getCreedBeaconLabel(beacon);

      if (beacon === nextBeacon) {
        return `Press E: light the ${beaconLabel} beacon.`;
      }

      if (CREED_BEACON_ORDER.indexOf(beacon) < this.state.objectives.creedBeaconsLit) {
        return `The ${beaconLabel} beacon is lit.`;
      }

      return nextBeacon
        ? `The ${beaconLabel} beacon waits for the ${getCreedBeaconLabel(nextBeacon)} beacon.`
        : `The ${beaconLabel} beacon waits.`;
    }

    if (this.state.currentArea === "sanctum") {
      if (this.state.objectives.gameComplete) {
        return "Aquilla's witness is complete; he is sent back to love the valley.";
      }

      const step = this.getNearbySanctumStep();
      const nextStep = getNextSanctumStepId(this.state);

      if (!step) {
        return "Walk the Sanctum path: remember, receive, return.";
      }

      const stepLabel = getSanctumStepLabel(step);

      if (step === nextStep) {
        return `Press E: ${stepLabel}.`;
      }

      if (SANCTUM_STEP_ORDER.indexOf(step) < this.state.objectives.sanctumWitnessSteps) {
        return `The ${stepLabel} witness is complete.`;
      }

      return nextStep
        ? `The ${stepLabel} witness waits for ${getSanctumStepLabel(nextStep)}.`
        : `The ${stepLabel} witness waits.`;
    }

    if (this.state.currentArea === "old-pasture") {
      if (this.isNear(OLD_PASTURE_FEAR_ECHO_POSITION)) {
        if (this.state.objectives.fearEchoCalmed) {
          return "The fear echo is calmed.";
        }

        return this.fearEcho.state === "stunned"
          ? "Press E: calm the fear echo with mercy."
          : "Press E: steady the fear echo with the staff.";
      }

      if (this.isNear(OLD_PASTURE_WAYMARK_POSITION)) {
        if (!this.state.objectives.fearEchoCalmed) {
          return "Press E: read the eastern waymark.";
        }

        return this.state.inventory.includes("grove-lantern")
          ? "Press E: enter the Lantern Ruins."
          : "Press E: find the grove lantern before entering the Lantern Ruins.";
      }

      if (canTrackOldPastureScent(this.state)) {
        return "Press F: ask the sheepdog to track the old scent.";
      }

      if (this.state.objectives.hiddenGroveFound && this.isNear(HIDDEN_GROVE_POSITION)) {
        return this.state.inventory.includes("grove-lantern")
          ? "The grove lantern is carried; received light goes ahead."
          : "The hidden grove remembers mercy in quiet growth.";
      }

      return "Explore the old pasture. The road east is newly opened.";
    }

    const thornSnare = this.getNearbyActiveThornSnare();
    if (thornSnare) {
      return "Press E: restore the thorn snare with the Shepherd's Staff.";
    }

    const prowler = this.getNearbyActiveProwler();
    if (prowler) {
      return prowler.state === "distracted"
        ? "Press E: restore the thorn prowler with the Shepherd's Staff."
        : "Press E: ask the sheepdog to distract the thorn prowler.";
    }

    if (this.isNear(BRIARFOLD_ELDER_POSITION)) {
      return "Press E: speak with Elder Mara.";
    }

    if (this.isNearShepherdGate()) {
      return isShepherdGateOpen(this.state)
        ? "The Shepherd's Gate is open."
        : "Press F then S: send the sheepdog to hold the old plate.";
    }

    const sheep = this.getNearbyLostSheep();
    if (sheep) {
      return `Press E: ask the sheepdog to guide ${sheep.name}.`;
    }

    if (this.isNear(WATER_CHANNEL_POSITION) && !this.state.objectives.waterRestored) {
      return "Press E: use the Shepherd's Staff on the dry channel.";
    }

    if (this.isNear(GUARDIAN_POSITION) && !this.state.objectives.guardianCalmed) {
      return this.state.dog.command === "distract"
        ? "Press E: calm the guardian with the staff."
        : "Press E: ask the sheepdog to distract the guardian.";
    }

    if (this.isNear(FOLD_BELL_POSITION) && !this.state.objectives.foldBellRung) {
      return "Press E: ring the old fold-bell with the Shepherd's Staff.";
    }

    if (this.isNear(FOLD_POSITION)) {
      return this.state.objectives.foldRestored
        ? "The Fold is restored."
        : "Press E: restore the Fold when mercy's work is ready.";
    }

    return "Move near sheep, springs, guardians, or the Fold. Press E to interact.";
  }

  private getNearbyLostSheep(): Sheep | undefined {
    return this.state.sheep.find(
      (sheep) => !sheep.gathered && this.isNear(sheep.position),
    );
  }

  private isNear(position: Vector2): boolean {
    return distanceBetween(this.state.player.position, position) <= INTERACTION_RANGE;
  }

  private isNearShepherdGate(): boolean {
    if (this.state.currentArea !== "briarfold") return false;

    return SHEPHERD_GATE_TILES.some((tile) => this.isNear(tile));
  }

  private getNearbyCreedBeacon(): CreedBeaconId | undefined {
    return CREED_BEACON_ORDER.find((beacon) => this.isNear(LANTERN_RUINS_BEACON_POSITIONS[beacon]));
  }

  private getNearbySanctumStep(): SanctumStepId | undefined {
    return SANCTUM_STEP_ORDER.find((step) => this.isNear(SANCTUM_STEP_POSITIONS[step]));
  }

  private getNearbyActiveProwler(): Creature | undefined {
    if (this.state.currentArea !== "briarfold") return undefined;

    return this.state.creatures.find((creature) => creature.state !== "restored" && this.isNear(creature.position));
  }

  private getNearbyActiveThornSnare(): Hazard | undefined {
    if (this.state.currentArea !== "briarfold") return undefined;

    return this.state.hazards.find((hazard) => hazard.active && this.isNear(hazard.position));
  }

  private redrawWorld(): void {
    const graphics = this.graphics ?? this.add.graphics();
    this.graphics = graphics;
    graphics.clear();
    this.drawWorld(graphics);
  }

  private drawWorld(graphics: Phaser.GameObjects.Graphics): void {
    const playerPosition = this.getRenderedPlayerTilePosition();
    const dogPosition = this.getRenderedDogTilePosition();

    graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.grassBase), 1);
    graphics.fillRect(0, 0, SCENE_WIDTH, 480);

    drawTileScene(graphics, this.getSceneMap(), AQUILLA_ART.tiles, 0, 0, PIXEL_SCALE);

    this.drawObjectiveWorldState(graphics);

    drawPixelAsset(
      graphics,
      AQUILLA_ART.sprites.aquilla,
      playerPosition.x * TILE_SIZE,
      playerPosition.y * TILE_SIZE - 16,
      PIXEL_SCALE,
    );

    drawPixelAsset(
      graphics,
      AQUILLA_ART.sprites.sheepdog,
      dogPosition.x * TILE_SIZE,
      dogPosition.y * TILE_SIZE + 8,
      PIXEL_SCALE,
    );

    this.drawHud(graphics);
  }

  private getRenderedPlayerTilePosition(): Vector2 {
    if (!this.playerMovement) {
      return this.state.player.position;
    }

    const rawProgress =
      (Date.now() - this.playerMovement.startedAtMs) / this.playerMovement.durationMs;
    const progress = easeInOut(rawProgress);

    return {
      x: this.playerMovement.from.x + (this.playerMovement.to.x - this.playerMovement.from.x) * progress,
      y: this.playerMovement.from.y + (this.playerMovement.to.y - this.playerMovement.from.y) * progress,
    };
  }

  private getRenderedDogTilePosition(): Vector2 {
    if (!this.dogMovement) {
      return this.state.dog.position;
    }

    const rawProgress =
      (Date.now() - this.dogMovement.startedAtMs) / this.dogMovement.durationMs;
    const progress = easeInOut(rawProgress);

    return {
      x: this.dogMovement.from.x + (this.dogMovement.to.x - this.dogMovement.from.x) * progress,
      y: this.dogMovement.from.y + (this.dogMovement.to.y - this.dogMovement.from.y) * progress,
    };
  }

  private drawObjectiveWorldState(graphics: Phaser.GameObjects.Graphics): void {
    if (this.state.currentArea === "old-pasture") {
      this.drawOldPastureScentTrail(graphics);
      this.drawFearEcho(graphics);
      this.drawOldPastureWaymark(graphics);
      this.drawGroveLantern(graphics);
      return;
    }

    if (this.state.currentArea === "lantern-ruins") {
      this.drawCreedBeacons(graphics);
      return;
    }

    if (this.state.currentArea === "sanctum") {
      this.drawSanctumSteps(graphics);
      return;
    }

    this.drawBriarfoldElder(graphics);
    this.drawThornSnares(graphics);
    this.drawProwlers(graphics);
    this.drawShepherdGate(graphics);
    this.drawFoldBell(graphics);
    this.drawSheep(graphics);
    this.drawWaterRestoration(graphics);
    this.drawGuardian(graphics);
    this.drawFoldRestoration(graphics);
  }

  private drawBriarfoldElder(graphics: Phaser.GameObjects.Graphics): void {
    const x = BRIARFOLD_ELDER_POSITION.x * TILE_SIZE + 8;
    const y = BRIARFOLD_ELDER_POSITION.y * TILE_SIZE - 2;

    graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.warmOutline), 1);
    graphics.fillRect(x + 4, y + 4, 12, 24);
    graphics.fillRect(x + 1, y + 15, 18, 12);
    graphics.fillStyle(hexToNumber("#d8cab0"), 1);
    graphics.fillRect(x + 6, y, 8, 8);
    graphics.fillStyle(hexToNumber("#7d5230"), 1);
    graphics.fillRect(x + 5, y + 8, 10, 18);
    graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.trueLight), 1);
    graphics.fillRect(x + 8, y + 11, 4, 12);
  }

  private drawSheep(graphics: Phaser.GameObjects.Graphics): void {
    this.state.sheep.forEach((sheep) => {
      if (sheep.gathered) return;

      this.drawSheepMarker(
        graphics,
        sheep.position.x * TILE_SIZE + 6,
        sheep.position.y * TILE_SIZE + 12,
      );
    });
  }

  private drawThornSnares(graphics: Phaser.GameObjects.Graphics): void {
    this.state.hazards.forEach((hazard) => {
      const x = hazard.position.x * TILE_SIZE + 5;
      const y = hazard.position.y * TILE_SIZE + 7;
      const restored = !hazard.active;

      graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.warmOutline), 1);
      graphics.fillRect(x + 2, y + 8, 22, 5);
      graphics.fillRect(x + 9, y + 1, 5, 20);
      graphics.fillStyle(
        hexToNumber(restored ? AQUILLA_ART.palette.trueLight : AQUILLA_ART.palette.falseLightFringe),
        restored ? 0.86 : 0.95,
      );
      graphics.fillRect(x + 4, y + 9, 18, 3);
      graphics.fillRect(x + 10, y + 3, 3, 16);
      graphics.fillStyle(hexToNumber(restored ? AQUILLA_ART.palette.trueLightHighlight : "#d2553f"), 1);
      graphics.fillRect(x + 1, y + 6, 4, 4);
      graphics.fillRect(x + 19, y + 6, 4, 4);
      graphics.fillRect(x + 8, y, 6, 4);
    });
  }

  private drawProwlers(graphics: Phaser.GameObjects.Graphics): void {
    this.state.creatures.forEach((creature) => {
      if (creature.kind !== "thorn-prowler") return;

      const x = creature.position.x * TILE_SIZE + 6;
      const y = creature.position.y * TILE_SIZE + 5;
      const restored = creature.state === "restored";
      const distracted = creature.state === "distracted";
      const bodyColor = restored
        ? AQUILLA_ART.palette.trueLight
        : distracted
          ? AQUILLA_ART.palette.falseLight
          : AQUILLA_ART.palette.falseLightFringe;

      graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.warmOutline), 1);
      graphics.fillRect(x + 2, y + 8, 18, 13);
      graphics.fillRect(x + 15, y + 4, 8, 10);
      graphics.fillRect(x + 4, y + 20, 4, 7);
      graphics.fillRect(x + 15, y + 20, 4, 7);
      graphics.fillStyle(hexToNumber(bodyColor), restored ? 0.88 : 0.96);
      graphics.fillRect(x + 4, y + 9, 15, 10);
      graphics.fillRect(x + 16, y + 6, 5, 6);
      graphics.fillStyle(hexToNumber(restored ? AQUILLA_ART.palette.trueLightHighlight : "#d2553f"), 1);
      graphics.fillRect(x + 18, y + 8, 2, 2);
      if (!restored) {
        graphics.fillRect(x, y + 5, 6, 3);
        graphics.fillRect(x + 8, y + 3, 4, 4);
      }
    });
  }

  private drawShepherdGate(graphics: Phaser.GameObjects.Graphics): void {
    const gateOpen = isShepherdGateOpen(this.state);
    const plateX = SHEPHERD_GATE_PLATE_POSITION.x * TILE_SIZE + 4;
    const plateY = SHEPHERD_GATE_PLATE_POSITION.y * TILE_SIZE + 7;

    graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.warmOutline), 1);
    graphics.fillRect(plateX, plateY, TILE_SIZE - 8, 10);
    graphics.fillStyle(
      hexToNumber(gateOpen ? AQUILLA_ART.palette.trueLight : AQUILLA_ART.palette.falseLight),
      gateOpen ? 0.88 : 0.72,
    );
    graphics.fillRect(plateX + 3, plateY + 2, TILE_SIZE - 14, 6);

    SHEPHERD_GATE_TILES.forEach((tile) => {
      const x = tile.x * TILE_SIZE + 6;
      const y = tile.y * TILE_SIZE + 2;

      graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.warmOutline), gateOpen ? 0.55 : 1);
      graphics.fillRect(x, y, 20, TILE_SIZE - 4);
      graphics.fillStyle(
        hexToNumber(gateOpen ? AQUILLA_ART.palette.trueLight : AQUILLA_ART.palette.panelTrim),
        gateOpen ? 0.35 : 0.92,
      );
      graphics.fillRect(x + 4, y + 2, 4, TILE_SIZE - 8);
      graphics.fillRect(x + 12, y + 2, 4, TILE_SIZE - 8);
    });
  }

  private drawFoldBell(graphics: Phaser.GameObjects.Graphics): void {
    const x = FOLD_BELL_POSITION.x * TILE_SIZE + 7;
    const y = FOLD_BELL_POSITION.y * TILE_SIZE + 1;
    const rung = this.state.objectives.foldBellRung;

    graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.warmOutline), 1);
    graphics.fillRect(x + 7, y + 1, 4, 26);
    graphics.fillRect(x + 1, y + 10, 18, 14);
    graphics.fillRect(x + 4, y + 24, 12, 4);
    graphics.fillStyle(hexToNumber(rung ? AQUILLA_ART.palette.trueLight : AQUILLA_ART.palette.panelTrim), 0.94);
    graphics.fillRect(x + 3, y + 11, 14, 10);
    graphics.fillStyle(hexToNumber(rung ? AQUILLA_ART.palette.trueLightHighlight : "#7d745a"), 1);
    graphics.fillRect(x + 7, y + 21, 4, 4);

    if (rung) {
      graphics.lineStyle(2, hexToNumber(AQUILLA_ART.palette.trueLightHighlight), 0.82);
      graphics.strokeCircle(x + 9, y + 16, 17);
    }
  }

  private drawSheepMarker(graphics: Phaser.GameObjects.Graphics, x: number, y: number): void {
    graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.warmOutline), 1);
    graphics.fillRect(x, y + 4, 18, 10);
    graphics.fillRect(x + 14, y + 1, 8, 8);
    graphics.fillRect(x + 3, y + 13, 3, 5);
    graphics.fillRect(x + 13, y + 13, 3, 5);
    graphics.fillStyle(hexToNumber("#f3ead0"), 1);
    graphics.fillRect(x + 2, y + 2, 14, 10);
    graphics.fillRect(x + 15, y + 3, 5, 5);
    graphics.fillStyle(hexToNumber("#7d745a"), 1);
    graphics.fillRect(x + 18, y + 5, 2, 2);
  }

  private drawWaterRestoration(graphics: Phaser.GameObjects.Graphics): void {
    if (!this.state.objectives.waterRestored) return;

    const x = 7 * TILE_SIZE + 2;
    const y = 10 * TILE_SIZE + 2;

    graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.trueLight), 0.88);
    graphics.fillRect(x, y + 6, 28, 6);
    graphics.fillRect(x + 6, y + 14, 20, 4);
    graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.trueLightHighlight), 0.92);
    graphics.fillRect(x + 2, y + 7, 8, 2);
    graphics.fillRect(x + 14, y + 15, 7, 2);
  }

  private drawGuardian(graphics: Phaser.GameObjects.Graphics): void {
    const x = 11 * TILE_SIZE + 9;
    const y = 5 * TILE_SIZE + 4;
    const restored = this.guardian.state === "restored";

    graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.warmOutline), 1);
    graphics.fillRect(x, y, 14, 24);
    graphics.fillStyle(
      hexToNumber(restored ? AQUILLA_ART.palette.trueLight : AQUILLA_ART.palette.falseLightFringe),
      1,
    );
    graphics.fillRect(x + 2, y + 2, 10, 16);
    graphics.fillStyle(
      hexToNumber(restored ? AQUILLA_ART.palette.trueLightHighlight : "#d2553f"),
      1,
    );
    graphics.fillRect(x + 4, y + 5, 6, 4);
    graphics.fillRect(x + 3, y + 18, 8, 3);
  }

  private drawFoldRestoration(graphics: Phaser.GameObjects.Graphics): void {
    if (!this.state.objectives.foldRestored) return;

    const x = 17 * TILE_SIZE;
    const y = 7 * TILE_SIZE;

    graphics.lineStyle(4, hexToNumber(AQUILLA_ART.palette.trueLight), 0.95);
    graphics.strokeRect(x - 4, y - 4, TILE_SIZE + 8, TILE_SIZE + 8);
    graphics.lineStyle(2, hexToNumber(AQUILLA_ART.palette.trueLightHighlight), 1);
    graphics.strokeRect(x + 3, y + 3, TILE_SIZE - 6, TILE_SIZE - 6);
  }

  private drawOldPastureWaymark(graphics: Phaser.GameObjects.Graphics): void {
    const x = OLD_PASTURE_WAYMARK_POSITION.x * TILE_SIZE + 8;
    const y = OLD_PASTURE_WAYMARK_POSITION.y * TILE_SIZE + 2;

    graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.warmOutline), 1);
    graphics.fillRect(x, y + 7, 16, 22);
    graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.trueLight), 1);
    graphics.fillRect(x + 2, y + 4, 12, 17);
    graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.trueLightHighlight), 1);
    graphics.fillRect(x + 5, y, 6, 6);
    graphics.fillRect(x + 4, y + 10, 8, 2);
  }

  private drawOldPastureScentTrail(graphics: Phaser.GameObjects.Graphics): void {
    const trailPositions = [
      OLD_PASTURE_SCENT_START,
      { x: 3, y: 10 },
      HIDDEN_GROVE_POSITION,
    ];

    trailPositions.forEach((position, index) => {
      const x = position.x * TILE_SIZE + 11;
      const y = position.y * TILE_SIZE + 14;
      const discovered = this.state.objectives.hiddenGroveFound;

      graphics.fillStyle(
        hexToNumber(discovered ? AQUILLA_ART.palette.trueLight : AQUILLA_ART.palette.falseLight),
        discovered ? 0.72 : 0.34,
      );
      graphics.fillRect(x + index, y, 6, 3);
      graphics.fillRect(x + 2 + index, y + 5, 4, 2);
    });

    if (!this.state.objectives.hiddenGroveFound) return;

    const groveX = HIDDEN_GROVE_POSITION.x * TILE_SIZE + 4;
    const groveY = HIDDEN_GROVE_POSITION.y * TILE_SIZE + 1;

    graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.warmOutline), 1);
    graphics.fillRect(groveX + 5, groveY + 8, 18, 18);
    graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.trueLight), 0.9);
    graphics.fillRect(groveX + 7, groveY + 4, 14, 18);
    graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.trueLightHighlight), 1);
    graphics.fillRect(groveX + 11, groveY, 6, 6);
    graphics.fillRect(groveX + 9, groveY + 12, 10, 3);
  }

  private drawGroveLantern(graphics: Phaser.GameObjects.Graphics): void {
    if (!this.state.objectives.hiddenGroveLanternClaimed) return;

    const x = HIDDEN_GROVE_POSITION.x * TILE_SIZE + 12;
    const y = HIDDEN_GROVE_POSITION.y * TILE_SIZE + 7;

    graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.warmOutline), 1);
    graphics.fillRect(x + 3, y, 10, 4);
    graphics.fillRect(x + 1, y + 4, 14, 18);
    graphics.fillRect(x + 4, y + 22, 8, 3);
    graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.trueLight), 0.88);
    graphics.fillRect(x + 4, y + 6, 8, 12);
    graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.trueLightHighlight), 1);
    graphics.fillRect(x + 6, y + 8, 4, 7);
    graphics.lineStyle(2, hexToNumber(AQUILLA_ART.palette.trueLightHighlight), 0.55);
    graphics.strokeCircle(x + 8, y + 12, 16);
  }

  private drawFearEcho(graphics: Phaser.GameObjects.Graphics): void {
    const x = OLD_PASTURE_FEAR_ECHO_POSITION.x * TILE_SIZE + 5;
    const y = OLD_PASTURE_FEAR_ECHO_POSITION.y * TILE_SIZE + 2;
    const restored = this.fearEcho.state === "restored";
    const stunned = this.fearEcho.state === "stunned";
    const bodyColor = restored
      ? AQUILLA_ART.palette.trueLight
      : stunned
        ? AQUILLA_ART.palette.falseLight
        : AQUILLA_ART.palette.falseLightFringe;

    graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.warmOutline), 0.92);
    graphics.fillRect(x + 5, y + 1, 12, 26);
    graphics.fillRect(x + 1, y + 9, 20, 14);
    graphics.fillStyle(hexToNumber(bodyColor), restored ? 0.82 : 0.95);
    graphics.fillRect(x + 7, y, 8, 22);
    graphics.fillRect(x + 3, y + 10, 16, 8);
    graphics.fillStyle(hexToNumber(restored ? AQUILLA_ART.palette.trueLightHighlight : "#241a12"), 1);
    graphics.fillRect(x + 8, y + 6, 2, 2);
    graphics.fillRect(x + 13, y + 6, 2, 2);
  }

  private drawCreedBeacons(graphics: Phaser.GameObjects.Graphics): void {
    CREED_BEACON_ORDER.forEach((beacon, index) => {
      const position = LANTERN_RUINS_BEACON_POSITIONS[beacon];
      const x = position.x * TILE_SIZE + 8;
      const y = position.y * TILE_SIZE + 2;
      const lit = index < this.state.objectives.creedBeaconsLit;
      const waiting = index === this.state.objectives.creedBeaconsLit;
      const lightColor = lit
        ? AQUILLA_ART.palette.trueLight
        : waiting
          ? AQUILLA_ART.palette.falseLight
          : AQUILLA_ART.palette.falseLightFringe;

      graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.warmOutline), 1);
      graphics.fillRect(x + 2, y + 8, 14, 22);
      graphics.fillRect(x, y + 26, 18, 5);
      graphics.fillStyle(hexToNumber("#7d745a"), 1);
      graphics.fillRect(x + 4, y + 12, 10, 16);
      graphics.fillStyle(hexToNumber(lightColor), lit ? 0.95 : 0.58);
      graphics.fillRect(x + 5, y + 2, 8, 8);
      graphics.fillRect(x + 7, y, 4, 14);
      graphics.fillStyle(hexToNumber(lit ? AQUILLA_ART.palette.trueLightHighlight : "#241a12"), 1);
      graphics.fillRect(x + 8, y + 4, 2, 2);
    });

    if (!this.state.objectives.lanternRuinsRestored) return;

    graphics.lineStyle(4, hexToNumber(AQUILLA_ART.palette.trueLight), 0.86);
    graphics.strokeRect(4 * TILE_SIZE, 4 * TILE_SIZE, 13 * TILE_SIZE, 3 * TILE_SIZE);
    graphics.lineStyle(2, hexToNumber(AQUILLA_ART.palette.trueLightHighlight), 0.92);
    graphics.strokeRect(4 * TILE_SIZE + 8, 4 * TILE_SIZE + 8, 13 * TILE_SIZE - 16, 3 * TILE_SIZE - 16);
  }

  private drawSanctumSteps(graphics: Phaser.GameObjects.Graphics): void {
    SANCTUM_STEP_ORDER.forEach((step, index) => {
      const position = SANCTUM_STEP_POSITIONS[step];
      const x = position.x * TILE_SIZE + 7;
      const y = position.y * TILE_SIZE + 4;
      const complete = index < this.state.objectives.sanctumWitnessSteps;
      const waiting = index === this.state.objectives.sanctumWitnessSteps;
      const glow = complete
        ? AQUILLA_ART.palette.trueLight
        : waiting
          ? AQUILLA_ART.palette.falseLight
          : AQUILLA_ART.palette.falseLightFringe;

      graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.warmOutline), 1);
      graphics.fillRect(x, y + 16, 18, 12);
      graphics.fillRect(x + 3, y + 8, 12, 18);
      graphics.fillStyle(hexToNumber("#7d745a"), 1);
      graphics.fillRect(x + 2, y + 18, 14, 6);
      graphics.fillStyle(hexToNumber(glow), complete ? 0.95 : 0.55);
      graphics.fillRect(x + 4, y + 2, 10, 10);
      graphics.fillRect(x + 7, y, 4, 15);
      graphics.fillStyle(hexToNumber(complete ? AQUILLA_ART.palette.trueLightHighlight : "#241a12"), 1);
      graphics.fillRect(x + 8, y + 4, 2, 2);
    });

    if (!this.state.objectives.gameComplete) return;

    graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.trueLight), 0.18);
    graphics.fillRect(2 * TILE_SIZE, 2 * TILE_SIZE, 16 * TILE_SIZE, 8 * TILE_SIZE);
    graphics.lineStyle(4, hexToNumber(AQUILLA_ART.palette.trueLight), 0.92);
    graphics.strokeRect(3 * TILE_SIZE, 3 * TILE_SIZE, 14 * TILE_SIZE, 6 * TILE_SIZE);
    graphics.lineStyle(2, hexToNumber(AQUILLA_ART.palette.trueLightHighlight), 1);
    graphics.strokeRect(3 * TILE_SIZE + 8, 3 * TILE_SIZE + 8, 14 * TILE_SIZE - 16, 6 * TILE_SIZE - 16);
  }

  private getSceneMap(): readonly string[] {
    return AREA_SCENE_MAPS[this.state.currentArea];
  }

  private getWorldMap(): WorldMap {
    return withShepherdGateCollision(this.state, AREA_WORLD_MAPS[this.state.currentArea]);
  }

  private openDialogue(): void {
    this.activeDialogue = createDialogueSession(BRIARFOLD_ELDER_DIALOGUE);
    renderDialogueHud(this.activeDialogue);
  }

  private closeDialogue(): void {
    this.activeDialogue = undefined;
    renderDialogueHud();
  }

  private persistGame(): void {
    saveGame(window.localStorage, {
      fearEcho: this.fearEcho,
      guardian: this.guardian,
      questMessage: this.questMessage,
      state: this.state,
      version: 5,
      waterChannel: this.waterChannel,
    });
  }

  private restoreSavedGame(): void {
    const savedGame = loadGameSave(window.localStorage);

    if (!savedGame) return;

    this.state = savedGame.state;
    this.guardian = savedGame.guardian;
    this.fearEcho = savedGame.fearEcho;
    this.waterChannel = savedGame.waterChannel;
    this.questMessage = savedGame.questMessage;
  }

  private resetGame(): void {
    clearGameSave(window.localStorage);
    this.activeDialogue = undefined;
    this.playerMovement = undefined;
    this.dogMovement = undefined;
    setJournalOpen(false);
    setMapOpen(false);
    this.state = createInitialState();
    this.guardian = {
      id: "fold-guardian",
      kind: "corrupted-guardian",
      state: "hostile",
    };
    this.fearEcho = {
      id: "old-pasture-fear-echo",
      kind: "fear-echo",
      state: "hostile",
    };
    this.waterChannel = {
      id: "dry-channel",
      kind: "water-channel",
      active: false,
    };
    this.questMessage = INITIAL_QUEST_MESSAGE;
    this.refreshScene();
    clearGameSave(window.localStorage);
  }

  private drawHud(graphics: Phaser.GameObjects.Graphics): void {
    graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.panel), 0.92);
    graphics.fillRect(0, SCENE_HEIGHT, 640, 480 - SCENE_HEIGHT);
    graphics.lineStyle(4, hexToNumber(AQUILLA_ART.palette.panelTrim), 1);
    graphics.strokeRect(0, SCENE_HEIGHT, 640, 480 - SCENE_HEIGHT);

    for (let index = 0; index < this.state.player.maxHealth; index += 1) {
      const x = 18 + index * 38;
      const y = SCENE_HEIGHT + 16;

      if (index < this.state.player.health) {
        drawPixelAsset(graphics, AQUILLA_ART.icons.heart, x, y, 2);
      } else {
        graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.warmOutline), 1);
        graphics.fillRect(x + 4, y + 6, 22, 18);
        graphics.fillStyle(hexToNumber("#7d745a"), 1);
        graphics.fillRect(x + 7, y + 9, 16, 12);
      }
    }

    this.drawSheepProgress(graphics);

    graphics.fillStyle(hexToNumber("#3a2a1a"), 1);
    graphics.fillRoundedRect(532, SCENE_HEIGHT + 10, 82, 44, 4);
    graphics.lineStyle(2, hexToNumber(AQUILLA_ART.palette.panelTrim), 1);
    graphics.strokeRoundedRect(532, SCENE_HEIGHT + 10, 82, 44, 4);
    drawPixelAsset(graphics, AQUILLA_ART.icons.crook, 558, SCENE_HEIGHT + 16, 2);
  }

  private drawSheepProgress(graphics: Phaser.GameObjects.Graphics): void {
    for (let index = 0; index < this.state.objectives.requiredSheep; index += 1) {
      const filled = index < this.state.objectives.gatheredSheep;
      const x = 160 + index * 28;
      const y = SCENE_HEIGHT + 24;

      graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.warmOutline), 1);
      graphics.fillRect(x, y, 18, 12);
      graphics.fillStyle(hexToNumber(filled ? AQUILLA_ART.palette.trueLight : "#f3ead0"), 1);
      graphics.fillRect(x + 2, y + 2, 14, 8);
      graphics.fillStyle(hexToNumber(filled ? AQUILLA_ART.palette.trueLightHighlight : "#7d745a"), 1);
      graphics.fillRect(x + 13, y + 4, 3, 3);
    }
  }
}
