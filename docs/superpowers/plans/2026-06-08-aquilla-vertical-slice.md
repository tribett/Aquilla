# Aquilla Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first browser-playable Aquilla vertical slice: top-down movement, Shepherd's Staff interactions, a border-collie-styled companion, non-lethal encounter rules, and a compact Fold of the Lost prototype.

**Architecture:** Keep game rules in pure TypeScript modules under `src/game/` and render them through a thin Phaser scene under `src/render/`. Unit tests drive state, movement, puzzle, dog, encounter, and dungeon progression behavior before renderer work. Playwright verifies the browser shell, canvas rendering, keyboard input, and a scripted slice completion path.

**Tech Stack:** TypeScript 6.0.3, Vite 8.0.16, Phaser 4.1.0, Vitest 4.1.8, Playwright 1.60.0, browser-based Agent Browser verification.

---

## File Structure

- `package.json`: npm scripts and pinned dependency ranges.
- `index.html`: Vite entry HTML.
- `src/main.ts`: browser entry point that mounts Phaser.
- `src/styles.css`: page and debug overlay styling.
- `src/game/types.ts`: shared domain types.
- `src/game/createInitialState.ts`: initial vertical-slice state.
- `src/game/movement.ts`: pure movement and collision rules.
- `src/game/staff.ts`: Shepherd's Staff interactions.
- `src/game/dog.ts`: sheepdog command and herding rules.
- `src/game/encounters.ts`: non-lethal encounter resolution.
- `src/game/dungeon.ts`: Fold of the Lost progression rules.
- `src/render/AquillaScene.ts`: Phaser scene that renders and updates the pure game state.
- `src/render/debugOverlay.ts`: test-visible state overlay.
- `tests/unit/*.test.ts`: Vitest behavior tests.
- `tests/e2e/*.spec.ts`: Playwright browser checks.
- `vite.config.ts`: Vite config.
- `vitest.config.ts`: Vitest config.
- `playwright.config.ts`: Playwright config.
- `tsconfig.json`: TypeScript project config.
- `tsconfig.node.json`: TypeScript config for Node-side config files.

## Execution Rules

- Follow red-green-refactor. Write each failing test before production code.
- After every task, run the exact verification commands in that task.
- Use the in-app browser or Playwright after renderer tasks to inspect `http://localhost:5173`.
- Commit after each task with the listed commit message.
- Keep `.superpowers/` and `.playwright-mcp/` ignored.

## Task 1: Tooling And Browser Shell

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `src/main.ts`
- Create: `src/styles.css`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `tests/unit/app-shell.test.ts`
- Create: `tests/e2e/boot.spec.ts`

- [ ] **Step 1: Write project metadata and configs**

Create `package.json`:

```json
{
  "name": "aquilla",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "verify": "npm run test && npm run build && npm run test:e2e"
  },
  "dependencies": {
    "phaser": "^4.1.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.60.0",
    "typescript": "^6.0.3",
    "vite": "^8.0.16",
    "vitest": "^4.1.8"
  }
}
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vitest/globals"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src", "tests", "vite.config.ts", "vitest.config.ts", "playwright.config.ts"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Create `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts", "vitest.config.ts", "playwright.config.ts"]
}
```

Create `vite.config.ts`:

```ts
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
});
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
  },
});
```

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true,
    timeout: 30_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

- [ ] **Step 2: Install dependencies**

Run:

```bash
npm install
```

Expected: `package-lock.json` is created and npm exits with code `0`.

- [ ] **Step 3: Write failing shell tests**

Create `tests/unit/app-shell.test.ts`:

```ts
import { describe, expect, it } from "vitest";

