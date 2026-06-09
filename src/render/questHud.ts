import type { AreaId, Objectives } from "../game/types";

export interface QuestHudState {
  currentArea: AreaId;
  message: string;
  objectives: Objectives;
  prompt: string;
}

const AREA_LABELS: Record<AreaId, string> = {
  briarfold: "Briarfold",
  "fold-of-the-lost": "Fold of the Lost",
  "old-pasture": "Old Pasture",
};

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
  const fold = objectives.foldRestored ? "Fold restored" : "Fold lost";

  updateText("#objective-sheep", sheep);
  updateText("#objective-water", water);
  updateText("#objective-guardian", guardian);
  updateText("#objective-fold", fold);
  updateText("#journal-objective-sheep", sheep);
  updateText("#journal-objective-water", water);
  updateText("#journal-objective-guardian", guardian);
  updateText("#journal-objective-fold", fold);
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

  if (area) {
    area.textContent = `Area: ${AREA_LABELS[state.currentArea]}`;
  }

  if (prompt) {
    prompt.textContent = state.prompt;
  }

  if (message) {
    message.textContent = state.message;
  }

  renderObjectiveText(state.objectives);
}
