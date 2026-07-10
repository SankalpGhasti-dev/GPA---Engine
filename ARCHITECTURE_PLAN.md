# GPA Engine — Architecture Plan

> **Document purpose:** Define the official GPA Engine V2 architecture, navigation flows, data model, and component structure. This is the authoritative blueprint for all future development.

---

## Architecture Overview

GPA Engine is a **single-page React application** (Create React App) with:

- **Presentation Layer** — React components and CSS
- **State Layer** — Component state, hooks, and memoized analytics
- **Engine Layer** — Pure JavaScript calculation modules per semester
- **Persistence Layer** — Firebase Auth, Firestore, and localStorage fallback

```
┌─────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                     │
│  AuthPage · Onboarding · Dashboard · GoalSelection      │
│  Sem3Workspace · UnderDevelopment · ProfileSettings     │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                     STATE LAYER                          │
│  App.js (auth + view routing)                           │
│  useUserData hook (profile + academic data)               │
│  Component-local state (marks, tabs, targets)             │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                    ENGINE LAYER                          │
│  engine.js (Sem II legacy)                              │
│  semesterEngine.js (factory for any semester)           │
│  sem3Engine.js (Semester 3 instance)                    │
│  semesters/sem3.js (subject definitions)                  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                  PERSISTENCE LAYER                       │
│  Firebase Auth · Firestore · localStorage               │
└─────────────────────────────────────────────────────────┘
```

---

## Official Application Flow

This is the **target navigation flow** for GPA Engine V2:

```
Login
  ↓
Onboarding (first login only)
  ↓
Dashboard
  ↓
Academic Roadmap
  ↓
Year Selection (implicit in roadmap blocks)
  ↓
Semester Selection
  ↓
Mode Selection (Goal Selection Screen)
  ↓
Semester Workspace
```

### Flow Detail

| Step | Screen | Condition |
|------|--------|-----------|
| 1 | **Login** | User not authenticated |
| 2 | **Onboarding** | `profile.onboardingComplete === false` |
| 3 | **Dashboard** | Default authenticated home |
| 4 | **Academic Roadmap** | Embedded in Dashboard; user clicks a semester |
| 5 | **Semester Landing** | Semester clicked; show Goal Selection if no saved mode |
| 6 | **Mode Selection** | User chooses workflow mode |
| 7 | **Workspace** | Semester-specific marks/planning environment |

### Return Visit Behavior

If the user previously selected a workflow mode for a semester:

```
Dashboard → Semester 3 → Workspace (restored mode)
```

The user may change mode via **Change Goal** in the workspace, which returns to the Goal Selection screen.

---

## View State Machine

`App.js` manages top-level views:

| View Key | Component | Trigger |
|----------|-----------|---------|
| `loading` | Spinner | `user === undefined` or data loading |
| `auth` | `AuthPage` | `user === null` |
| `onboarding` | `Onboarding` | Authenticated, onboarding incomplete |
| `dashboard` | `Dashboard` | Default authenticated state |
| `semester-landing` | `SemesterGoalSelection` | Semester opened, no saved `workflowMode` |
| `workspace` | `Sem3Workspace` | Mode selected or restored |
| `under-dev` | `UnderDevelopment` | Non-functional semester selected |

---

## Academic Roadmap Structure

The dashboard displays **four academic year blocks**, each containing two semesters:

### First Year
| Semester | Status |
|----------|--------|
| Semester 1 | Under Development |
| Semester 2 | Under Development |

### Second Year
| Semester | Status |
|----------|--------|
| Semester 3 | **Fully Functional** |
| Semester 4 | Under Development |

### Third Year
| Semester | Status |
|----------|--------|
| Semester 5 | Under Development |
| Semester 6 | Under Development |

### Fourth Year
| Semester | Status |
|----------|--------|
| Semester 7 | Under Development |
| Semester 8 | Under Development |

### Semester Status Badges

| Status | Badge | Meaning |
|--------|-------|---------|
| **Completed** | Green — `✓ Completed` | Past semester (before `currentSemester`) |
| **Current** | Blue — `● Active` | User's active semester |
| **Future** | Gray — `Coming Soon` | Not yet available |

---

## Semester Flow

Every functional semester follows this sub-flow:

```
Semester Selected
       ↓
Mode Selection (Goal Selection Screen)
       ↓
   ┌───┴───┐
   │       │
Mode 1   Mode 2
   │       │
   ▼       ▼
Workspace Workspace
(marks)  (planning)
```

### Mode 1: I Have Some Marks

| Property | Value |
|----------|-------|
| **Label** | I Have Some Marks |
| **Button** | Continue |
| **Firestore Key** | `workflowMode: "marks"` |
| **Workspace** | Reverse Engineering Mode |
| **Purpose** | Enter CA1, CA2, Midsem, ESE, Viva, Practical marks; calculate remaining requirements |

### Mode 2: Fresh Semester / Planning

| Property | Value |
|----------|-------|
| **Label** | Fresh Semester / Planning |
| **Button** | Start Planning |
| **Firestore Key** | `workflowMode: "planning"` |
| **Workspace** | Planning Mode |
| **Purpose** | Set target SGPA; generate full semester roadmap and subject strategy |

