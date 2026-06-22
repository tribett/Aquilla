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
    if (item === "lantern-of-witness") return "Lantern of Witness";
    if (item === "harp-of-remembrance") return "Harp of Remembrance";
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

  const list = document.querySelector<HTMLOListElement>("#area-map-list");

  if (list) {
    list.replaceChildren(
      ...getAreaMapEntries(state).map((entry) => {
        const item = document.createElement("li");
        item.id = `map-area-${entry.id}`;
        item.textContent = `${entry.label} ${entry.status}`;
        return item;
      }),
    );
  }
}
