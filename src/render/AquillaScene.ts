import Phaser from "phaser";
import { createInitialState } from "../game/createInitialState";
import type { GameState } from "../game/types";
import { renderDebugOverlay } from "./debugOverlay";

const TILE_SIZE = 32;

export class AquillaScene extends Phaser.Scene {
  private state: GameState = createInitialState();

  constructor() {
    super("AquillaScene");
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#2f7a49");
    this.drawWorld();
    renderDebugOverlay(this.state);
  }

  private drawWorld(): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2f7a49, 1);
    graphics.fillRect(0, 0, 640, 480);

    graphics.fillStyle(0x277da1, 1);
    graphics.fillRect(0, 384, 640, 48);

    graphics.fillStyle(0xcbd5e1, 1);
    graphics.fillRect(384, 96, 96, 96);
    graphics.lineStyle(4, 0x475569, 1);
    graphics.strokeRect(384, 96, 96, 96);

    graphics.fillStyle(0xfef3c7, 1);
    graphics.fillRect(
      this.state.player.position.x * TILE_SIZE,
      this.state.player.position.y * TILE_SIZE,
      24,
      24,
    );

    graphics.fillStyle(0x111827, 1);
    graphics.fillRect(
      this.state.dog.position.x * TILE_SIZE,
      this.state.dog.position.y * TILE_SIZE,
      20,
      20,
    );
  }
}
