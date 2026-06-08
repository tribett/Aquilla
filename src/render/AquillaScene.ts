import Phaser from "phaser";
import { AQUILLA_ART } from "../art/aquillaArt";
import { drawPixelAsset, drawTileScene, hexToNumber } from "../art/pixelRenderer";
import { createInitialState } from "../game/createInitialState";
import type { GameState } from "../game/types";
import { renderDebugOverlay } from "./debugOverlay";

const PIXEL_SCALE = 2;
const TILE_SIZE = 16 * PIXEL_SCALE;
const SCENE_HEIGHT = 13 * TILE_SIZE;

export class AquillaScene extends Phaser.Scene {
  private state: GameState = createInitialState();

  constructor() {
    super("AquillaScene");
  }

  create(): void {
    this.cameras.main.setBackgroundColor(AQUILLA_ART.palette.grassBase);
    this.drawWorld();
    renderDebugOverlay(this.state);
  }

  private drawWorld(): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.grassBase), 1);
    graphics.fillRect(0, 0, 640, 480);

    drawTileScene(graphics, AQUILLA_ART.sceneMap, AQUILLA_ART.tiles, 0, 0, PIXEL_SCALE);

    this.drawHud(graphics);

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
  }

  private drawHud(graphics: Phaser.GameObjects.Graphics): void {
    graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.panel), 0.92);
    graphics.fillRect(0, SCENE_HEIGHT, 640, 480 - SCENE_HEIGHT);
    graphics.lineStyle(4, hexToNumber(AQUILLA_ART.palette.panelTrim), 1);
    graphics.strokeRect(0, SCENE_HEIGHT, 640, 480 - SCENE_HEIGHT);

    for (let index = 0; index < 3; index += 1) {
      drawPixelAsset(graphics, AQUILLA_ART.icons.heart, 18 + index * 38, SCENE_HEIGHT + 16, 2);
    }

    graphics.fillStyle(hexToNumber("#3a2a1a"), 1);
    graphics.fillRoundedRect(532, SCENE_HEIGHT + 10, 82, 44, 4);
    graphics.lineStyle(2, hexToNumber(AQUILLA_ART.palette.panelTrim), 1);
    graphics.strokeRoundedRect(532, SCENE_HEIGHT + 10, 82, 44, 4);
    drawPixelAsset(graphics, AQUILLA_ART.icons.crook, 558, SCENE_HEIGHT + 16, 2);
  }
}