describe("app shell contract", () => {
  it("uses the Aquilla browser mount point", async () => {
    const html = await import("node:fs/promises").then((fs) =>
      fs.readFile("index.html", "utf8"),
    );

    expect(html).toContain('<div id="game-root"');
    expect(html).toContain("/src/main.ts");
  });
});
```

Create `tests/e2e/boot.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("loads the Aquilla shell", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/");

  await expect(page.locator("#game-root")).toBeVisible();
  await expect(page.locator("body")).toHaveAttribute("data-game", "aquilla");
  expect(errors).toEqual([]);
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run:

```bash
npm run test -- tests/unit/app-shell.test.ts
```

Expected: FAIL because `index.html` does not exist.

Run:

```bash
npm run test:e2e -- tests/e2e/boot.spec.ts
```

Expected: FAIL because the Vite app does not have `#game-root`.

- [ ] **Step 5: Write minimal browser shell**

Create `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Aquilla</title>
  </head>
  <body data-game="aquilla">
    <div id="game-root" aria-label="Aquilla game canvas"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

Create `src/main.ts`:

```ts
import "./styles.css";

const root = document.querySelector<HTMLDivElement>("#game-root");

if (!root) {
  throw new Error("Missing #game-root");
}

root.dataset.ready = "true";
```

Create `src/styles.css`:

```css
:root {
  color: #f8fafc;
  background: #172112;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

* {
  box-sizing: border-box;
}

html,
body,
#game-root {
  width: 100%;
  height: 100%;
  margin: 0;
}

body {
  overflow: hidden;
}

#game-root {
  display: grid;
  place-items: center;
  background: #172112;
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run:

```bash
npm run test -- tests/unit/app-shell.test.ts
npm run test:e2e -- tests/e2e/boot.spec.ts
```

Expected: both PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add package.json package-lock.json index.html src/main.ts src/styles.css vite.config.ts vitest.config.ts playwright.config.ts tsconfig.json tsconfig.node.json tests/unit/app-shell.test.ts tests/e2e/boot.spec.ts
git commit -m "chore: scaffold Aquilla browser game"
```

## Task 2: Initial Game State

**Files:**
- Create: `src/game/types.ts`
- Create: `src/game/createInitialState.ts`
- Create: `tests/unit/game-state.test.ts`

- [ ] **Step 1: Write failing initial-state test**

Create `tests/unit/game-state.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/game/createInitialState";

describe("createInitialState", () => {
  it("starts Aquilla as a shepherd boy in Briarfold with staff and sheepdog", () => {
    const state = createInitialState();

    expect(state.region).toBe("briarfold-valley");
    expect(state.currentArea).toBe("briarfold");
    expect(state.player.name).toBe("Aquilla");
    expect(state.player.role).toBe("shepherd-boy");
    expect(state.inventory).toContain("shepherd-staff");
    expect(state.dog.style).toBe("border-collie");
    expect(state.objectives).toEqual({
      gatheredSheep: 0,
      requiredSheep: 3,
      waterRestored: false,
      guardianCalmed: false,
      foldRestored: false,
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test -- tests/unit/game-state.test.ts
```

Expected: FAIL because `src/game/createInitialState.ts` does not exist.

- [ ] **Step 3: Write minimal game state**

Create `src/game/types.ts`:

```ts
export type AreaId = "briarfold" | "old-pasture" | "fold-of-the-lost";

export type Direction = "up" | "down" | "left" | "right";

export type InventoryItem = "shepherd-staff";

export type DogCommand = "follow" | "stay" | "fetch" | "herd" | "distract";

export interface Vector2 {
  x: number;
  y: number;
}

export interface Actor {
  id: string;
  name: string;
  position: Vector2;
}

export interface Player extends Actor {
  role: "shepherd-boy";
  facing: Direction;
}

export interface Sheepdog extends Actor {
  style: "border-collie";
  command: DogCommand;
}

export interface Sheep extends Actor {
  gathered: boolean;
}

export interface Objectives {
  gatheredSheep: number;
  requiredSheep: number;
  waterRestored: boolean;
  guardianCalmed: boolean;
  foldRestored: boolean;
}

export interface GameState {
  region: "briarfold-valley";
  currentArea: AreaId;
  player: Player;
  dog: Sheepdog;
  sheep: Sheep[];
  inventory: InventoryItem[];
  objectives: Objectives;
}
```

Create `src/game/createInitialState.ts`:

```ts
import type { GameState } from "./types";

export function createInitialState(): GameState {
  return {
    region: "briarfold-valley",
    currentArea: "briarfold",
    player: {
      id: "aquilla",
      name: "Aquilla",
      role: "shepherd-boy",
      position: { x: 5, y: 5 },
      facing: "down",
    },
    dog: {
      id: "sheepdog",
      name: "Sheepdog",
      style: "border-collie",
      position: { x: 4, y: 5 },
      command: "follow",
    },
    sheep: [
      { id: "sheep-1", name: "Lost Sheep 1", position: { x: 9, y: 4 }, gathered: false },
      { id: "sheep-2", name: "Lost Sheep 2", position: { x: 12, y: 7 }, gathered: false },
      { id: "sheep-3", name: "Lost Sheep 3", position: { x: 7, y: 10 }, gathered: false },
    ],
    inventory: ["shepherd-staff"],
    objectives: {
      gatheredSheep: 0,
      requiredSheep: 3,
      waterRestored: false,
      guardianCalmed: false,
      foldRestored: false,
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm run test -- tests/unit/game-state.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/game/types.ts src/game/createInitialState.ts tests/unit/game-state.test.ts
git commit -m "feat: add Aquilla initial game state"
```

## Task 3: Movement And Collision Rules

**Files:**
- Create: `src/game/movement.ts`
- Create: `tests/unit/movement.test.ts`
- Modify: `src/game/types.ts`

- [ ] **Step 1: Write failing movement tests**

Create `tests/unit/movement.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/game/createInitialState";
import { movePlayer } from "../../src/game/movement";
import type { WorldMap } from "../../src/game/types";

const map: WorldMap = {
  width: 8,
  height: 8,
  blockedTiles: [{ x: 6, y: 5 }],
};

describe("movePlayer", () => {
  it("moves Aquilla one tile and updates facing when the path is clear", () => {
    const state = createInitialState();

    const next = movePlayer(state, "right", map);

    expect(next.player.position).toEqual({ x: 6, y: 5 });
    expect(next.player.facing).toBe("right");
  });

  it("keeps Aquilla in place when the destination is blocked", () => {
    const state = createInitialState();
    const next = movePlayer(state, "right", map);
    const blocked = movePlayer(next, "right", map);

    expect(blocked.player.position).toEqual({ x: 6, y: 5 });
    expect(blocked.player.facing).toBe("right");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test -- tests/unit/movement.test.ts
```

Expected: FAIL because `WorldMap` and `movePlayer` are not defined.

- [ ] **Step 3: Add movement types and implementation**

Append to `src/game/types.ts`:

```ts
export interface WorldMap {
  width: number;
  height: number;
  blockedTiles: Vector2[];
}
```

Create `src/game/movement.ts`:

```ts
import type { Direction, GameState, Vector2, WorldMap } from "./types";

const DIRECTION_DELTAS: Record<Direction, Vector2> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export function movePlayer(state: GameState, direction: Direction, map: WorldMap): GameState {
  const delta = DIRECTION_DELTAS[direction];
  const destination = {
    x: state.player.position.x + delta.x,
    y: state.player.position.y + delta.y,
  };

  if (isBlocked(destination, map)) {
    return {
      ...state,
      player: {
        ...state.player,
        facing: direction,
      },
    };
  }

  return {
    ...state,
    player: {
      ...state.player,
      position: destination,
      facing: direction,
    },
  };
}

function isBlocked(position: Vector2, map: WorldMap): boolean {
  const outsideMap =
    position.x < 0 || position.y < 0 || position.x >= map.width || position.y >= map.height;

  return (
    outsideMap ||
    map.blockedTiles.some((blocked) => blocked.x === position.x && blocked.y === position.y)
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm run test -- tests/unit/movement.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/game/types.ts src/game/movement.ts tests/unit/movement.test.ts
git commit -m "feat: add top-down movement rules"
```

## Task 4: Shepherd's Staff Interactions

**Files:**
- Create: `src/game/staff.ts`
- Create: `tests/unit/staff.test.ts`
- Modify: `src/game/types.ts`

- [ ] **Step 1: Write failing staff tests**

Create `tests/unit/staff.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/game/createInitialState";
import { useStaffOnObject } from "../../src/game/staff";
import type { Interactable } from "../../src/game/types";

describe("useStaffOnObject", () => {
  it("rings an old fold bell", () => {
    const bell: Interactable = { id: "fold-bell", kind: "bell", active: false };

    const result = useStaffOnObject(createInitialState(), bell);

    expect(result.object.active).toBe(true);
    expect(result.message).toBe("The fold-bell rings clear across the pasture.");
  });

  it("restores water when Aquilla redirects the dry channel", () => {
    const channel: Interactable = { id: "dry-channel", kind: "water-channel", active: false };

    const result = useStaffOnObject(createInitialState(), channel);

    expect(result.state.objectives.waterRestored).toBe(true);
    expect(result.object.active).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test -- tests/unit/staff.test.ts
```

Expected: FAIL because `Interactable` and `useStaffOnObject` are not defined.

- [ ] **Step 3: Add staff interaction types and implementation**

Append to `src/game/types.ts`:

```ts
export type InteractableKind = "bell" | "water-channel" | "shepherd-gate" | "stone";

export interface Interactable {
  id: string;
  kind: InteractableKind;
  active: boolean;
}
```

Create `src/game/staff.ts`:

```ts
import type { GameState, Interactable } from "./types";

export interface StaffInteractionResult {
  state: GameState;
  object: Interactable;
  message: string;
}

export function useStaffOnObject(
  state: GameState,
  object: Interactable,
): StaffInteractionResult {
  if (!state.inventory.includes("shepherd-staff")) {
    return {
      state,
      object,
      message: "Aquilla needs the Shepherd's Staff.",
    };
  }

  if (object.kind === "bell") {
    return {
      state,
      object: { ...object, active: true },
      message: `The ${object.id} rings clear across the pasture.`,
    };
  }

  if (object.kind === "water-channel") {
    return {
      state: {
        ...state,
        objectives: {
          ...state.objectives,
          waterRestored: true,
        },
      },
      object: { ...object, active: true },
      message: "Water returns to the dry channel.",
    };
  }

  return {
    state,
    object: { ...object, active: true },
    message: `The ${object.id} yields to the Shepherd's Staff.`,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm run test -- tests/unit/staff.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/game/types.ts src/game/staff.ts tests/unit/staff.test.ts
git commit -m "feat: add Shepherd's Staff interactions"
```

## Task 5: Sheepdog Commands And Herding

**Files:**
- Create: `src/game/dog.ts`
- Create: `tests/unit/dog.test.ts`

- [ ] **Step 1: Write failing dog-command tests**

Create `tests/unit/dog.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/game/createInitialState";
import { commandDog, herdNearestSheep } from "../../src/game/dog";

describe("dog commands", () => {
  it("sets the sheepdog command", () => {
    const state = createInitialState();

    const next = commandDog(state, "stay");

    expect(next.dog.command).toBe("stay");
  });

  it("gathers the nearest lost sheep when commanded to herd", () => {
    const state = commandDog(createInitialState(), "herd");

    const next = herdNearestSheep(state);

    expect(next.objectives.gatheredSheep).toBe(1);
    expect(next.sheep.filter((sheep) => sheep.gathered)).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test -- tests/unit/dog.test.ts
```

Expected: FAIL because `src/game/dog.ts` does not exist.

- [ ] **Step 3: Add dog command implementation**

Create `src/game/dog.ts`:

```ts
import type { DogCommand, GameState, Sheep } from "./types";

export function commandDog(state: GameState, command: DogCommand): GameState {
  return {
    ...state,
    dog: {
      ...state.dog,
      command,
    },
  };
}

export function herdNearestSheep(state: GameState): GameState {
  if (state.dog.command !== "herd") {
    return state;
  }

  const sheepToGather = state.sheep.find((sheep) => !sheep.gathered);

  if (!sheepToGather) {
    return state;
  }

  const sheep = state.sheep.map((candidate): Sheep => {
    if (candidate.id !== sheepToGather.id) {
      return candidate;
    }

    return {
      ...candidate,
      position: { x: 2, y: 2 },
      gathered: true,
    };
  });

  return {
    ...state,
    sheep,
    objectives: {
      ...state.objectives,
      gatheredSheep: state.objectives.gatheredSheep + 1,
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm run test -- tests/unit/dog.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/game/dog.ts tests/unit/dog.test.ts
git commit -m "feat: add sheepdog command rules"
```

## Task 6: Non-Lethal Encounter Resolution

**Files:**
- Create: `src/game/encounters.ts`
- Create: `tests/unit/encounters.test.ts`
- Modify: `src/game/types.ts`

- [ ] **Step 1: Write failing encounter tests**

Create `tests/unit/encounters.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { commandDog } from "../../src/game/dog";
import { createInitialState } from "../../src/game/createInitialState";
import { resolveEncounter } from "../../src/game/encounters";
import type { Encounter } from "../../src/game/types";

describe("resolveEncounter", () => {
  it("calms a corrupted guardian through distraction and staff restraint", () => {
    const guardian: Encounter = {
      id: "fold-guardian",
      kind: "corrupted-guardian",
      state: "hostile",
    };
    const state = commandDog(createInitialState(), "distract");

    const result = resolveEncounter(state, guardian, "staff-calm");

    expect(result.encounter.state).toBe("restored");
    expect(result.state.objectives.guardianCalmed).toBe(true);
    expect(result.message).toBe("The guardian lowers its head and remembers its charge.");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test -- tests/unit/encounters.test.ts
```

Expected: FAIL because `Encounter` and `resolveEncounter` are not defined.

- [ ] **Step 3: Add encounter types and implementation**

Append to `src/game/types.ts`:

```ts
export type EncounterKind = "thorn-beast" | "corrupted-guardian" | "fear-echo";

export type EncounterState = "hostile" | "stunned" | "restored";

export type EncounterAction = "staff-stun" | "staff-calm";

export interface Encounter {
  id: string;
  kind: EncounterKind;
  state: EncounterState;
}
```

Create `src/game/encounters.ts`:

```ts
import type { Encounter, EncounterAction, GameState } from "./types";

export interface EncounterResult {
  state: GameState;
  encounter: Encounter;
  message: string;
}

export function resolveEncounter(
  state: GameState,
  encounter: Encounter,
  action: EncounterAction,
): EncounterResult {
  if (
    encounter.kind === "corrupted-guardian" &&
    action === "staff-calm" &&
    state.dog.command === "distract"
  ) {
    return {
      state: {
        ...state,
        objectives: {
          ...state.objectives,
          guardianCalmed: true,
        },
      },
      encounter: {
        ...encounter,
        state: "restored",
      },
      message: "The guardian lowers its head and remembers its charge.",
    };
  }

  if (action === "staff-stun") {
    return {
      state,
      encounter: {
        ...encounter,
        state: "stunned",
      },
      message: "The Shepherd's Staff gives Aquilla a moment to protect the weak.",
    };
  }

  return {
    state,
    encounter,
    message: "The creature resists Aquilla's approach.",
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm run test -- tests/unit/encounters.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/game/types.ts src/game/encounters.ts tests/unit/encounters.test.ts
git commit -m "feat: add non-lethal encounter rules"
```

## Task 7: Fold Of The Lost Progression

**Files:**
- Create: `src/game/dungeon.ts`
- Create: `tests/unit/dungeon.test.ts`

- [ ] **Step 1: Write failing dungeon progression tests**

Create `tests/unit/dungeon.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createInitialState } from "../../src/game/createInitialState";
import { getFoldProgress, restoreFoldIfReady } from "../../src/game/dungeon";

describe("Fold of the Lost progression", () => {
  it("does not restore the fold before sheep, water, and guardian objectives are complete", () => {
    const state = createInitialState();

    expect(getFoldProgress(state)).toEqual({
      gatheredAllSheep: false,
      waterRestored: false,
      guardianCalmed: false,
      foldRestored: false,
    });
    expect(restoreFoldIfReady(state).objectives.foldRestored).toBe(false);
  });

  it("restores the fold when all required mercy objectives are complete", () => {
    const state = {
      ...createInitialState(),
      objectives: {
        gatheredSheep: 3,
        requiredSheep: 3,
        waterRestored: true,
        guardianCalmed: true,
        foldRestored: false,
      },
    };

    const next = restoreFoldIfReady(state);

    expect(next.objectives.foldRestored).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test -- tests/unit/dungeon.test.ts
```

Expected: FAIL because `src/game/dungeon.ts` does not exist.

- [ ] **Step 3: Add dungeon progression implementation**

Create `src/game/dungeon.ts`:

```ts
import type { GameState } from "./types";

export interface FoldProgress {
  gatheredAllSheep: boolean;
  waterRestored: boolean;
  guardianCalmed: boolean;
  foldRestored: boolean;
}

export function getFoldProgress(state: GameState): FoldProgress {
  return {
    gatheredAllSheep: state.objectives.gatheredSheep >= state.objectives.requiredSheep,
    waterRestored: state.objectives.waterRestored,
    guardianCalmed: state.objectives.guardianCalmed,
    foldRestored: state.objectives.foldRestored,
  };
}

export function restoreFoldIfReady(state: GameState): GameState {
  const progress = getFoldProgress(state);
  const ready = progress.gatheredAllSheep && progress.waterRestored && progress.guardianCalmed;

  if (!ready) {
    return state;
  }

  return {
    ...state,
    objectives: {
      ...state.objectives,
      foldRestored: true,
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm run test -- tests/unit/dungeon.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/game/dungeon.ts tests/unit/dungeon.test.ts
git commit -m "feat: add Fold of the Lost progression"
```

## Task 8: Phaser Canvas Rendering

**Files:**
- Create: `src/render/AquillaScene.ts`
- Create: `src/render/debugOverlay.ts`
- Modify: `src/main.ts`
- Modify: `tests/e2e/boot.spec.ts`

- [ ] **Step 1: Replace browser test with failing canvas expectations**

Replace `tests/e2e/boot.spec.ts` with:

```ts
import { expect, test } from "@playwright/test";

test("loads Aquilla and renders a nonblank game canvas", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/");

  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  await expect(page.locator("#debug-state")).toContainText("Aquilla");

  const pixel = await canvas.evaluate((node) => {
    const canvasElement = node as HTMLCanvasElement;
    const context = canvasElement.getContext("2d");
    if (!context) return null;
    return Array.from(context.getImageData(20, 20, 1, 1).data);
  });

  expect(pixel).not.toEqual([0, 0, 0, 0]);
  expect(errors).toEqual([]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test:e2e -- tests/e2e/boot.spec.ts
```

Expected: FAIL because no Phaser canvas or `#debug-state` exists.

- [ ] **Step 3: Add Phaser scene and debug overlay**

Create `src/render/debugOverlay.ts`:

```ts
import type { GameState } from "../game/types";

export function renderDebugOverlay(state: GameState): void {
  let overlay = document.querySelector<HTMLPreElement>("#debug-state");

  if (!overlay) {
    overlay = document.createElement("pre");
    overlay.id = "debug-state";
    document.body.append(overlay);
  }

  overlay.textContent = [
    `Aquilla ${state.player.position.x},${state.player.position.y}`,
    `Dog ${state.dog.command} ${state.dog.position.x},${state.dog.position.y}`,
    `Sheep ${state.objectives.gatheredSheep}/${state.objectives.requiredSheep}`,
    `Water ${state.objectives.waterRestored ? "restored" : "dry"}`,
    `Guardian ${state.objectives.guardianCalmed ? "calmed" : "hostile"}`,
    `Fold ${state.objectives.foldRestored ? "restored" : "lost"}`,
  ].join("\n");
}
```

Create `src/render/AquillaScene.ts`:

```ts
import Phaser from "phaser";
import { createInitialState } from "../game/createInitialState";
import type { GameState } from "../game/types";
import { renderDebugOverlay } from "./debugOverlay";

const TILE_SIZE = 32;

export class AquillaScene extends Phaser.Scene {
  private state: GameState = createInitialState();

  constructor() {
    super("AquillaScene");
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#2f7a49");
    this.drawWorld();
    renderDebugOverlay(this.state);
  }

  private drawWorld(): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2f7a49, 1);
    graphics.fillRect(0, 0, 640, 480);

    graphics.fillStyle(0x277da1, 1);
    graphics.fillRect(0, 384, 640, 48);

    graphics.fillStyle(0xcbd5e1, 1);
    graphics.fillRect(384, 96, 96, 96);
    graphics.lineStyle(4, 0x475569, 1);
    graphics.strokeRect(384, 96, 96, 96);

    graphics.fillStyle(0xfef3c7, 1);
    graphics.fillRect(
      this.state.player.position.x * TILE_SIZE,
      this.state.player.position.y * TILE_SIZE,
      24,
      24,
    );

    graphics.fillStyle(0x111827, 1);
    graphics.fillRect(
      this.state.dog.position.x * TILE_SIZE,
      this.state.dog.position.y * TILE_SIZE,
      20,
      20,
    );
  }
}
```

Replace `src/main.ts` with:

```ts
import Phaser from "phaser";
import "./styles.css";
import { AquillaScene } from "./render/AquillaScene";

const root = document.querySelector<HTMLDivElement>("#game-root");

if (!root) {
  throw new Error("Missing #game-root");
}

new Phaser.Game({
  type: Phaser.CANVAS,
  parent: root,
  width: 640,
  height: 480,
  backgroundColor: "#172112",
  pixelArt: true,
  scene: [AquillaScene],
});

root.dataset.ready = "true";
```

Append to `src/styles.css`:

```css
canvas {
  width: min(100vw, 960px);
  height: auto;
  image-rendering: pixelated;
}

#debug-state {
  position: fixed;
  left: 12px;
  bottom: 12px;
  z-index: 10;
  margin: 0;
  padding: 8px 10px;
  border: 1px solid rgba(248, 250, 252, 0.35);
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.82);
  color: #f8fafc;
  font: 12px/1.4 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
```

- [ ] **Step 4: Run browser test to verify it passes**

Run:

```bash
npm run test:e2e -- tests/e2e/boot.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Verify in Agent Browser**

Run:

```bash
npm run dev
```

Open `http://127.0.0.1:5173` in the in-app browser. Confirm the canvas shows a green valley, water band, shrine block, Aquilla, dog, and debug overlay.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/main.ts src/styles.css src/render/AquillaScene.ts src/render/debugOverlay.ts tests/e2e/boot.spec.ts
git commit -m "feat: render Aquilla prototype scene"
```

## Task 9: Keyboard Movement In Renderer

**Files:**
- Modify: `src/render/AquillaScene.ts`
- Create: `tests/e2e/movement.spec.ts`

- [ ] **Step 1: Write failing browser movement test**

Create `tests/e2e/movement.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("moves Aquilla with keyboard input", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("#debug-state")).toContainText("Aquilla 5,5");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#debug-state")).toContainText("Aquilla 6,5");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test:e2e -- tests/e2e/movement.spec.ts
```

Expected: FAIL because keyboard input does not update game state.

- [ ] **Step 3: Wire movement into the scene**

Replace `src/render/AquillaScene.ts` with:

```ts
import Phaser from "phaser";
import { createInitialState } from "../game/createInitialState";
import { movePlayer } from "../game/movement";
import type { GameState, WorldMap } from "../game/types";
import { renderDebugOverlay } from "./debugOverlay";

const TILE_SIZE = 32;

const PROTOTYPE_MAP: WorldMap = {
  width: 20,
  height: 15,
  blockedTiles: [
    { x: 12, y: 3 },
    { x: 13, y: 3 },
    { x: 12, y: 4 },
    { x: 13, y: 4 },
  ],
};

export class AquillaScene extends Phaser.Scene {
  private state: GameState = createInitialState();
  private graphics?: Phaser.GameObjects.Graphics;

  constructor() {
    super("AquillaScene");
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#2f7a49");
    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      if (event.key === "ArrowUp") this.move("up");
      if (event.key === "ArrowDown") this.move("down");
      if (event.key === "ArrowLeft") this.move("left");
      if (event.key === "ArrowRight") this.move("right");
    });
    this.redraw();
  }

  private move(direction: "up" | "down" | "left" | "right"): void {
    this.state = movePlayer(this.state, direction, PROTOTYPE_MAP);
    this.redraw();
  }

  private redraw(): void {
    this.graphics?.destroy();
    this.graphics = this.add.graphics();
    this.drawWorld(this.graphics);
    renderDebugOverlay(this.state);
  }

  private drawWorld(graphics: Phaser.GameObjects.Graphics): void {
    graphics.fillStyle(0x2f7a49, 1);
    graphics.fillRect(0, 0, 640, 480);

    graphics.fillStyle(0x277da1, 1);
    graphics.fillRect(0, 384, 640, 48);

    graphics.fillStyle(0xcbd5e1, 1);
    graphics.fillRect(384, 96, 96, 96);
    graphics.lineStyle(4, 0x475569, 1);
    graphics.strokeRect(384, 96, 96, 96);

    graphics.fillStyle(0xfef3c7, 1);
    graphics.fillRect(
      this.state.player.position.x * TILE_SIZE,
      this.state.player.position.y * TILE_SIZE,
      24,
      24,
    );

    graphics.fillStyle(0x111827, 1);
    graphics.fillRect(
      this.state.dog.position.x * TILE_SIZE,
      this.state.dog.position.y * TILE_SIZE,
      20,
      20,
    );
  }
}
```

- [ ] **Step 4: Run browser movement test to verify it passes**

Run:

```bash
npm run test:e2e -- tests/e2e/movement.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/render/AquillaScene.ts tests/e2e/movement.spec.ts
git commit -m "feat: connect keyboard movement"
```

## Task 10: Playable Staff, Dog, And Fold Completion Hotkeys

**Files:**
- Modify: `src/render/AquillaScene.ts`
- Create: `tests/e2e/vertical-slice.spec.ts`

- [ ] **Step 1: Write failing scripted vertical-slice test**

Create `tests/e2e/vertical-slice.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("completes the Fold of the Lost prototype loop", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press("KeyH");
  await expect(page.locator("#debug-state")).toContainText("Sheep 1/3");

  await page.keyboard.press("KeyH");
  await expect(page.locator("#debug-state")).toContainText("Sheep 2/3");

  await page.keyboard.press("KeyH");
  await expect(page.locator("#debug-state")).toContainText("Sheep 3/3");

  await page.keyboard.press("KeyW");
  await expect(page.locator("#debug-state")).toContainText("Water restored");

  await page.keyboard.press("KeyD");
  await page.keyboard.press("KeyG");
  await expect(page.locator("#debug-state")).toContainText("Guardian calmed");

  await page.keyboard.press("KeyR");
  await expect(page.locator("#debug-state")).toContainText("Fold restored");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test:e2e -- tests/e2e/vertical-slice.spec.ts
```

Expected: FAIL because the scene does not handle `H`, `W`, `D`, `G`, or `R` actions.

- [ ] **Step 3: Wire prototype action keys into the scene**

Replace `src/render/AquillaScene.ts` with:

```ts
import Phaser from "phaser";
import { commandDog, herdNearestSheep } from "../game/dog";
import { restoreFoldIfReady } from "../game/dungeon";
import { resolveEncounter } from "../game/encounters";
import { createInitialState } from "../game/createInitialState";
import { movePlayer } from "../game/movement";
import { useStaffOnObject } from "../game/staff";
import type { Encounter, GameState, Interactable, WorldMap } from "../game/types";
import { renderDebugOverlay } from "./debugOverlay";

const TILE_SIZE = 32;

const PROTOTYPE_MAP: WorldMap = {
  width: 20,
  height: 15,
  blockedTiles: [
    { x: 12, y: 3 },
    { x: 13, y: 3 },
    { x: 12, y: 4 },
    { x: 13, y: 4 },
  ],
};

export class AquillaScene extends Phaser.Scene {
  private state: GameState = createInitialState();
  private graphics?: Phaser.GameObjects.Graphics;
  private guardian: Encounter = {
    id: "fold-guardian",
    kind: "corrupted-guardian",
    state: "hostile",
  };

  constructor() {
    super("AquillaScene");
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#2f7a49");
    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      if (event.key === "ArrowUp") this.move("up");
      if (event.key === "ArrowDown") this.move("down");
      if (event.key === "ArrowLeft") this.move("left");
      if (event.key === "ArrowRight") this.move("right");
      if (event.code === "KeyH") this.herdSheep();
      if (event.code === "KeyW") this.restoreWater();
      if (event.code === "KeyD") this.commandDogToDistract();
      if (event.code === "KeyG") this.calmGuardian();
      if (event.code === "KeyR") this.restoreFold();
    });
    this.redraw();
  }

  private move(direction: "up" | "down" | "left" | "right"): void {
    this.state = movePlayer(this.state, direction, PROTOTYPE_MAP);
    this.redraw();
  }

  private herdSheep(): void {
    this.state = herdNearestSheep(commandDog(this.state, "herd"));
    this.redraw();
  }

  private restoreWater(): void {
    const channel: Interactable = { id: "dry-channel", kind: "water-channel", active: false };
    this.state = useStaffOnObject(this.state, channel).state;
    this.redraw();
  }

  private commandDogToDistract(): void {
    this.state = commandDog(this.state, "distract");
    this.redraw();
  }

  private calmGuardian(): void {
    const result = resolveEncounter(this.state, this.guardian, "staff-calm");
    this.state = result.state;
    this.guardian = result.encounter;
    this.redraw();
  }

  private restoreFold(): void {
    this.state = restoreFoldIfReady(this.state);
    this.redraw();
  }

  private redraw(): void {
    this.graphics?.destroy();
    this.graphics = this.add.graphics();
    this.drawWorld(this.graphics);
    renderDebugOverlay(this.state);
  }

  private drawWorld(graphics: Phaser.GameObjects.Graphics): void {
    graphics.fillStyle(0x2f7a49, 1);
    graphics.fillRect(0, 0, 640, 480);

    graphics.fillStyle(this.state.objectives.waterRestored ? 0x277da1 : 0x6b7280, 1);
    graphics.fillRect(0, 384, 640, 48);

    graphics.fillStyle(this.state.objectives.foldRestored ? 0xf8c35b : 0xcbd5e1, 1);
    graphics.fillRect(384, 96, 96, 96);
    graphics.lineStyle(4, 0x475569, 1);
    graphics.strokeRect(384, 96, 96, 96);

    graphics.fillStyle(this.state.objectives.guardianCalmed ? 0x86efac : 0x7f1d1d, 1);
    graphics.fillRect(512, 160, 28, 28);

    for (const sheep of this.state.sheep) {
      graphics.fillStyle(sheep.gathered ? 0xe5e7eb : 0xfef9c3, 1);
      graphics.fillRect(sheep.position.x * TILE_SIZE, sheep.position.y * TILE_SIZE, 18, 18);
    }

    graphics.fillStyle(0xfef3c7, 1);
    graphics.fillRect(
      this.state.player.position.x * TILE_SIZE,
      this.state.player.position.y * TILE_SIZE,
      24,
      24,
    );

    graphics.fillStyle(0x111827, 1);
    graphics.fillRect(
      this.state.dog.position.x * TILE_SIZE,
      this.state.dog.position.y * TILE_SIZE,
      20,
      20,
    );
  }
}
```

- [ ] **Step 4: Run scripted vertical-slice test to verify it passes**

Run:

```bash
npm run test:e2e -- tests/e2e/vertical-slice.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/render/AquillaScene.ts tests/e2e/vertical-slice.spec.ts
git commit -m "feat: add playable Fold prototype loop"
```

## Task 11: Player-Facing Controls And Theological Flavor Text

**Files:**
- Modify: `index.html`
- Modify: `src/styles.css`
- Modify: `tests/e2e/boot.spec.ts`

- [ ] **Step 1: Write failing UI copy test**

Replace `tests/e2e/boot.spec.ts` with:

```ts
import { expect, test } from "@playwright/test";

test("loads Aquilla and explains the playable prototype controls", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/");

  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Aquilla" })).toBeVisible();
  await expect(page.getByText("Gather. Guard. Restore.")).toBeVisible();
  await expect(page.getByText("Arrow keys")).toBeVisible();
  await expect(page.getByText("H herd")).toBeVisible();
  await expect(page.getByText("R restore fold")).toBeVisible();
  expect(errors).toEqual([]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test:e2e -- tests/e2e/boot.spec.ts
```

Expected: FAIL because the UI copy does not exist.

- [ ] **Step 3: Add concise control panel**

Replace `index.html` with:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Aquilla</title>
  </head>
  <body data-game="aquilla">
    <main class="game-shell">
      <section class="game-stage" aria-label="Aquilla playable prototype">
        <div class="game-copy">
          <h1>Aquilla</h1>
          <p>Gather. Guard. Restore.</p>
        </div>
        <div id="game-root" aria-label="Aquilla game canvas"></div>
      </section>
      <aside class="controls-panel" aria-label="Prototype controls">
        <h2>Controls</h2>
        <p><strong>Arrow keys</strong> move Aquilla.</p>
        <p><strong>H herd</strong> sends the sheepdog to gather one lost sheep.</p>
        <p><strong>W water</strong> uses the Shepherd's Staff on the dry channel.</p>
        <p><strong>D distract</strong> asks the dog to draw the guardian's attention.</p>
        <p><strong>G calm</strong> uses the staff to calm the guardian.</p>
        <p><strong>R restore fold</strong> completes the refuge when mercy objectives are done.</p>
      </aside>
    </main>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

Replace `src/styles.css` with:

```css
:root {
  color: #f8fafc;
  background: #172112;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

* {
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  min-height: 100%;
  margin: 0;
}

body {
  overflow: hidden;
}

.game-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  width: 100vw;
  height: 100vh;
  background: #172112;
}

.game-stage {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  min-width: 0;
  padding: 18px;
}

.game-copy h1 {
  margin: 0;
  font-size: 28px;
  line-height: 1;
}

.game-copy p {
  margin: 6px 0 14px;
  color: #cbd5e1;
}

#game-root {
  display: grid;
  place-items: center;
  min-width: 0;
  min-height: 0;
  border: 1px solid rgba(248, 250, 252, 0.18);
  border-radius: 8px;
  background: #172112;
  overflow: hidden;
}

canvas {
  width: min(100%, 960px);
  height: auto;
  image-rendering: pixelated;
}

.controls-panel {
  border-left: 1px solid rgba(248, 250, 252, 0.15);
  padding: 18px;
  background: #1f2a1a;
}

.controls-panel h2 {
  margin: 0 0 12px;
  font-size: 18px;
}

.controls-panel p {
  margin: 0 0 10px;
  color: #d1d5db;
  font-size: 14px;
  line-height: 1.4;
}

#debug-state {
  position: fixed;
  left: 12px;
  bottom: 12px;
  z-index: 10;
  margin: 0;
  padding: 8px 10px;
  border: 1px solid rgba(248, 250, 252, 0.35);
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.82);
  color: #f8fafc;
  font: 12px/1.4 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

@media (max-width: 760px) {
  body {
    overflow: auto;
  }

  .game-shell {
    grid-template-columns: 1fr;
    height: auto;
    min-height: 100vh;
  }

  .controls-panel {
    border-top: 1px solid rgba(248, 250, 252, 0.15);
    border-left: 0;
  }
}
```

- [ ] **Step 4: Run UI test to verify it passes**

Run:

```bash
npm run test:e2e -- tests/e2e/boot.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add index.html src/styles.css tests/e2e/boot.spec.ts
git commit -m "feat: add Aquilla prototype controls"
```

## Task 12: Final Verification Pass

**Files:**
- Modify only files required by failures found during this task.

- [ ] **Step 1: Run full automated verification**

Run:

```bash
npm run verify
```

Expected: unit tests PASS, TypeScript build PASS, Vite build PASS, Playwright tests PASS.

- [ ] **Step 2: Run desktop browser verification**

Run:

```bash
npm run dev
```

Open `http://127.0.0.1:5173` in Agent Browser. Verify:

- The app loads without console errors.
- The canvas is nonblank.
- Aquilla, the sheepdog, sheep, water channel, sanctuary block, and guardian marker are visible.
- Arrow keys move Aquilla.
- `H`, `W`, `D`, `G`, and `R` complete the prototype loop.
- Text is readable and does not overlap at desktop width.

- [ ] **Step 3: Run mobile viewport browser verification**

Use Playwright or Agent Browser at `390x844`. Verify:

- The game stage and controls stack vertically.
- The canvas is visible.
- Text remains inside its containers.
- Debug overlay does not hide the control panel heading.

- [ ] **Step 4: Commit verification fixes**

If Step 1, Step 2, or Step 3 required code changes, run:

```bash
git add .
git commit -m "fix: polish Aquilla vertical slice verification"
```

If no changes were required, run:

```bash
git status --short
```

Expected: no tracked file changes.

## Self-Review

Spec coverage:

- Core Zelda-like browser-playable slice is covered by Tasks 1, 8, 9, 10, 11, and 12.
- Pure game state, puzzle, dog, staff, encounter, and dungeon rules are covered by Tasks 2 through 7.
- Shepherd boy, Shepherd's Staff, border-collie-styled dog, lost sheep, water restoration, guardian calming, and fold restoration are represented in code-level tasks.
- Theology enters the first slice through non-lethal verbs, restoration objectives, and UI language; deeper story scenes remain outside this first implementation plan.

Type consistency:

- `GameState`, `WorldMap`, `Interactable`, `Encounter`, `DogCommand`, and `EncounterAction` are introduced before use.
- Renderer tasks consume the pure functions introduced in earlier tasks.
- Debug overlay text matches Playwright assertions.

Scope boundary:

- This plan builds a functional prototype loop, not a polished full game.
- Pixel-art production assets, final dog name, full dialogue system, tilemap editor, save format, and campaign content stay outside this plan.
