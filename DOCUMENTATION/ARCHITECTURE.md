# GPA Engine - Architecture & Workflow

## 🏛️ Application Architecture

### High-Level Structure

```
┌─────────────────────────────────────────────────┐
│              PRESENTATION LAYER                  │
│  React Components (AuthPage, MarksMode, etc.)   │
│  CSS Styling (35% of codebase)                  │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│              STATE & LOGIC LAYER                 │
│  App.js (auth state, mode switching)            │
│  Component-level state (marks, tabs)            │
│  Custom hooks & useMemo for memoization         │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│           CALCULATION ENGINE LAYER               │
│  src/data/engine.js (all algorithms)            │
│  - Grade system, subject definitions            │
│  - SGPA calculation                             │
│  - Reverse engineering                          │
│  - Boundary & risk analysis                     │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│            PERSISTENCE LAYER                     │
│  Firebase Authentication (users)                │
│  Firestore (marks data)                         │
│  localStorage (offline fallback)                │
└─────────────────────────────────────────────────┘
```

---

## 🔄 Component Hierarchy

```
App.js (Root)
│
├─ User Undefined (Loading)
│  └─ Spinner + "Loading GPA Engine..."
│
├─ User Null (Not authenticated)
│  └─ AuthPage
│     ├─ Auth Brand Panel (left)
│     │  ├─ Logo & tagline
│     │  ├─ Features list (4 items)
│     │  └─ SGPA simulator card
│     │
│     └─ Auth Form Panel (right)
│        ├─ Sign In Tab
│        ├─ Sign Up Tab
│        ├─ Forgot Password Tab
│        └─ Google OAuth button
│
└─ User Authenticated
   ├─ App Header
   │  ├─ Logo & title (SEM II, BTECH CS)
   │  ├─ Mode selector (Back button)
   │  └─ User menu
   │     ├─ Avatar (photo or initials)
   │     ├─ Name & email
   │     └─ Sign Out button
   │
   ├─ Mode: null (Home)
   │  └─ Mode Selection Cards
   │     ├─ 📝 Marks Mode (Reverse Engineer)
   │     └─ 🎯 Target Mode (Full Roadmap)
   │
   ├─ Mode: "marks" (MarksMode Component)
   │  ├─ Target SGPA input bar
   │  ├─ Feasibility indicator
   │  │
   │  ├─ Tab Navigation
   │  │  ├─ Subjects (Marks entry)
   │  │  ├─ Dashboard (Analytics)
   │  │  ├─ Boundaries (Grade upgrades)
   │  │  └─ Risks (Danger zones)
   │  │
   │  ├─ Tab: Subjects
   │  │  ├─ Progress bar
   │  │  ├─ Stats (complete/partial/empty)
   │  │  ├─ Clear All button
   │  │  │
   │  │  └─ Subject Cards (14 total)
   │  │     ├─ Header (collapsible)
   │  │     │  ├─ Code, name, credits, type
   │  │     │  ├─ Current %age & grade
   │  │     │  └─ Credit points
   │  │     │
   │  │     └─ Body (expanded)
   │  │        ├─ Component input grid (CA1, CA2, MSE, Endsem)
   │  │        ├─ Result display
   │  │        └─ Target Grade Calculator
   │  │           ├─ Grade dropdown
   │  │           ├─ Feasibility message
   │  │           └─ All grade options grid
   │  │
   │  ├─ Tab: Dashboard
   │  │  ├─ SGPA Overview (4 metrics)
   │  │  ├─ Scenario Reference (All AA/AB/BB/BC/CC)
   │  │  ├─ Control Index (Stacked bar + legend)
   │  │  ├─ Credit Leverage Ranking (14 subjects)
   │  │  └─ Required Marks (reverse engineering results)
   │  │
   │  ├─ Tab: Boundaries
   │  │  └─ Boundary Cards (ROI-ranked)
   │  │     ├─ Subject name & metadata
   │  │     ├─ Current grade → Next grade
   │  │     ├─ Gap, GP gain, CP gain, SGPA gain
   │  │     └─ ROI badge (🔥 HIGH / ⚡ MEDIUM / 📌 LOW)
   │  │
   │  └─ Tab: Risks
   │     └─ Risk Cards (ranked by impact)
   │        ├─ Risk level badge (HIGH/MEDIUM/LOW)
   │        ├─ Current grade → Could drop to
   │        └─ CP loss, SGPA loss
   │
   ├─ Mode: "target" (TargetMode Component)
   │  └─ (Fresh semester planning view)
   │
   └─ Footer
      └─ Copyright & institution info
```

---

## 🔌 Data Flow Architecture

### 1. User Marks Input
```
User types in CA1 field
    ↓
setComponent() in MarksMode
    ↓
setMarks() updates React state
    ↓
Triggers useEffect (marks dependency)
```

