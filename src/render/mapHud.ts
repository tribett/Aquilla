import {
  getAreaMapEntries,
  getCurrentAreaMapLabel,
  getNextMapGate,
} from "../game/areaMap";
import type { GameState, InventoryItem } from "../game/types";

function updateText(selector: string, text: string): void {
  const element = document.querySelector<HTMLElement>(selector);

  if (element) {
    element.textContent = text;
  }
}

function renderInventoryText(inventory: readonly InventoryItem[]): string {
  const labels = inventory.map((item) => {
    if (item === "grove-lantern") return "Grove Lantern";
    if (item === "shepherd-staff") return "Staff";
    return item;
  });

  return `Inventory: ${labels.join(", ")}`;
}

export function isMapOpen(): boolean {
  const map = document.querySelector<HTMLElement>("#map-panel");

  return map ? !map.hidden : false;
}

export function setMapOpen(open: boolean): void {
  const map = document.querySelector<HTMLElement>("#map-panel");

  if (!map) return;

  map.hidden = !open;
  map.setAttribute("aria-hidden", open ? "false" : "true");
}

export function toggleMap(): void {
  setMapOpen(!isMapOpen());
}

export function renderMapHud(state: GameState): void {
  updateText("#map-current", `Current: ${getCurrentAreaMapLabel(state)}`);
  updateText("#map-next-gate", `Next gate: ${getNextMapGate(state)}`);
  updateText("#map-inventory", renderInventoryText(state.inventory));

  getAreaMapEntries(state).forEach((entry) => {
    updateText(`#map-area-${entry.id}`, `${entry.label} ${entry.status}`);
  });
}
