# GPA Engine - Project Overview

## 📌 Project Summary

**GPA Engine** is an **Academic Reverse Engineering System** designed for BTECH CS students at SITCOE (Sinhgad Institute of Technology and Science). It's a cloud-enabled web application that helps students calculate, plan, and optimize their Semester GPA (SGPA) with precision and strategic insights.

**Academic Year:** 2025-26 | **Semester:** II | **Institution:** SITCOE, Pune

---

## 🎯 Core Purpose

The GPA Engine solves a fundamental problem: **Students don't know exactly what marks they need to achieve their target SGPA.**

This application provides:
1. **Reverse Engineering Mode** - Enter your marks, get your required performance
2. **Target Planning Mode** - Set a target SGPA, get the exact roadmap
3. **Smart Analytics** - Grade boundaries, risk analysis, credit leverage rankings
4. **Cloud Sync** - Save progress across devices with Firebase authentication

---

## 🏗️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | React 19.2.7 | UI rendering & state management |
| **Backend/Database** | Firebase (Firestore + Auth) | Cloud data storage & authentication |
| **Styling** | CSS3 | Custom responsive styling (35% of codebase) |
| **Build Tool** | Create React App (react-scripts 5.0.1) | Development & production builds |
| **Testing** | Jest & Testing Library | Unit & component testing |
| **Hosting** | GitHub Pages | Static site hosting |

**Language Composition:**
- JavaScript: 63.8%
- CSS: 35%
- HTML: 1.2%

---

## 📂 Project Structure

```
GPA---Engine/
├── public/                    # Static assets
│   ├── index.html            # HTML entry point
│   ├── favicon.ico           # Browser tab icon
│   ├── mr777-logo.png        # Institution branding
│   ├── mr777-footer.png      # Footer branding
│   ├── manifest.json         # PWA manifest
│   └── robots.txt            # SEO settings
│
├── src/                       # Source code
│   ├── App.js               # Main application shell
│   ├── App.css              # Global application styles
│   ├── App.test.js          # App integration tests
│   ├── index.js             # React entry point
│   ├── index.css            # Base styles
│   ├── logo.svg             # React logo
│   ├── reportWebVitals.js   # Performance monitoring
│   ├── setupTests.js        # Jest configuration
│   │
│   ├── components/          # React components
│   │   ├── AuthPage.js      # Authentication UI (Sign in/up/forgot)
│   │   ├── AuthPage.css     # Auth styling
│   │   ├── MarksMode.js     # Reverse engineering mode component
│   │   └── TargetMode.js    # Target planning mode component
│   │
│   ├── data/                # Calculation & logic
│   │   └── engine.js        # Core GPA calculation engine
│   │
│   └── firebase/            # Firebase configuration
│       ├── config.js        # Firebase initialization
│       └── localAuth.js     # Local user fallback
│
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies & scripts
├── package-lock.json       # Locked dependency versions
└── README.md               # This file
```

---

## 🧠 Core Concepts

### Grade System (SITCOE Standard)
```
AA: 90-100% → 10 points
AB: 80-89%  → 9 points
BB: 70-79%  → 8 points
BC: 60-69%  → 7 points
CC: 50-59%  → 6 points
CD: 45-49%  → 5 points
DD: 40-44%  → 4 points
FF: 0-39%   → 0 points
```

### Subject Types & Mark Distribution

#### Theory 100 (8 subjects, max 100 marks)
- CA1 (Continuous Assessment 1): 10 marks
- CA2 (Continuous Assessment 2): 10 marks
- Midsem: 30 marks
- Endsem (Final Exam): 50 marks

#### Theory 50 (3 subjects, max 50 marks → converted to 100 for grading)
- CA1: 5 marks
- CA2: 5 marks
- Midsem: 15 marks
- Endsem: 25 marks

#### Lab (6 subjects, max 50 marks → converted to 100 for grading)
- CA1: 25 marks (practical assessment)
- CA2: 25 marks (practical assessment)

### Key Formulas

**SGPA Calculation:**
```
SGPA = Total Credit Points ÷ Total Credits (21 credits for this semester)

Credit Points (per subject) = Grade Points × Credits
```

**Rounding Rule:**
```
Standard college rounding: 0.49 → down, 0.5 → up
Examples: 89.5% → AA, 79.5% → AB
```

---

## 14 Subjects in Semester II