### 2. Calculation Pipeline
```
marks object (from state)
    ↓
computeSubject() for each of 14 subjects
    ↓
subjectResults object
    ├─ total, maxEntered, pct, grade, creditPoints
    ├─ allEntered (boolean)
    └─ partial (boolean)
    ↓
useMemo memoizes results (pure computation)
    ↓
calcSGPA() from complete subjects
    ↓
reverseEngineer() if target SGPA set
    ├─ targetCP calculation
    ├─ neededCP calculation
    ├─ avgGPNeeded per remaining subject
    ├─ subjectRequirements array
    └─ feasible flag
    ↓
gradeBoundaryAnalysis() & riskAnalysis()
    ↓
UI renders all tabs with calculated data
```

### 3. Persistence Pipeline
```
marks state changes
    ↓
useEffect triggers
    ↓
localStorage.setItem() (immediate)
    ↓
clearTimeout(debounceRef) (cancel old save)
    ↓
setTimeout(1500ms) for Firestore save
    ↓
setDoc(db, "marks", {...}, {merge: true})
    ↓
setSyncStatus("saved")
    ↓
setTimeout(2000ms) revert to "idle"
```

---

## 📊 State Management Strategy

### App-Level State (App.js)
```javascript
const [mode, setMode] = useState(null);           // null | "marks" | "target"
const [user, setUser] = useState(undefined);      // undefined | null | userObj
// Uses Firebase onAuthStateChanged() for persistence
```

### MarksMode-Level State (MarksMode.js)
```javascript
const [marks, setMarks] = useState({...});        // Subject → components
const [targetSGPA, setTargetSGPA] = useState(""); // String (validates in reverseEngineer)
const [expandedSubject, setExpandedSubject] = useState(null);
const [targetGradeMap, setTargetGradeMap] = useState({});
const [activeTab, setActiveTab] = useState("subjects");
const [syncStatus, setSyncStatus] = useState("idle");
```

### Memoized Computations (useMemo)
```javascript
// Expensive calculations cached until dependencies change
const subjectResults = useMemo(() => {...}, [marks]);
const liveSGPA = useMemo(() => {...}, [subjectResults]);
const reverseResult = useMemo(() => {...}, [targetSGPA, subjectResults]);
const boundaries = useMemo(() => {...}, [subjectResults]);
const risks = useMemo(() => {...}, [subjectResults]);
```

---

## 🔐 Authentication Flow

### Sign-Up Flow
```
User clicks "Sign Up" tab
    ↓
Fills: name, email, password, confirm password
    ↓
validate() checks:
    ├─ Name not empty
    ├─ Email format valid
    ├─ Password ≥ 8 chars
    └─ Passwords match
    ↓
createUserWithEmailAndPassword(auth, email, password)
    ↓
updateProfile(user, {displayName: name})
    ↓
createUserDoc(user, name) → Firestore users collection
    ↓
onAuth(user) → setUser(user) in App.js
    ↓
App re-renders, shows main app
```

### Sign-In Flow
```
User enters email & password
    ↓
signInWithEmailAndPassword(auth, email, password)
    ↓
onAuth(user) → setUser(user)
    ↓
FireStore marks collection loaded on MarksMode mount
```

### Google OAuth Flow
```
User clicks "Continue with Google"
    ↓
signInWithPopup(auth, googleProvider)
    ↓
Creates user if first time
    ↓
createUserDoc(user, user.displayName)
    ↓
Same flow as email/password from here
```

### Sign Out Flow
```
User clicks sign out button
    ↓
If local user: just setUser(null)
    ↓
If Firebase user: signOut(auth)
    ↓
setUser(null), setMode(null)
    ↓
App shows AuthPage again
```

---

## 💾 Data Persistence Strategy

### Primary: Firestore (Cloud)
- **When:** Auto-saved 1.5s after mark change
- **What:** `{gpa_marks, gpa_target, updatedAt}`
- **Benefit:** Syncs across devices, persistent
- **Fallback:** Uses localStorage if Firestore fails

### Secondary: localStorage (Browser)
- **When:** Immediately on mark change (not debounced)
- **What:** Same structure as Firestore
- **Benefit:** Instant access, offline support
- **Risk:** Lost if browser data cleared

### Sync Status Indicator
```
"idle"    → Normal state
  ↓ (user types)
"saving"  → 1.5s debounce period (badge shows ⟳ Saving…)
  ↓ (Firestore responds)
"saved"   → Success (badge shows ✓ Saved for 2s)
  ↓ (timeout)
"idle"    → Back to normal

"error"   → If Firestore fails (badge shows ✗ Sync error)
```

---

## 🧮 Core Algorithm: Reverse Engineering

### Input
- `targetSGPA`: e.g., 9.0
- `lockedSubjects`: subjects with all marks entered
  ```
  { "23CS1201": {gradeInfo, creditPoints}, ... }
  ```

### Calculation Steps

**Step 1:** Identify locked subjects
```javascript
lockedCP = sum of creditPoints from locked subjects
lockedCredits = sum of credits from locked subjects
```

**Step 2:** Identify remaining subjects
```javascript
remainingSubjects = all subjects NOT in locked
remainingCredits = sum of credits from remaining
```

**Step 3:** Calculate required credit points
```javascript
targetCP = targetSGPA × TOTAL_CREDITS (21)
neededCP = targetCP - lockedCP
```

**Step 4:** Calculate average GP needed
```javascript
avgGPNeeded = neededCP ÷ remainingCredits
// Must be ≤ 10 and ≥ 0 to be feasible
```

