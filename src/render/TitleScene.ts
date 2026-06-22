import Phaser from "phaser";
import { AQUILLA_ART } from "../art/aquillaArt";
import { drawPixelAsset, hexToNumber } from "../art/pixelRenderer";

const TITLE_KEY = "AquillaTitle";

export class TitleScene extends Phaser.Scene {
  constructor() {
    super(TITLE_KEY);
  }

  create(): void {
    if (new URLSearchParams(window.location.search).get("skipTitle") === "1") {
      this.scene.start("AquillaScene");
      return;
    }

    this.cameras.main.setBackgroundColor("#14110c");
    const graphics = this.add.graphics();

    graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.grassBase), 1);
    graphics.fillRect(0, 0, 640, 480);
    graphics.fillStyle(hexToNumber(AQUILLA_ART.palette.trueLight), 0.12);
    graphics.fillRect(0, 0, 640, 180);

    drawPixelAsset(graphics, AQUILLA_ART.sprites.aquilla, 300, 180, 3);
    drawPixelAsset(graphics, AQUILLA_ART.sprites.sheepdog, 220, 250, 3);

    const title = document.createElement("div");
    title.className = "title-overlay";
    title.innerHTML = `
      <p class="title-eyebrow">Gather · Guard · Restore</p>
      <h1>Aquilla</h1>
      <p class="title-sub">A sacred adventure across Elarion</p>
      <p class="title-prompt">Press Enter or Space to begin</p>
      <p class="title-meta">Chapter I–V · ~4–6 hour journey · 8–10 with side quests</p>
    `;
    this.game.canvas.parentElement?.append(title);

    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        title.remove();
        this.scene.start("AquillaScene");
      }
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => title.remove());
  }
}

export { TITLE_KEY };
