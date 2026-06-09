import Phaser from "phaser";
import { AQUILLA_ART } from "../art/aquillaArt";
import { drawPixelAsset, drawTileScene, hexToNumber } from "../art/pixelRenderer";
import { enterOldPastureIfReady } from "../game/areas";
import { createInitialState } from "../game/createInitialState";
import { advanceDialogue, BRIARFOLD_ELDER_DIALOGUE, createDialogueSession } from "../game/dialogue";
import { commandDog, herdNearestSheep, herdSheepById } from "../game/dog";
import { restoreFoldIfReady } from "../game/dungeon";
import { resolveEncounter } from "../game/encounters";
import { movePlayer } from "../game/movement";
import { useStaffOnObject } from "../game/staff";
import type { DialogueSession } from "../game/dialogue";
import type { AreaId, Direction, Encounter, GameState, Interactable, Sheep, Vector2, WorldMap } from "../game/types";
import { renderDebugOverlay } from "./debugOverlay";
import { renderDialogueHud } from "./dialogueHud";
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
const BRIARFOLD_ELDER_POSITION: Vector2 = { x: 3, y: 5 };
const GUARDIAN_POSITION: Vector2 = { x: 11, y: 5 };
const WATER_CHANNEL_POSITION: Vector2 = { x: 7, y: 10 };
const OLD_PASTURE_WAYMARK_POSITION: Vector2 = { x: 16, y: 6 };
const AREA_SCENE_MAPS: Record<AreaId, readonly string[]> = {
  briarfold: AQUILLA_ART.sceneMap,
  "fold-of-the-lost": AQUILLA_ART.sceneMap,
  "old-pasture": AQUILLA_ART.oldPastureSceneMap,
};
const AREA_WORLD_MAPS: Record<AreaId, WorldMap> = {
  briarfold: PROTOTYPE_MAP,
  "fold-of-the-lost": PROTOTYPE_MAP,
  "old-pasture": buildWorldMapFromScene(AQUILLA_ART.oldPastureSceneMap),
};
const ARROW_DIRECTIONS: Partial<Record<string, Direction>> = {
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
};

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
  private waterChannel: Interactable = {
    id: "dry-channel",
    kind: "water-channel",
    active: false,
  };
  private graphics?: Phaser.GameObjects.Graphics;
  private activeDialogue?: DialogueSession;
  private playerMovement?: PlayerMovementAnimation;
  private questMessage = "Seek the scattered sheep, restore the spring, and make the Fold ready.";

  constructor() {
    super("AquillaScene");
  }

  create(): void {
    this.cameras.main.setBackgroundColor(AQUILLA_ART.palette.grassBase);
    this.graphics = this.add.graphics();
    this.redrawWorld();
    this.registerKeyboardControls();
    renderDialogueHud();
    setJournalOpen(false);
    renderDebugOverlay(this.state);
    this.renderQuestState();
  }

  update(): void {
    if (!this.playerMovement) return;

    this.redrawWorld();

    if (Date.now() - this.playerMovement.startedAtMs >= this.playerMovement.durationMs) {
      this.playerMovement = undefined;
      this.redrawWorld();
    }
  }

  private registerKeyboardControls(): void {
    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      if (this.handleDialogueKey(event.key)) {
        event.preventDefault();
        return;
      }

      if (this.handleJournalKey(event.key)) {
        event.preventDefault();
        return;
      }

      if (isJournalOpen()) {
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

  private handleJournalKey(key: string): boolean {
    if (key.toLowerCase() === "j") {
      toggleJournal();
      return true;
    }

    if (key === "Escape" && isJournalOpen()) {
      setJournalOpen(false);
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
      case " ":
      case "e":
        this.interact();
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
    const previousPosition = this.state.player.position;
    const renderedFrom = this.getRenderedPlayerTilePosition();
    this.state = movePlayer(this.state, direction, this.getWorldMap());
    const nextPosition = this.state.player.position;
    const moved = previousPosition.x !== nextPosition.x || previousPosition.y !== nextPosition.y;

    if (moved) {
      this.playerMovement = {
        durationMs: getPlayerMoveDurationMs(),
        from: renderedFrom,
        startedAtMs: Date.now(),
        to: nextPosition,
      };
    }

    this.refreshScene();
  }

  private refreshScene(): void {
    this.redrawWorld();
    renderDebugOverlay(this.state);
    this.renderQuestState();
    renderDialogueHud(this.activeDialogue);
  }

  private interact(): void {
    if (this.state.currentArea === "old-pasture") {
      this.interactOldPasture();
      return;
    }

    if (this.isNear(BRIARFOLD_ELDER_POSITION)) {
      this.openDialogue();
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

    if (this.isNear(FOLD_POSITION)) {
      if (this.state.objectives.foldRestored) {
        this.playerMovement = undefined;
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
    this.questMessage = this.isNear(OLD_PASTURE_WAYMARK_POSITION)
      ? "The eastern waymark names Elarion's road: gather, guard, restore."
      : "Briarfold lies behind you, restored; the old pasture opens toward the wider kingdom.";
    this.refreshScene();
  }

  private renderQuestState(): void {
    renderQuestHud({
      currentArea: this.state.currentArea,
      message: this.questMessage,
      objectives: this.state.objectives,
      prompt: this.getQuestPrompt(),
    });
  }

  private getQuestPrompt(): string {
    if (this.state.currentArea === "old-pasture") {
      return this.isNear(OLD_PASTURE_WAYMARK_POSITION)
        ? "Press E: read the eastern waymark."
        : "Explore the old pasture. The road east is newly opened.";
    }

    if (this.isNear(BRIARFOLD_ELDER_POSITION)) {
      return "Press E: speak with Elder Mara.";
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

  private redrawWorld(): void {
    const graphics = this.graphics ?? this.add.graphics();
    this.graphics = graphics;
    graphics.clear();
    this.drawWorld(graphics);
  }

  private drawWorld(graphics: Phaser.GameObjects.Graphics): void {
    const playerPosition = this.getRenderedPlayerTilePosition();

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
      this.state.dog.position.x * TILE_SIZE,
      this.state.dog.position.y * TILE_SIZE + 8,
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

  private drawObjectiveWorldState(graphics: Phaser.GameObjects.Graphics): void {
    if (this.state.currentArea === "old-pasture") {
      this.drawOldPastureWaymark(graphics);
      return;
    }

    this.drawBriarfoldElder(graphics);
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

  private getSceneMap(): readonly string[] {
    return AREA_SCENE_MAPS[this.state.currentArea];
  }

  private getWorldMap(): WorldMap {
    return AREA_WORLD_MAPS[this.state.currentArea];
  }

  private openDialogue(): void {
    this.activeDialogue = createDialogueSession(BRIARFOLD_ELDER_DIALOGUE);
    renderDialogueHud(this.activeDialogue);
  }

  private closeDialogue(): void {
    this.activeDialogue = undefined;
    renderDialogueHud();
  }

  private drawHud(graphics: Phaser.GameObjects.Graphics): void {
    graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.panel), 0.92);
    graphics.fillRect(0, SCENE_HEIGHT, 640, 480 - SCENE_HEIGHT);
    graphics.lineStyle(4, hexToNumber(AQUILLA_ART.palette.panelTrim), 1);
    graphics.strokeRect(0, SCENE_HEIGHT, 640, 480 - SCENE_HEIGHT);

    for (let index = 0; index < 3; index += 1) {
      drawPixelAsset(graphics, AQUILLA_ART.icons.heart, 18 + index * 38, SCENE_HEIGHT + 16, 2);
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