---

## Goal Selection Screen

**Component:** `SemesterGoalSelection.js`

| Element | Content |
|---------|---------|
| **Title** | What's your goal? |
| **Subtitle** | Choose how you want to use GPA Engine. |
| **Back** | ← Dashboard |

Displayed between Dashboard and Workspace for semesters without a saved `workflowMode`, or when user clicks **Change Goal**.

---

## Dashboard Requirements

The main dashboard (`Dashboard.js`) must provide:

### Header Section
- Welcome message: `Welcome back, {Name}`
- Profile picture (Google photo or initials)
- Branch, college, and current semester

### Status Strip
| Metric | Source |
|--------|--------|
| Current CGPA | Weighted from `cgpaHistory` + predicted current SGPA |
| Target CGPA | `profile.targetCGPA` |
| Current Semester | `profile.currentSemester` |
| Target SGPA | `profile.targetSGPA` or semester target |

### Summary Cards (4)
1. **Current CGPA**
2. **Highest SGPA Achieved**
3. **Current Target SGPA**
4. **Remaining Subjects** (incomplete in current semester)

### Academic Roadmap
- Four year blocks with semester buttons
- Status badges per semester
- Click navigates to semester flow

### CGPA Tracking
- Semester history table (past SGPA + current predicted)
- Current CGPA vs target CGPA

### Analytics Section
- SGPA trend chart (semester-wise)
- CGPA progress chart (cumulative growth)
- Subject performance comparison (in workspace)

### Profile & Settings
- Editable profile (name, branch, college, targets)
- Google account integration via Firebase Auth
- Sign out

---

## Under-Development Semesters

**Component:** `UnderDevelopment.js`

All semesters **except Semester 3** display:

```
🚧 Under Development

This semester is currently being developed.

We are preparing:
· Subject structure
· Credit structure
· SGPA engine
· Grade prediction model

Please check again later.
```

Requirements:
- Professional dark-theme UI
- Modern illustration or animated icon
- Back navigation to Dashboard

---

## Semester 3 Workspace

**Component:** `Sem3Workspace.js`  
**Engine:** `sem3Engine.js` (22 credits)  
**Status:** Only fully functional semester

### Reverse Engineering Mode (`workflowMode: "marks"`)

| Tab | Purpose |
|-----|---------|
| Marks | Enter component marks per subject |
| Target Tracker | Predicted vs target SGPA, gap, subjects needing improvement |
| Optimize | Grade boundary analysis, high-impact subjects |
| Analytics | Subject performance charts, credit leverage |
| Risks | Grade drop sensitivity (±3%) |

### Planning Mode (`workflowMode: "planning"`)

| Tab | Purpose |
|-----|---------|
| Roadmap | Per-subject recommended grades and marks |
| Breakdown | Component-wise minimum marks |
| Leverage | Credit-weighted SGPA impact ranking |
| Scenarios | Reference SGPA scenarios and grade table |

---

## Onboarding Flow

**Component:** `Onboarding.js`  
**Trigger:** First login when `onboardingComplete === false`

### Collected Fields

| Field | Auto-fill |
|-------|-----------|
| Full Name | From Google `displayName` |
| Email | From Google `email` |
| Branch | User selects |
| Current Academic Year | User selects |
| Current Semester | User selects |
| College Name | User enters |
| Target CGPA | User enters |
| Target SGPA | User enters |
| Past Semester SGPA | Shown if `currentSemester > 1` |

Stored in Firestore `users/{uid}`. Never shown again unless user edits profile settings.

---

## Firestore Data Model

### Collection: `users/{uid}`

```javascript
{
  name: string,
  email: string,
  photoURL: string | null,
  collegeId: string,           // e.g. "sitcoe-ichalkaranji"
  collegeName: string,         // e.g. "Sharad Institute of Technology..."
  university: string,
  branch: string,
  currentYear: number,
  currentSemester: number,
  onboardingComplete: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Collection: `academic/{uid}`

```javascript
{
  sem1SGPA: number | null,
  sem2SGPA: number | null,
  sem3SGPA: number | null,
  sem4SGPA: number | null,
  sem5SGPA: number | null,
  sem6SGPA: number | null,
  sem7SGPA: number | null,
  sem8SGPA: number | null,
  goals: {
    targetCGPA: number | null,
    targetSGPA: number | null
  },
  semesters: {
    "3": {
      marks: { "<code>": { ca1, ca2, ese, viva, practical } },
      customNames: { "SEM3_MINOR": string, "SEM3_ELECTIVE": string },
      workflowMode: "marks" | "planning"
    }
  },
  updatedAt: timestamp
}
```

### Collection: `marks/{uid}` (Legacy — Sem II)

```javascript
{
  gpa_marks: { "<code>": { ca1, ca2, mse, endsem } },
  gpa_target: string,
  updatedAt: timestamp
}
```

> **Note:** Legacy `marks` collection serves Sem II `MarksMode`. V2 semesters use `academic/{uid}.semesters`. Do not delete legacy data during V2 migration.

---

## Engine Architecture

### Layered Engine Design

| File | Role |
|------|------|
| `src/data/engine.js` | Sem II legacy engine (21 credits) — **protected** |
| `src/data/semesterEngine.js` | Factory: `createSemesterEngine(subjects, totalCredits)` |
| `src/data/sem3Engine.js` | Pre-built Sem 3 engine instance |
| `src/data/semesters/sem3.js` | Sem 3 subject definitions |
| `src/data/semesters/index.js` | Semester metadata, roadmap, status helpers |

### Component Type Registry (Semester 3)

| Type | Components | Max Marks |
|------|------------|-----------|
| `theory100_ese` | CA1(25), CA2(25), ESE(50) | 100 |
| `theory50_ca25` | CA1(25), CA2(25) | 50 |
| `lab_viva` | CA1(15), CA2(15), Viva(20), Practical(50) | 100 |
| `custom_theory50` | CA1(25), CA2(25) — user-named subject | 50 |

### Shared Grade System

All semesters share the SITCOE grade table defined in `SEMESTER_RULES.md`.

---

## Authentication Architecture

```
Firebase Auth
├── Google OAuth (signInWithPopup)
├── Email / Password (sign up + sign in)
├── Forgot Password (sendPasswordResetEmail)
└── Local User Fallback (when Firebase not configured)

