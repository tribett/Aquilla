import type { Objectives } from "../game/types";

export interface QuestHudState {
  message: string;
  objectives: Objectives;
  prompt: string;
}

function updateText(selector: string, text: string): void {
  const element = document.querySelector<HTMLElement>(selector);

  if (element) {
    element.textContent = text;
  }
}

export function renderQuestHud(state: QuestHudState): void {
  const prompt = document.querySelector<HTMLParagraphElement>("#quest-prompt");
  const message = document.querySelector<HTMLParagraphElement>("#quest-message");

  if (prompt) {
    prompt.textContent = state.prompt;
  }

  if (message) {
    message.textContent = state.message;
  }

  updateText(
    "#objective-sheep",
    `Lost sheep ${state.objectives.gatheredSheep}/${state.objectives.requiredSheep}`,
  );
  updateText("#objective-water", state.objectives.waterRestored ? "Spring restored" : "Spring dry");
  updateText(
    "#objective-guardian",
    state.objectives.guardianCalmed ? "Guardian calmed" : "Guardian hostile",
  );
  updateText("#objective-fold", state.objectives.foldRestored ? "Fold restored" : "Fold lost");
}
