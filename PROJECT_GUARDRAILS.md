# GPA Engine — Project Guardrails

> **Document purpose:** Protect the project from accidental destruction during AI-assisted and human development. All contributors and AI agents **must read this file before making any code changes**.

---

## Why This Document Exists

GPA Engine contains fragile, high-value systems:

- Official SITCOE grade calculation logic
- Firebase Authentication and Firestore user data
- Semester-specific subject structures and marking schemes
- Multi-step navigation flows that users depend on

A single careless refactor can break calculations, lose user data, or destroy working features. **These guardrails are non-negotiable.**

---

## Strict Rules

### Functionality Protection

| Rule | Detail |
|------|--------|
| **Never remove existing functionality** | If a feature works, it stays unless explicitly instructed to remove it |
| **Never modify working calculations unless explicitly instructed** | Grade logic, SGPA formulas, and rounding rules are sacred |
| **Never delete semester logic** | Semester engines, subject definitions, and component maps must be preserved |
| **Never overwrite existing semester engines** | Extend with new engines; do not replace `engine.js` in place |
| **Never replace existing components** | Extend or wrap components; do not delete `MarksMode`, `TargetMode`, `AuthPage`, etc. without explicit approval |

### Development Philosophy

| Rule | Detail |
|------|--------|
| **Always extend instead of replacing** | Add new files, modes, and semesters alongside existing code |
| **Ask before major refactoring** | Large structural changes require human confirmation |
| **Explain planned changes before coding** | No silent rewrites of auth, engine, or navigation |

### Infrastructure Protection

| Rule | Detail |
|------|--------|
| **Preserve Firebase Authentication** | Google OAuth, email/password, and session persistence must remain functional |
| **Preserve Firestore Integration** | User and academic data collections must not be broken or renamed without migration |
| **Preserve User Data** | Never introduce changes that wipe `users`, `marks`, or `academic` documents |
| **Preserve Existing Routes** | Navigation views and user flows must remain backward-compatible |
| **Preserve Existing UI Flows** | Login → app entry → mode/semester selection → workspace must not regress |

---

## Protected Systems (Current Codebase)

The following files and systems are **protected**. Treat them as core infrastructure:

### Authentication & Firebase

```
src/firebase/config.js      — Firebase init, env-based configuration
src/firebase/localAuth.js   — Local/offline user fallback
src/components/AuthPage.js  — Sign-in, sign-up, Google OAuth, forgot password
src/components/AuthPage.css — Auth UI styles
```

### Calculation Engine

```
src/data/engine.js          — Grade system, Sem II subjects, all core algorithms
```

**Protected functions in `engine.js`:**

- `collegeRound()` — Official rounding rule
- `getGradeFromPct()` — Grade mapping after percentage rounding
- `computeSubject()` — Component marks → grade → credit points
- `calcSGPA()` — SGPA = total credit points ÷ total credits
- `reverseEngineer()` — Target SGPA → per-subject requirements
- `gradeBoundaryAnalysis()` — Grade upgrade opportunities
- `riskAnalysis()` — Grade drop sensitivity
- `creditLeverageRanking()` — SGPA impact by credits
- `targetCalculator()` — Partial marks → remaining requirements
- `controlIndex()` / `overallControlIndex()` — Controlled vs exam marks
- `SCENARIOS()` — Reference SGPA scenarios

### Application Shell & Workspaces

```
src/App.js                  — Auth gate, navigation state, mode routing
src/App.css                 — Global design system and component styles
src/components/MarksMode.js — Reverse Engineering workspace (Sem II)
src/components/TargetMode.js — Planning workspace (Sem II)
```

### Persistence

| Store | Path / Key | Purpose |
|-------|-----------|---------|
| Firestore | `users/{uid}` | User profile |
| Firestore | `marks/{uid}` | Marks and target SGPA (legacy Sem II) |
| Firestore | `academic/{uid}` | V2 academic data (profile semesters, CGPA history) |
| localStorage | `gpa-marks`, `gpa-target` | Offline marks cache |
| localStorage | `gpa-profile-{uid}`, `gpa-academic-{uid}` | Offline profile cache |

### Environment

```
.env.example                — Required Firebase environment variable template
.env.local                  — Developer secrets (never commit)
```

---

## Pre-Code Checklist for AI Agents

**Before generating any code**, every AI agent must provide the following in plain language:

### 1. Files to Create
List every new file with a one-line purpose.

### 2. Files to Modify
List every existing file and summarize what will change.

### 3. Files Untouched
Explicitly confirm which protected files will **not** be changed.