| Code | Subject | Credits | Type |
|------|---------|---------|------|
| 23CS1201 | Applied Mathematics-II | 4 | Theory100 |
| 23CS1202 | Applied Chemistry | 2 | Theory100 |
| 23CS1203 | Indian Knowledge System | 2 | Theory100 |
| 23CS1204 | Basic Electronics Engineering | 1 | Theory50 |
| 23CS1205 | Basic Civil Engineering | 1 | Theory50 |
| 23CS1206 | Engineering Drawing | 1 | Theory50 |
| 23CS1207 | Python Programming | 2 | Theory100 |
| 23CS1208 | Applied Chemistry Laboratory | 1 | Lab |
| 23CS1209 | Basic Electronics Engg. Laboratory | 1 | Lab |
| 23CS1210 | Basic Civil Engg. Laboratory | 1 | Lab |
| 23CS1211 | Engineering Drawing Laboratory | 1 | Lab |
| 23CS1212 | Workshop Practices | 1 | Lab |
| 23CS1213 | Python Programming Laboratory | 1 | Lab |
| 23CS1214 | Yoga/Sports Practicals/Mini Project | 2 | Lab |

**Total Credits: 21**

---

## ✨ Key Features

### 1. **Reverse Engineering Mode** 🔄
- Enter marks obtained so far (CA1, CA2, Midsem)
- Set target SGPA (e.g., 9.0)
- Engine calculates exact marks needed in remaining components
- Subject-by-subject roadmap with feasibility analysis
- Cloud saves automatically with Firebase

### 2. **Target Planning Mode** 🎯
- Fresh semester planning without any marks
- Set target SGPA first
- Get full breakdown of minimum marks per subject
- Credit leverage ranking (which subjects to focus on)
- Boundary alerts and risk analysis

### 3. **Grade Boundary Analyzer** 📊
- Identifies subjects within 10 marks of next grade
- Ranks by ROI (credit points gained per mark)
- Highlights high-priority upgrade opportunities
- Helps optimize effort allocation

### 4. **Risk Analysis** ⚠️
- Detects subjects vulnerable to grade drop (±3 mark variation)
- Shows SGPA impact of potential failures
- Ranks risks by severity (HIGH/MEDIUM/LOW)
- Helps identify risky subjects early

### 5. **Control Index Engine** 💪
- Shows what % of marks you control (CA1+CA2)
- What % is partial (Midsem)
- What % depends only on exam (Endsem)
- Helps students understand their leverage

### 6. **Credit Leverage Ranking** ⚡
- Ranks subjects by credit value
- Shows SGPA impact per grade point gained
- Identifies which subjects to prioritize
- Example: +1 GP in 4-credit subject = +0.19 SGPA

### 7. **Cloud Sync & Authentication** ☁️
- Google Sign-In for quick setup
- Email/Password registration option
- Password strength meter & reset functionality
- Automatic Firestore sync (debounced)
- Local fallback (continue without account)

### 8. **Target Grade Calculator** 🎓
- For each subject, select target grade
- Engine shows what's needed from remaining components
- Live feasibility checks
- All grade options displayed with required marks

---

## 🔐 Authentication Flows

### Firebase Configured
- Google Sign-In via OAuth
- Email/Password sign-up
- Password reset via email
- User profiles in Firestore (name, email, rollNo)
- Cloud data persistence

### Firebase Not Configured
- "Continue Locally" option
- localStorage-based persistence
- No cloud sync, but full functionality
- Marks lost on browser clear

---

## 💾 Data Structure

### Firebase Collections

**Collection: `users`**
```javascript
{
  uid: "firebaseUID",
  name: "Student Name",
  email: "student@example.com",
  rollNo: "",
  createdAt: timestamp
}
```

**Collection: `marks`**
```javascript
{
  uid: "firebaseUID",
  gpa_marks: {
    "23CS1201": { ca1: 9, ca2: 8, mse: 24, endsem: 42 },
    "23CS1202": { ca1: 8, ca2: 7, mse: 20, endsem: 38 },
    // ... more subjects
  },
  gpa_target: "9.0",
  updatedAt: timestamp
}
```

### Local Storage Keys
- `gpa-marks` - JSON stringified marks object
- `gpa-target` - Target SGPA string

---

## 🚀 User Workflows

### Workflow 1: Student with Partial Marks
1. Sign in → MarksMode
2. Enter CA1, CA2, Midsem marks for all subjects
3. Set target SGPA (e.g., 9.0)
4. View Dashboard → see current SGPA from completed components
5. View Required Marks → exact breakdown per subject
6. Check Boundaries → identify easy grade upgrades
7. Check Risks → avoid vulnerable subjects

### Workflow 2: Fresh Semester Planning
1. Sign in → TargetMode
2. Enter target SGPA (e.g., 8.5)
3. View full marks roadmap
4. Study Credit Leverage Ranking
5. Plan which subjects to prioritize
6. Note minimum marks per component

