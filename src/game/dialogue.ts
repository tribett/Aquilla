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

export const OPENING_DIALOGUE: readonly DialogueLine[] = [
  {
    speaker: "Elder Mara",
    text: "Aquilla, the Fold lies tangled and the sheep are scattered. Briarfold has grown afraid of its own calling.",
  },
  {
    speaker: "Elder Mara",
    text: "Take Bracken and the Shepherd's Staff. Gather what is lost, guard what is weak, and restore what mercy can heal.",
  },
  {
    speaker: "Aquilla",
    text: "I am afraid, Elder Mara. What if I am too small for this?",
  },
  {
    speaker: "Elder Mara",
    text: "Courage is obedience while fear is still speaking. Go gently. Grace goes ahead of you.",
  },
];

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

export const FINALE_DIALOGUE: readonly DialogueLine[] = [
  {
    speaker: "Elder Mara",
    text: "You returned, Aquilla. Not with trophies, but with the lost gathered and the Fold made refuge again.",
  },
  {
    speaker: "Elder Mara",
    text: "You remembered that light is gift. You received that grace is not earned. You return now as one sent.",
  },
  {
    speaker: "Aquilla",
    text: "The valley is wider than I knew. I thought courage meant not being afraid.",
  },
  {
    speaker: "Elder Mara",
    text: "Courage means faithful care while fear still speaks. The Shepherd sends restored servants to love what remains broken.",
  },
  {
    speaker: "Elder Mara",
    text: "Rest tonight in Briarfold. Tomorrow the road opens toward Elarion's wider kingdom. Gather. Guard. Restore.",
  },
  {
    speaker: "Aquilla",
    text: "I will go where mercy calls. Bracken and I are ready.",
  },
];

export const ASHFORD_GUIDE_DIALOGUE: readonly DialogueLine[] = [
  {
    speaker: "Pilgrim Elias",
    text: "The Ashen Moor burns with borrowed light. False fire pretends to guide travelers who have lost the Shepherd's voice.",
  },
  {
    speaker: "Pilgrim Elias",
    text: "Cleanse Ember Fen first. Its channels were turned to feed pride. Turn them back toward mercy.",
  },
  {
    speaker: "Aquilla",
    text: "I will not strike what can be restored. Bracken and I go gently.",
  },
];

export const MONASTIC_ECHO_DIALOGUE: readonly DialogueLine[] = [
  {
    speaker: "Monastic Echo",
    text: "We sang when the road was whole. Sing faith before sight returns.",
  },
  {
    speaker: "Monastic Echo",
    text: "Hope is not optimism—it is trust that the Shepherd still walks ruined roads.",
  },
  {
    speaker: "Monastic Echo",
    text: "Love is the monastery's foundation: mercy that bends low to lift the lost.",
  },
];

export const CATHEDRAL_ACOLYTE_DIALOGUE: readonly DialogueLine[] = [
  {
    speaker: "Cathedral Acolyte",
    text: "Praise remembers who made all things good. Confession remembers we did not keep that goodness alone.",
  },
  {
    speaker: "Cathedral Acolyte",
    text: "Sending is not escape—it is being sent back to love what remains broken.",
  },
];

export const LUCENT_SENTINEL_DIALOGUE: readonly DialogueLine[] = [
  {
    speaker: "Lucent Court Sentinel",
    text: "We offer unity without cost. Bow, and fear will leave you.",
  },
  {
    speaker: "Aquilla",
    text: "False light binds. Mercy restores without demanding pride.",
  },
];

export const CROWN_WITNESS_DIALOGUE: readonly DialogueLine[] = [
  {
    speaker: "Elder Mara",
    text: "You crossed moor, kingsroad, and Elarion's broken courts. False light could not hold you.",
  },
  {
    speaker: "Elder Mara",
    text: "The Crown Witness is not a trophy. It is faithfulness: gather, guard, restore, wherever mercy calls.",
  },
  {
    speaker: "Aquilla",
    text: "The kingdom is wider than fear told me. I am sent to love what remains broken.",
  },
  {
    speaker: "Elder Mara",
    text: "Then rest, and rise. Aquilla's witness is complete. The Shepherd's mercy goes with you.",
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
