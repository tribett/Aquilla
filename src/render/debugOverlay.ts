import type { GameState } from "../game/types";

export function renderDebugOverlay(state: GameState): void {
  let overlay = document.querySelector<HTMLPreElement>("#debug-state");

  if (!overlay) {
    overlay = document.createElement("pre");
    overlay.id = "debug-state";
    document.body.append(overlay);
  }

  overlay.textContent = [
    `Aquilla ${state.player.position.x},${state.player.position.y}`,
    `Dog ${state.dog.command} ${state.dog.position.x},${state.dog.position.y}`,
    `Sheep ${state.objectives.gatheredSheep}/${state.objectives.requiredSheep}`,
    `Water ${state.objectives.waterRestored ? "restored" : "dry"}`,
    `Guardian ${state.objectives.guardianCalmed ? "calmed" : "hostile"}`,
    `Fold ${state.objectives.foldRestored ? "restored" : "lost"}`,
  ].join("\n");
}
