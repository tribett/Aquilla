import Phaser from "phaser";
import "./styles.css";
import { AquillaScene } from "./render/AquillaScene";

const root = document.querySelector<HTMLDivElement>("#game-root");

if (!root) {
  throw new Error("Missing #game-root");
}

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
  scene: [AquillaScene],
});

root.dataset.ready = "true";
