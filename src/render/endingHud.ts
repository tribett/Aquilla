export function renderEndingHud(storyComplete: boolean): void {
  const panel = document.querySelector<HTMLElement>("#ending-panel");

  if (!panel) return;

  panel.hidden = !storyComplete;
  panel.setAttribute("aria-hidden", storyComplete ? "false" : "true");
}

export function isEndingVisible(): boolean {
  const panel = document.querySelector<HTMLElement>("#ending-panel");

  return panel ? !panel.hidden : false;
}
