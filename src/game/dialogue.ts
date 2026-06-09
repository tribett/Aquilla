export interface DialogueLine {
  speaker: string;
  text: string;
}

export interface DialogueSession {
  complete: boolean;
  currentLine: DialogueLine;
  index: number;
  lines: readonly DialogueLine[];
}

export const BRIARFOLD_ELDER_DIALOGUE: readonly DialogueLine[] = [
  {
    speaker: "Elder Mara",
    text: "Mercy is not weakness, Aquilla. It is strength that bends low enough to lift the lost.",
  },
  {
    speaker: "Elder Mara",
    text: "The Fold was built for refuge, not pride. Restore it, and Briarfold will remember its calling.",
  },
  {
    speaker: "Elder Mara",
    text: "Courage is obedience while fear is still speaking. Take the staff and go gently.",
  },
];

export function createDialogueSession(lines: readonly DialogueLine[]): DialogueSession {
  const firstLine = lines[0];

  if (!firstLine) {
    throw new Error("Dialogue sessions require at least one line.");
  }

  return {
    complete: false,
    currentLine: firstLine,
    index: 0,
    lines,
  };
}

export function advanceDialogue(session: DialogueSession): DialogueSession {
  const nextIndex = session.index + 1;
  const nextLine = session.lines[nextIndex];

  if (!nextLine) {
    return {
      ...session,
      complete: true,
    };
  }

  return {
    ...session,
    currentLine: nextLine,
    index: nextIndex,
  };
}
