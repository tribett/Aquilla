import Phaser from "phaser";
import "./styles.css";
import { isDesktopBuild } from "./env";
import { AquillaScene } from "./render/AquillaScene";
import { TitleScene } from "./render/TitleScene";

const root = document.querySelector<HTMLDivElement>("#game-root");

if (isDesktopBuild()) {
  document.body.classList.add("desktop");
}

function showBootError(message: string): void {
  if (!root) return;

  const help = isDesktopBuild()
    ? "<p>Try verifying game files in Steam, or reinstall Aquilla.</p>"
    : "<p>From the project folder run <code>npm install</code> then <code>npm start</code>, and open the local URL shown in the terminal (not the HTML file directly).</p>";

  root.innerHTML = `<div class="boot-error"><p><strong>Aquilla could not start.</strong></p><p>${message}</p>${help}</div>`;
}

if (!root) {
  throw new Error("Missing #game-root");
}

try {
  const canvasHost = document.createElement("div");
  canvasHost.id = "canvas-host";
  root.append(canvasHost);

  new Phaser.Game({
    type: Phaser.CANVAS,
    parent: canvasHost,
    width: 640,
    height: 480,
    backgroundColor: "#172112",
    pixelArt: true,
    scene: [TitleScene, AquillaScene],
  });

  root.dataset.ready = "true";
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown startup error.";
  showBootError(message);
  throw error;
}
