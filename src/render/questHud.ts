import type { InventoryItem, Objectives } from "../game/types";

export interface QuestHudState {
  achievementLines: string[];
  chapterTitle: string;
  dungeonLines: string[];
  inventory: InventoryItem[];
  message: string;
  objectives: Objectives;
  prompt: string;
  questLabel: string;
  roomLabel: string;
  storyBeats: string[];
}

function updateText(selector: string, text: string): void {
  const element = document.querySelector<HTMLElement>(selector);

  if (element) {
    element.textContent = text;
  }
}

function renderObjectiveText(objectives: Objectives): void {
  const sheep = `Lost sheep ${objectives.gatheredSheep}/${objectives.requiredSheep}`;
  const water = objectives.waterRestored ? "Spring restored" : "Spring dry";
  const guardian = objectives.guardianCalmed ? "Guardian calmed" : "Guardian hostile";
  const bell = objectives.foldBellRung ? "Fold bell rung" : "Fold bell silent";
  const fold = objectives.foldRestored ? "Fold restored" : "Fold lost";
  const fear = objectives.fearEchoCalmed ? "Fear echo calmed" : "Fear echo restless";
  const creed = `Creed beacons ${objectives.creedBeaconsLit}/${objectives.requiredCreedBeacons}`;
  const sanctum = `Sanctum witness ${objectives.sanctumWitnessSteps}/${objectives.requiredSanctumWitnessSteps}`;
  const thorns = `Thorn snares ${objectives.thornSnaresCleared}/${objectives.requiredThornSnares}`;
  const prowlers = `Prowlers restored ${objectives.thornProwlersRestored}/${objectives.requiredThornProwlers}`;
  const grove = objectives.hiddenGroveFound ? "Hidden grove found" : "Hidden grove hidden";
  const homecoming = objectives.returnedHome ? "Returned home" : "Journey outward";
  const story = objectives.storyComplete ? "Story complete" : "Story unfolding";

  updateText("#objective-sheep", sheep);
  updateText("#objective-water", water);
  updateText("#objective-guardian", guardian);
  updateText("#objective-bell", bell);
  updateText("#objective-fold", fold);
  updateText("#objective-fear", fear);
  updateText("#objective-creed", creed);
  updateText("#objective-sanctum", sanctum);
  updateText("#objective-thorns", thorns);
  updateText("#objective-prowlers", prowlers);
  updateText("#objective-grove", grove);
  updateText("#objective-homecoming", homecoming);
  updateText("#objective-story", story);
  updateText("#journal-objective-sheep", sheep);
  updateText("#journal-objective-water", water);
  updateText("#journal-objective-guardian", guardian);
  updateText("#journal-objective-bell", bell);
  updateText("#journal-objective-fold", fold);
  updateText("#journal-objective-fear", fear);
  updateText("#journal-objective-creed", creed);
  updateText("#journal-objective-sanctum", sanctum);
  updateText("#journal-objective-thorns", thorns);
  updateText("#journal-objective-prowlers", prowlers);
  updateText("#journal-objective-grove", grove);
  updateText("#journal-objective-homecoming", homecoming);
  updateText("#journal-objective-story", story);
}

function renderInventoryText(inventory: readonly InventoryItem[]): void {
  const labels = inventory.map((item) => {
    if (item === "grove-lantern") return "Grove Lantern";
    if (item === "lantern-of-witness") return "Lantern of Witness";
    if (item === "harp-of-remembrance") return "Harp of Remembrance";
    if (item === "shepherd-staff") return "Staff";
    return item;
  });
  const text = `Inventory: ${labels.join(", ")}`;

  updateText("#objective-inventory", text);
  updateText("#journal-objective-inventory", text);
}

export function isJournalOpen(): boolean {
  const journal = document.querySelector<HTMLElement>("#journal-panel");

  return journal ? !journal.hidden : false;
}

export function setJournalOpen(open: boolean): void {
  const journal = document.querySelector<HTMLElement>("#journal-panel");

  if (!journal) return;

  journal.hidden = !open;
  journal.setAttribute("aria-hidden", open ? "false" : "true");
}

export function toggleJournal(): void {
  setJournalOpen(!isJournalOpen());
}

export function renderQuestHud(state: QuestHudState): void {
  const area = document.querySelector<HTMLParagraphElement>("#area-label");
  const prompt = document.querySelector<HTMLParagraphElement>("#quest-prompt");
  const message = document.querySelector<HTMLParagraphElement>("#quest-message");
  const storyList = document.querySelector<HTMLUListElement>("#journal-story-list");
  const dungeonList = document.querySelector<HTMLUListElement>("#journal-dungeon-list");
  const achievementList = document.querySelector<HTMLUListElement>("#journal-achievement-list");
  const questMessage = document.querySelector<HTMLParagraphElement>("#quest-message");

  if (area) {
    area.textContent = `${state.chapterTitle} · ${state.roomLabel}`;
  }

  if (prompt) {
    prompt.textContent = `${state.questLabel}: ${state.prompt}`;
  }

  if (message && questMessage) {
    questMessage.textContent = state.message;
  }

  if (storyList) {
    storyList.replaceChildren(
      ...state.storyBeats.map((beat) => {
        const item = document.createElement("li");
        item.textContent = beat;
        return item;
      }),
    );
  }

  if (dungeonList) {
    dungeonList.replaceChildren(
      ...state.dungeonLines.map((line) => {
        const item = document.createElement("li");
        item.textContent = line;
        return item;
      }),
    );
  }

  if (achievementList) {
    achievementList.replaceChildren(
      ...state.achievementLines.map((line) => {
        const item = document.createElement("li");
        item.textContent = line;
        return item;
      }),
    );
  }

  renderObjectiveText(state.objectives);
  renderInventoryText(state.inventory);
}