### Workflow 3: Grade Upgrade Hunt
1. MarksMode → check Dashboard
2. Jump to Boundaries tab
3. See ranked list of near-miss subjects
4. Focus on high ROI subjects
5. Use Target Grade Calculator to plan strategy

---

## 🎨 UI Components Architecture

```
App.js (Main Container)
├── AuthPage (Conditional)
│   ├── Auth Mode Tabs (Sign In / Sign Up / Forgot)
│   ├── Google OAuth Button
│   ├── Email/Password Form
│   ├── Password Strength Meter
│   └── Branding Panel
│
└── Main App (When authenticated)
    ├── Header
    │   ├── User Avatar & Info
    │   ├── Sign Out Button
    │   └── Back Button (mode-aware)
    │
    ├── Home (Mode Selection)
    │   ├── MarksMode Card
    │   └── TargetMode Card
    │
    ├── MarksMode Component
    │   ├── Target SGPA Input
    │   ├── Tabs (Subjects, Dashboard, Boundaries, Risks)
    │   ├── Subject Cards (Expandable)
    │   │   ├── Mark Entry Grid
    │   │   ├── Result Display
    │   │   ├── Grade Calculator
    │   │   └── All Grade Options
    │   ├── Dashboard Grid
    │   │   ├── SGPA Overview
    │   │   ├── Scenarios Reference
    │   │   ├── Control Index
    │   │   └── Credit Leverage
    │   ├── Boundaries List
    │   └── Risks List
    │
    ├── TargetMode Component
    │   └── (Planning view)
    │
    └── Footer
```

---

## 🧮 Calculation Engine (`src/data/engine.js`)

The heart of the application contains:

- **Grade System** - SITCOE grade boundaries & point mappings
- **Subject Definitions** - All 14 subjects with credits & types
- **Component Management** - Mark limits per component type
- **Subject Computation** - Total, percentage, grade, credit points per subject
- **SGPA Calculator** - Aggregate GPA from complete subjects
- **Reverse Engineering** - Target-to-marks translator
- **Boundary Analysis** - Grade upgrade opportunities
- **Credit Leverage Engine** - Subject ranking by value
- **Control Index** - Mark control breakdown
- **Risk Analysis** - ±3 mark variation impact
- **Target Calculator** - Per-subject goal breakdown
- **Scenario Engine** - "What if all AA/AB/BB..." planning

---

## 📱 Responsive Design

- **Desktop** (1200px+): Full dashboard grid layout
- **Tablet** (768px-1199px): Stacked cards, touch-friendly
- **Mobile** (<768px): Single-column flow, optimized forms

---

## 🔄 Data Flow

```
User Input (Marks)
    ↓
localStorage + Firestore (debounced 1.5s)
    ↓
computeSubject() for each subject
    ↓
subjectResults { total, pct, grade, creditPoints }
    ↓
calcSGPA() from complete subjects
    ↓
reverseEngineer() / gradeBoundaryAnalysis() / riskAnalysis()
    ↓
UI Render (Dashboard, Boundaries, Risks tabs)
```

---

## 🛠️ Development Setup

See [INSTALLATION.md](./INSTALLATION.md) for complete setup guide.

**Quick Start:**
```bash
npm install
npm start          # Dev server at http://localhost:3000
npm test           # Run tests
npm run build      # Production build
npm run deploy     # Deploy to GitHub Pages
```

---

## 📝 Configuration

See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for Firebase setup and .env configuration details.

---

## 🐛 Known Limitations

1. **Exam marks required** - Can't see full SGPA until Endsem is entered
2. **Manual recalculation** - All calculation happens client-side (by design for privacy)
3. **No historical tracking** - Only current semester data
4. **No multi-semester CGPA** - SGPA only, not cumulative

---

## 🔮 Future Enhancements

- [ ] CGPA (cumulative) calculation
- [ ] Historical semester tracking
- [ ] Study time optimization
- [ ] Peer comparison (anonymized)
- [ ] SMS/Email alerts for grade boundaries
- [ ] Mobile app (React Native)

---

## 📄 License

Proprietary - SITCOE Academic Project (AY 2025-26)

---

## 👤 Author

**Sankalp Ghasti** - Lead Developer
- GitHub: @SankalpGhasti-dev
- SITCOE BTECH CS | Semester II | 2025-26

---

## 🤝 Contributing

For now, this is a student project. Feedback welcome via GitHub Issues.

---

*Last Updated: June 2026*
