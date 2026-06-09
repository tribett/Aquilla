import { describe, expect, it } from "vitest";
import {
  advanceDialogue,
  BRIARFOLD_ELDER_DIALOGUE,
  createDialogueSession,
} from "../../src/game/dialogue";

describe("dialogue sessions", () => {
  it("starts on the first elder line", () => {
    const session = createDialogueSession(BRIARFOLD_ELDER_DIALOGUE);

    expect(session.currentLine.speaker).toBe("Elder Mara");
    expect(session.currentLine.text).toContain("Mercy is not weakness");
    expect(session.complete).toBe(false);
  });

  it("advances through each line and then completes", () => {
    let session = createDialogueSession(BRIARFOLD_ELDER_DIALOGUE);

    session = advanceDialogue(session);
    expect(session.currentLine.text).toContain("The Fold was built");
    expect(session.complete).toBe(false);

    session = advanceDialogue(session);
    expect(session.currentLine.text).toContain("Courage is obedience");
    expect(session.complete).toBe(false);

    session = advanceDialogue(session);
    expect(session.complete).toBe(true);
  });
});
