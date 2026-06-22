import type { DialogueSession } from "../game/dialogue";

export function renderDialogueHud(session?: DialogueSession, hint = "Press E to continue"): void {
  const panel = document.querySelector<HTMLElement>("#dialogue-panel");
  const speaker = document.querySelector<HTMLElement>("#dialogue-speaker");
  const text = document.querySelector<HTMLElement>("#dialogue-text");
  const hintElement = document.querySelector<HTMLElement>(".dialogue-hint");

  if (!panel || !speaker || !text) return;

  const open = Boolean(session && !session.complete);
  panel.hidden = !open;
  panel.setAttribute("aria-hidden", open ? "false" : "true");

  if (!open || !session) return;

  speaker.textContent = session.currentLine.speaker;
  text.textContent = session.currentLine.text;
  if (hintElement) {
    hintElement.textContent = hint;
  }
}