**Step 5:** Per-subject breakdown
```
For each remaining subject:
  ├─ Find recommended grade (minimum GP ≥ avgGPNeeded)
  ├─ Calculate min marks for that grade
  ├─ Break down into components (CA1, CA2, MSE, Endsem)
  ├─ Show all grade options
  └─ Calculate credit points per grade
```

### Output
```javascript
{
  targetCP: 189.0,
  lockedCP: 45.5,
  neededCP: 143.5,
  remainingCredits: 15,
  avgGPNeeded: 9.57,
  feasible: false,  // 9.57 > 10 is unrealistic
  subjectRequirements: [
    {
      code: "23CS1201",
      name: "Applied Mathematics-II",
      credits: 4,
      recommendedGrade: {grade: "AA", points: 10},
      minMarksNeeded: 90,
      compBreakdown: [{label: "CA1", minNeeded: 9, ...}, ...],
      gradeOptions: [...]
    },
    ...
  ]
}
```

---

## 📈 Boundary Analysis Algorithm

### For Each Subject with Partial Marks
```
currentGrade = getGradeFromPct(percentage)
currentMarks = total marks entered

Next grade up (e.g., BB → AB):
  ├─ Find next grade in system
  ├─ Calculate marks needed for next grade
  ├─ gap = marks needed - current marks
  ├─ If 0 < gap ≤ 10:
  │   ├─ Calculate GP gain = nextGradePoints - currentGradePoints
  │   ├─ Calculate CP gain = GP gain × credits
  │   ├─ Calculate SGPA gain = CP gain ÷ TOTAL_CREDITS
  │   ├─ Calculate priority = CP gain / gap (ROI)
  │   └─ Add to opportunities list
  └─ Else: skip (too far or already highest)

Sort opportunities by ROI (descending)
Return top opportunities
```

---

## ⚠️ Risk Analysis Algorithm

### Variation Window: ±3 marks

```
For each subject with marks:
  ├─ currentPct = calculated percentage
  ├─ currentGrade = getGradeFromPct(currentPct)
  │
  ├─ worstCase = currentPct - 3 marks (as %)
  ├─ worstGrade = getGradeFromPct(worstPct)
  │
  ├─ If worstGrade.points < currentGrade.points:
  │   ├─ cpLoss = (currentGrade.points - worstGrade.points) × credits
  │   ├─ sgpaLoss = cpLoss ÷ TOTAL_CREDITS
  │   ├─ level = "HIGH" if cpLoss ≥ 4
  │   │         "MEDIUM" if cpLoss ≥ 2
  │   │         "LOW" otherwise
  │   └─ Add to risks list
  └─ Else: No risk (grade won't drop)

Sort risks by cpLoss (descending)
Return sorted risks
```

---

## 🎯 Target Grade Calculator (Per Subject)

### Given: subject, entered components, target grade

```
targetG = GRADE_SYSTEM[targetGrade]
minTotal = ceil((targetG.min / 100) * maxMarks)

For each component:
  ├─ If entered: add to secured
  └─ If not entered: add to pending

needed = minTotal - secured

Check feasibility:
  ├─ feasible = (needed ≤ pendingMax AND needed ≥ 0)
  ├─ alreadyAchieved = (secured ≥ minTotal)
  └─ Return detailed breakdown
```

---

## 🌐 Component Communication Pattern

### Props Flow (Top → Down)
```
App.js
  ├─ passes user → MarksMode
  └─ passes onBack → MarksMode

MarksMode.js
  └─ No child components (monolithic)
```

### State Updates (Bottom → Up)
```
User interaction in MarksMode
  ↓
setState() in MarksMode
  ↓
Triggers recalculation (useMemo)
  ↓
UI re-renders
  ↓
Firestore updates (debounced)
```

### No Redux/Context
- Simple app, state kept local where possible
- Auth state managed by Firebase
- Component state sufficient for functionality

---

## 🎨 Styling Architecture

### CSS Organization
- **App.css** - Global layout & mode cards
- **AuthPage.css** - Authentication UI styling
- **Component-level** - Each component has its own CSS imports

### Design System
- **Colors:**
  - Grade colors (AA=#1b4332 green, AB=#2d6a4f, ..., FF=#6c1111 red)
  - Success/error badges
  - Neutral grays

- **Typography:**
  - Headings: System font stack
  - Body: Inter/system fonts

- **Spacing:**
  - Consistent gap/padding system
  - Grid-based layout (CSS Grid)

- **Responsive:**
  - Mobile-first approach
  - Breakpoints: 768px, 1200px
  - Flexbox for navigation

---

## ⚡ Performance Optimizations

1. **useMemo** - Calculations memoized, skip if dependencies unchanged
2. **Debounced Firestore sync** - Prevents excessive writes (1.5s delay)
3. **Lazy Loading** - Subjects expanded on-demand
4. **Conditional Rendering** - Tabs/modals render only when active
5. **Pure Functions** - Engine.js functions don't have side effects

---

*This architecture scales to multiple semesters and could support CGPA calculation with minimal changes.*