Session: onAuthStateChanged → App.js user state
```

**Files:**
- `src/firebase/config.js`
- `src/firebase/localAuth.js`
- `src/components/AuthPage.js`

---

## Services & Hooks

| File | Purpose |
|------|---------|
| `src/services/profileService.js` | Load/save profile and academic data (Firestore + localStorage) |
| `src/hooks/useUserData.js` | React hook wrapping profileService, computes real-time CGPA |

### Sync Strategy

1. Load from Firestore on mount
2. Cache to localStorage immediately
3. Write to localStorage on every change
4. Debounce Firestore writes (1200ms)
5. Skip first write after load to prevent stale overwrites
6. Skip Firestore entirely for `LOCAL_USER`
7. Use `merge: true` on all writes to prevent data loss

---

## Component Map (Target V2)

```
src/
├── App.js
├── components/
│   ├── AuthPage.js
│   ├── Onboarding.js         (New V2 Profile Setup)
│   ├── Dashboard.js
│   ├── SemesterGoalSelection.js
│   ├── Sem3Workspace.js
│   ├── UnderDevelopment.js
│   ├── ProfileModal.js       (New V2 Edit Profile)
│   ├── MarksMode.js          (legacy Sem II — preserved)
│   ├── TargetMode.js         (legacy Sem II — preserved)
│   ├── shared/
│   │   └── GradeChip.js
│   └── charts/
│       └── SimpleCharts.js
├── data/
│   ├── engine.js
│   ├── semesterEngine.js
│   ├── sem3Engine.js
│   ├── colleges/
│   │   ├── index.js          (College configuration registry)
│   │   ├── sitcoe.js
│   │   ├── dypatil.js
│   │   └── other.js
│   └── semesters/
│       ├── index.js
│       └── sem3.js
├── firebase/
│   ├── config.js
│   └── localAuth.js
├── hooks/
│   └── useUserData.js
└── services/
    └── profileService.js
```

---

## Legacy Architecture (Sem II — Preserved)

The current production codebase includes a **Sem II direct flow** that must remain functional until fully migrated:

```
Login → Goal Selection (App home) → MarksMode | TargetMode
```

| Mode | Component | Engine |
|------|-----------|--------|
| `marks` | `MarksMode.js` | `engine.js` (21 credits) |
| `target` | `TargetMode.js` | `engine.js` (21 credits) |

V2 architecture **extends** this; it does not remove it. See `PROJECT_GUARDRAILS.md`.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| UI | React 19, plain CSS |
| Build | Create React App (`react-scripts` 5) |
| Auth | Firebase Auth 12 |
| Database | Cloud Firestore |
| Offline | localStorage |
| Hosting | GitHub Pages |
| Env | `.env.local` with `REACT_APP_FIREBASE_*` |

---

## Deployment Architecture

```
GitHub Repository
       ↓
GitHub Actions (.github/workflows/deploy.yml)
       ↓
npm run build (with Firebase secrets)
       ↓
gh-pages deploy
       ↓
https://SankalpGhasti-dev.github.io/GPA---Engine
```

---

## Future Architecture Extensions

| Extension | Approach |
|-----------|----------|
| Semester 4+ | Add `semesters/sem4.js` + engine instance; register in index |
| React Router | Optional URL-based navigation (`/dashboard`, `/sem/3`) |
| Firestore security rules | Per-user read/write on `users`, `academic`, `marks` |
| Notifications | Firebase Cloud Messaging (future) |
| Mobile app | React Native sharing engine layer (future) |

---

## Related Documents

| Document | Role |
|----------|------|
| `PROJECT_VISION.md` | Strategic direction |
| `PROJECT_GUARDRAILS.md` | Change protection rules |
| `SEMESTER_RULES.md` | Official subject and grading data |
| `DOCUMENTATION/ARCHITECTURE.md` | Legacy technical reference |

---

*GPA Engine V2 — Official Architecture Plan*