### 4. Risks
Identify risks to:
- Calculation accuracy
- User data integrity
- Authentication flow
- Navigation flow
- Backward compatibility

### 5. Implementation Plan
Step-by-step plan in dependency order.

**Only after all five sections are approved or acknowledged may code be generated.**

---

## Calculation Guardrails

These rules must never be violated without explicit instruction and documentation update:

### Grade Rounding
```
collegeRound(val) = Math.floor(val + 0.5)
```
Percentage is rounded **before** grade mapping.

### SGPA Formula
```
SGPA = Total Credit Points ÷ Total Semester Credits
```
Denominator is the **full semester credit total**, not partial credits entered.

### Credit Points
```
Credit Points = Grade Points × Subject Credits
```

### Reverse Engineering
- Locked subjects = subjects with all components entered
- Remaining subjects receive recommended grades based on `avgGPNeeded`
- Feasibility: `avgGPNeeded` must be between 0 and 10

### Boundary Analysis
- Only show upgrades within **10 marks** of next grade
- Rank by ROI: `creditPointGain / gap`

### Risk Analysis
- Default variation: **±3 percentage points** (not raw marks)

---

## Semester Engine Guardrails

When adding new semesters:

1. **Create new semester data files** — e.g. `src/data/semesters/sem3.js`
2. **Create or extend engine factories** — e.g. `semesterEngine.js`, do not mutate Sem II logic
3. **Register in semester index** — central semester metadata
4. **Document in `SEMESTER_RULES.md`** — official subject structure before coding
5. **Never change another semester's credits or components** when adding a new one

---

## Multi-College & Profile Guardrails

When working with user profiles and college data:

1. **Dashboard must remain data-driven** — Deriving statuses (Active, Completed, Coming Soon) dynamically from the user's `currentSemester`.
2. **New colleges must be added via configuration files** — E.g., `src/data/colleges/newcollege.js`. Never hardcode college logic in the UI or Engine.
3. **No hardcoded semester logic** — Always rely on college configurations to calculate credit weights for CGPA.
4. **Firestore is the Source of Truth** — `localStorage` is used ONLY as a cache for offline support and immediate UI feedback.

---

## Firebase Guardrails

| Do | Don't |
|----|-------|
| Use `merge: true` on Firestore writes | Overwrite entire documents without merge |
| Guard Firestore calls when `!db` or `isLocalUser()` | Call Firestore with null db |
| Lazy-init Firebase when env vars missing | Initialize Firebase with empty API keys |
| Debounce marks writes (≥1000ms) | Write on every keystroke |
| Skip first save after cloud load | Overwrite cloud with stale localStorage |

---

## UI & Navigation Guardrails

| Do | Don't |
|----|-------|
| Add new views alongside existing ones | Remove working navigation paths |
| Preserve "Back" button behavior | Break escape routes from nested views |
| Keep dark theme CSS variables | Introduce conflicting design systems |
| Test mobile layout for new screens | Ship desktop-only layouts |

---

## Documentation Guardrails

| Do | Don't |
|----|-------|
| Update `SEMESTER_RULES.md` when subjects change | Change subjects in code only |
| Update `ARCHITECTURE_PLAN.md` when flow changes | Let docs drift from implementation |
| Reference this file in PR descriptions | Skip guardrail review for "small" changes |

---

## Emergency Recovery Principles

If something breaks:

1. **Do not** mass-delete files to "fix" compile errors
2. **Do not** rewrite `engine.js` from scratch
3. **Do not** remove Firebase fallback paths
4. **Do** revert the smallest change that caused the regression
5. **Do** verify SGPA output against known test cases after any engine change

---

## Approval Thresholds

| Change Type | Approval Required |
|-------------|-----------------|
| New semester data file | Document in `SEMESTER_RULES.md` first |
| New UI screen / view | Update `ARCHITECTURE_PLAN.md` |
| Engine formula change | Explicit human instruction + `SEMESTER_RULES.md` update |
| Firestore schema change | Migration plan + backward compatibility |
| Delete any component | Explicit human instruction |
| Refactor `App.js` navigation | Pre-code checklist required |

---

## Related Documents

| Document | Role |
|----------|------|
| `PROJECT_VISION.md` | Why we build GPA Engine |
| `ARCHITECTURE_PLAN.md` | Official system structure and flows |
| `SEMESTER_RULES.md` | Official subject and grading rules |
| `DOCUMENTATION/` | Supplementary technical docs |

---

*When in doubt: extend, don't replace. Explain, then code.*
