import type { DialogueSession } from "../game/dialogue";

export function renderDialogueHud(session?: DialogueSession): void {
  const panel = document.querySelector<HTMLElement>("#dialogue-panel");
  const speaker = document.querySelector<HTMLElement>("#dialogue-speaker");
  const text = document.querySelector<HTMLElement>("#dialogue-text");

  if (!panel || !speaker || !text) return;

  const open = Boolean(session && !session.complete);
  panel.hidden = !open;
  panel.setAttribute("aria-hidden", open ? "false" : "true");

  if (!open || !session) return;

  speaker.textContent = session.currentLine.speaker;
  text.textContent = session.currentLine.text;
}
