import type { GameState } from "../game/types";
import { AQUILLA_ART } from "../art/aquillaArt";

export function renderDebugOverlay(state: GameState): void {
  let overlay = document.querySelector<HTMLPreElement>("#debug-state");
  const mount = document.querySelector<HTMLDivElement>("#game-root") ?? document.body;

  if (!overlay) {
    overlay = document.createElement("pre");
    overlay.id = "debug-state";
  }

  overlay.hidden = true;
  overlay.setAttribute("aria-hidden", "true");

  if (overlay.parentElement !== mount) {
    mount.append(overlay);
  }

  overlay.textContent = [
    `Art Bible ${AQUILLA_ART.direction.world} - ${AQUILLA_ART.direction.tone}`,
    `Area ${state.currentArea}`,
    `Aquilla ${state.player.position.x},${state.player.position.y}`,
    `Dog ${state.dog.command} ${state.dog.position.x},${state.dog.position.y}`,
    `Sheep ${state.objectives.gatheredSheep}/${state.objectives.requiredSheep}`,
    `Water ${state.objectives.waterRestored ? "restored" : "dry"}`,
    `Guardian ${state.objectives.guardianCalmed ? "calmed" : "hostile"}`,
    `Fold ${state.objectives.foldRestored ? "restored" : "lost"}`,
    `FearEcho ${state.objectives.fearEchoCalmed ? "calmed" : "restless"}`,
    `Light ${AQUILLA_ART.palette.trueLight} / ${AQUILLA_ART.palette.falseLight}`,
  ].join("\n");
}
