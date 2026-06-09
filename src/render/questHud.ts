export interface QuestHudState {
  message: string;
  prompt: string;
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
}
