import Phaser from "phaser";
import { AQUILLA_ART } from "../art/aquillaArt";
import { drawPixelAsset, drawTileScene, hexToNumber } from "../art/pixelRenderer";
import { createInitialState } from "../game/createInitialState";
import { commandDog, herdNearestSheep } from "../game/dog";
import { restoreFoldIfReady } from "../game/dungeon";
import { resolveEncounter } from "../game/encounters";
import { movePlayer } from "../game/movement";
import { useStaffOnObject } from "../game/staff";
import type { Direction, Encounter, GameState, Interactable } from "../game/types";
import { renderDebugOverlay } from "./debugOverlay";
import { buildWorldMapFromScene } from "./worldMap";

const PIXEL_SCALE = 2;
const TILE_SIZE = 16 * PIXEL_SCALE;
const SCENE_WIDTH = 20 * TILE_SIZE;
const SCENE_HEIGHT = 13 * TILE_SIZE;
const PROTOTYPE_MAP = buildWorldMapFromScene(AQUILLA_ART.sceneMap);
const ARROW_DIRECTIONS: Partial<Record<string, Direction>> = {
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
};

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

  constructor() {
    super("AquillaScene");
  }

  create(): void {
    this.cameras.main.setBackgroundColor(AQUILLA_ART.palette.grassBase);
    this.graphics = this.add.graphics();
    this.redrawWorld();
    this.registerKeyboardControls();
    renderDebugOverlay(this.state);
  }

  private registerKeyboardControls(): void {
    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
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

  private handleActionKey(key: string): boolean {
    switch (key.toLowerCase()) {
      case "d":
        this.state = commandDog(this.state, "distract");
        this.refreshScene();
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
    this.state = movePlayer(this.state, direction, PROTOTYPE_MAP);
    this.refreshScene();
  }

  private refreshScene(): void {
    this.redrawWorld();
    renderDebugOverlay(this.state);
  }

  private redrawWorld(): void {
    const graphics = this.graphics ?? this.add.graphics();
    this.graphics = graphics;
    graphics.clear();
    this.drawWorld(graphics);
  }

  private drawWorld(graphics: Phaser.GameObjects.Graphics): void {
    graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.grassBase), 1);
    graphics.fillRect(0, 0, SCENE_WIDTH, 480);

    drawTileScene(graphics, AQUILLA_ART.sceneMap, AQUILLA_ART.tiles, 0, 0, PIXEL_SCALE);

    this.drawObjectiveWorldState(graphics);

    drawPixelAsset(
      graphics,
      AQUILLA_ART.sprites.aquilla,
      this.state.player.position.x * TILE_SIZE,
      this.state.player.position.y * TILE_SIZE - 16,
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

  private drawObjectiveWorldState(graphics: Phaser.GameObjects.Graphics): void {
    this.drawSheep(graphics);
    this.drawWaterRestoration(graphics);
    this.drawGuardian(graphics);
    this.drawFoldRestoration(graphics);
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
