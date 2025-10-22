# 🧭 AGENTS.md — Tetros

> **For project overview and gameplay mechanics, see [README.md](./README.md)**
> This document contains **operational guidelines for AI agents** working on the Tetros codebase.

## 📘 Table of Contents

1. [Security Requirements](#1-security-requirements) 🔒
2. [Agent Permissions](#2-agent-permissions) ⚖️
3. [Development Commands](#3-development-commands) ⚡
4. [Code Standards](#4-code-standards) 📋
5. [Quality Assurance Pipeline](#5-quality-assurance-pipeline) 🛡️
6. [Testing](#6-testing) 🧪
7. [Operational Checklist](#7-operational-checklist) ✅
8. [When Stuck](#8-when-stuck) 🤔

---

## 1. Security Requirements

**🚨 NON-NEGOTIABLE: These security rules must ALWAYS be followed.**

### 🔐 Critical Rules

```bash
# ❌ NEVER commit these files
.env
.env.*
*.key
*.pem
config/secrets.json

# ❌ NEVER hardcode secrets or credentials
const apiKey = "sk-1234567890"

# ✅ ALWAYS use environment variables
const apiKey = process.env.VITE_API_KEY
```

| Type        | Example         | Storage              |
| ----------- | --------------- | -------------------- |
| **Public**  | `VITE_APP_NAME` | In code              |
| **Private** | `DATABASE_URL`  | .env only            |
| **Secret**  | `JWT_SECRET`    | Vault or CI env only |

---

## 2. Agent Permissions

**⚖️ Operational boundaries for AI automation.**

### ✅ Allowed (Level 2 — Sandbox)

| Action                 | Example Commands                   | Notes           |
| ---------------------- | ---------------------------------- | --------------- |
| **Read/analyze files** | `cat`, `ls`, `grep`                | Full access     |
| **Lint & format**      | `npm run lint`, `prettier --write` | Reversible      |
| **Type check**         | `tsc --noEmit`                     | Safe            |
| **Run tests**          | `npm test`, `vitest run`           | Non-destructive |
| **Build preview**      | `npm run build`                    | Validation only |

### 🟡 Requires User Approval (Level 3 — Privileged)

| Action                      | Command                       | Reason                   |
| --------------------------- | ----------------------------- | ------------------------ |
| **Install packages**        | `npm install <pkg>`           | Alters dependencies      |
| **Git operations**          | `git push`, `merge`, `rebase` | Affects repo state       |
| **Delete files**            | `rm`, `rmdir`                 | Irreversible             |
| **Edit environment/config** | `.env`, `vite.config.ts`      | Security impact          |

**Before L3 actions, agent must:**

1. Display the command and parameters
2. Simulate plan of execution
3. Wait for explicit approval

---

## 3. Development Commands

**⚡ Prefer fast, file-scoped commands for low-cost feedback.**

### Global Commands

| Task         | Command           |
| ------------ | ----------------- |
| Install deps | `npm install`     |
| Serve dev    | `npm run dev`     |
| Build        | `npm run build`   |
| Preview      | `npm run preview` |
| Test all     | `npm test`        |
| Lint all     | `npm run lint`    |
| Coverage     | `npm run test:coverage` |

### File-Scoped Examples

```bash
npx eslint src/app/components/falling-piece/falling-piece.component.ts --fix
npx prettier --write src/services/game-loop.service.ts
npx tsc --noEmit src/utils/piece.utils.ts
npm test -- src/services/game-loop.service.spec.ts
```

### Angular CLI Shortcuts

```bash
ng generate component components/my-component
ng generate service services/my-service
```

---

## 4. Code Standards

### Naming & Structure

| Type             | Format     | Example                      |
| ---------------- | ---------- | ---------------------------- |
| Component        | PascalCase | `FallingPieceComponent`      |
| Service          | PascalCase | `GameLoopService`            |
| Interface / Type | PascalCase | `GameState`                  |
| File             | kebab-case | `falling-piece.component.ts` |
| Selector         | kebab-case | `<app-falling-piece>`        |

### Principles

- Avoid `any`, `var`, `console.log` (use proper logging if needed).
- Use `Readonly`, `private`, and `const`.
- Split logic: services for game logic, components for view.
- No direct DOM access → use `Renderer2`.
- Prefer `ChangeDetectionStrategy.OnPush`.

### Angular 20+ Modern Patterns

**🎯 This project uses Angular 20 with modern patterns:**

#### Signals for State Management
```typescript
// ✅ CORRECT: Use signals for reactive state
import { signal, computed } from '@angular/core';

export class GameFacadeService {
  private score = signal<number>(0);
  private level = signal<number>(1);

  // Computed signals for derived state
  displayScore = computed(() => this.score().toString().padStart(6, '0'));
}
```

#### Zoneless Change Detection
```typescript
// ✅ This project uses zoneless mode
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    // ...
  ]
};
```

#### Standalone Components
```typescript
// ✅ CORRECT: All components must be standalone
@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './game-board.component.html',
})
export class GameBoardComponent {}
```

### Git Commits

**Use [Conventional Commits](https://www.conventionalcommits.org/)**: `type(scope): description`

Common types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

Breaking changes: add `!` → `feat(game)!: change scoring system`

---

## 5. Quality Assurance Pipeline

🛡️ Every commit MUST pass the pipeline below:

### Step 1. Lint & Style

```bash
npm run lint -- --fix
```

### Step 2. Unit Tests

```bash
npm test -- --coverage
```

✅ **Minimum: 80% coverage**

### Step 3. Type & Build Verification

```bash
npx tsc --noEmit
npm run build
```

### Quality Matrix

| Check      | Tool       | Target                 |
| ---------- | ---------- | ---------------------- |
| **Lint**   | ESLint     | 100% clean             |
| **Format** | Prettier   | 100% consistent        |
| **Test**   | Vitest     | ≥ 80% coverage         |
| **Type**   | TypeScript | 0 errors               |
| **Build**  | Vite       | Pass                   |

---

## 6. Testing

### Unit Tests (Vitest)

```bash
npm test                    # Run all tests
npm run test:ui             # Interactive UI
npm run test:coverage       # Generate coverage report
```

- **Coverage Requirement**: ≥80% line/branch/function coverage
- **Location**: Tests are colocated with source files (`*.spec.ts`)
- **Reports**: HTML coverage reports in `./coverage/`

**Run specific tests:**
```bash
npm test -- src/services/game-loop.service.spec.ts
```

### Test Setup Configuration

**Location:** `src/test-setup.ts`

Critical mocks required for JSDOM environment:

```typescript
// Mock window.matchMedia for theme detection
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});
```

---

## 7. Operational Checklist

| ✅ Checkpoint        | Requirement                                    |
| -------------------- | ---------------------------------------------- |
| **Typing strict**    | `noImplicitAny`, `strictNullChecks`            |
| **Coverage**         | ≥ 80%                                          |
| **Style**            | Prettier + ESLint clean                        |
| **Change Detection** | `OnPush`                                       |
| **Async**            | Use Observables + `async` pipe                 |
| **DOM**              | Access via `Renderer2` only                    |
| **Permissions**      | Follow L2/L3 rules before destructive actions  |

---

## 8. When Stuck 🤔

If uncertain about a change:

1. Do **not** make speculative edits.
2. Propose a **short execution plan** summarizing what you intend to modify.
3. Ask the user for confirmation or open a **draft PR** with notes.
4. Document unresolved questions in a comment block before continuing.

---

> 🧠 **Note:**
> AGENTS.md is the single source of truth for automated and human contributors.
> All AI agents must respect this document's hierarchy and constraints.
> When uncertain, pause execution, summarize the plan, and request user confirmation.
