# GPA Engine - Academic Reverse Engineering System

<div align="center">

![GPA Engine](https://img.shields.io/badge/GPA%20Engine-v0.1.0-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.2.7-61dafb?style=flat-square&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-12.14.0-FFA500?style=flat-square&logo=firebase)
![JavaScript](https://img.shields.io/badge/JavaScript-63.8%25-F7DF1E?style=flat-square&logo=javascript)
![License](https://img.shields.io/badge/License-Academic%20Project-green?style=flat-square)

**Smart GPA planning for SITCOE BTECH CS Semester II students**

[🚀 Live Demo](https://SankalpGhasti-dev.github.io/GPA---Engine) • [📚 Documentation](./DOCUMENTATION/) • [🐛 Issues](https://github.com/SankalpGhasti-dev/GPA---Engine/issues)

</div>

---

## 🎯 What is GPA Engine?

GPA Engine is a web-based application that solves a critical problem for engineering students: **"What exactly do I need to score to achieve my target SGPA or CGPA?"**

Instead of guessing, students get a precise, subject-by-subject breakdown of minimum marks required. It's like having a personal academic advisor in your browser. With our **V2 Architecture**, GPA Engine is evolving into a personalized, multi-college academic operating system.

### Real-World Example

**Scenario:** You've completed CA1, CA2, and Midsem. You want a 9.0 SGPA.
- ❌ Without GPA Engine: "I need to do well in Endsem"
- ✅ With GPA Engine: "You need 42/50 in Applied Math Endsem, 38/50 in Chemistry, etc."

---

## ✨ Key Features

### 1. **Personalized Academic Profile** 👤
- 4-step Onboarding Wizard for first-time users
- Set college, branch, current semester, and academic goals
- Centralized Dashboard tailored to your current academic standing

### 2. **Multi-College Support** 🏫
- Native configurations for SITCOE (Ichalkaranji) and D.Y. Patil (Kolhapur)
- "Other College" fallback for any university
- Custom credit-weighted CGPA calculations per college

### 3. **Reverse Engineering Mode** 🔄
Enter your current marks → Get exact Endsem requirements
- Subject-by-subject breakdown
- Feasibility analysis (achievable/not achievable)
- Auto-save to cloud

### 4. **Target Planning Mode** 🎯
Set target SGPA → Get full marks roadmap for fresh semester
- Component-wise minimum marks
- Credit leverage ranking (which subjects matter most)
- All grade options displayed

### 5. **Grade Boundary Analyzer** 📊
Identifies subjects within reach of next grade
- Ranked by ROI (credit points per mark)
- Highlights quick wins
- Example: "Just 3 marks away from AA in Math"

### 6. **Risk Analysis** ⚠️
Detects vulnerable grades (±3 mark variation impact)
- SGPA loss if grade drops
- Helps avoid risky subjects
- Ranked by severity

### 7. **Credit Leverage Engine** ⚡
Shows which subjects have biggest SGPA impact
- 4-credit subjects worth 0.19 SGPA per GP
- Visual ranking
- Helps optimize effort

### 8. **Smart Sync** ☁️
- Google Sign-In for quick setup
- Auto-save to cloud (Firestore) with 1.2s debounce
- Marks accessible across devices
- Local fallback (continue offline)

---

## 🏗️ Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Frontend** | React | 19.2.7 |
| **Backend** | Firebase Firestore | Latest |
| **Auth** | Firebase Authentication | Latest |
| **Build** | Create React App | 5.0.1 |
| **Styling** | CSS3 | - |
| **Testing** | Jest & Testing Library | Latest |
| **Hosting** | GitHub Pages | - |

**Language Breakdown:**
- JavaScript: 63.8%
- CSS: 35%
- HTML: 1.2%

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm 8+
- Git
- Modern web browser

### Installation (2 minutes)

```bash
# Clone repository
git clone https://github.com/SankalpGhasti-dev/GPA---Engine.git
cd GPA---Engine

# Install dependencies
npm install

# Start development server
npm start
```

The app opens at http://localhost:3000

### Try Without Firebase
1. Click "Continue locally (no cloud sync)"
2. Start entering marks and planning
3. Everything works offline!

### Setup Firebase (Optional, for cloud sync)
See [INSTALLATION.md](./DOCUMENTATION/INSTALLATION.md) for complete Firebase setup guide.

---

## 📚 Documentation

Comprehensive documentation included:

| Document | Purpose |
|----------|---------|
| [PROJECT_OVERVIEW.md](./DOCUMENTATION/PROJECT_OVERVIEW.md) | What the app does, why it matters, how to use it |
| [ARCHITECTURE.md](./DOCUMENTATION/ARCHITECTURE.md) | Technical architecture, data flows, algorithms |
| [INSTALLATION.md](./DOCUMENTATION/INSTALLATION.md) | Setup guide, Firebase config, deployment |

**Quick Navigation:**
- 🎯 First time? → [PROJECT_OVERVIEW.md](./DOCUMENTATION/PROJECT_OVERVIEW.md)
- 👨‍💻 Developer? → [ARCHITECTURE.md](./DOCUMENTATION/ARCHITECTURE.md)
- 🔧 Setting up? → [INSTALLATION.md](./DOCUMENTATION/INSTALLATION.md)

---

## 📂 Project Structure

```
GPA---Engine/
├── DOCUMENTATION/
│   ├── PROJECT_OVERVIEW.md    # Features & concepts
│   ├── ARCHITECTURE.md         # Technical deep dive
│   └── INSTALLATION.md         # Setup & deployment
│
├── src/
│   ├── App.js                  # Main app component
│   ├── components/
│   │   ├── AuthPage.js         # Login/signup UI
│   │   ├── Onboarding.js       # First-time profile setup
│   │   ├── Dashboard.js        # V2 Personalized Dashboard
│   │   ├── ProfileModal.js     # Edit Profile functionality
│   │   ├── MarksMode.js        # Reverse engineering
│   │   └── TargetMode.js       # Target planning
│   ├── data/
│   │   ├── engine.js           # Core calculation engine
│   │   └── colleges/           # College-specific credit configs
│   ├── firebase/
│   │   ├── config.js           # Firebase setup
│   │   └── localAuth.js        # Local fallback
│   └── hooks/
│       └── useUserData.js      # React hook for central state
│
├── public/
│   ├── index.html              # HTML entry
│   └── mr777-*.png             # Institution branding
│
├── package.json                # Dependencies
└── README.md                   # This file
```

---

## 🎓 Academic Context

**Target Users:** SITCOE BTECH CS Students (Semester II)

**Academic Year:** 2025-26 (First Year, Second Semester)

**Curriculum:**
- 14 Subjects
- 21 Total Credits
- Theory (100 & 50 marks) + Lab subjects
- SITCOE grading system (AA/AB/BB/BC/CC/CD/DD/FF)

**Why This App Exists:**
- Students struggle to understand mark-to-SGPA conversion
- Manual calculations are error-prone
- No tool bridges mark entry → grade planning
- Cloud sync enables planning across devices

---

## 🧮 How Calculations Work

### SGPA Formula
```
SGPA = Total Credit Points ÷ Total Credits (21)

Where:
  Credit Points = Grade Points × Subject Credits
  Grade Points = 10 (AA) to 0 (FF) based on percentage
```

### Reverse Engineering Algorithm
```
Given: Target SGPA = 9.0, Current marks for some subjects

1. Calculate locked credit points from complete subjects
2. Calculate needed credit points to reach target
3. Calculate average GP needed from remaining subjects
4. Per subject: translate GP to minimum marks required
5. Break down into components (CA1, CA2, MSE, Endsem)
6. Return detailed roadmap
```

### Grade Boundaries (SITCOE System)
```
90-100% → AA (10 points)
80-89%  → AB (9 points)
70-79%  → BB (8 points)
60-69%  → BC (7 points)
50-59%  → CC (6 points)
45-49%  → CD (5 points)
40-44%  → DD (4 points)
0-39%   → FF (0 points)
```

---

## 🔐 Authentication & Privacy

### Sign-In Options
1. **Google OAuth** - 1-click sign-up
2. **Email/Password** - Traditional registration
3. **Local Mode** - No account needed (offline)

### Data Security
- Firebase Authentication for user verification
- Firestore Security Rules restrict data access
- Each user sees only their own marks
- LocalStorage as offline fallback
- No data shared or sold

### What Gets Stored
- Name, email, password hash (if email/password signup)
- Marks entered (CA1, CA2, Midsem, Endsem per subject)
- Target SGPA
- Last updated timestamp

---

## 💾 Data Persistence

### Cloud (Firebase Firestore)
- Auto-save 1.5s after mark change
- Syncs across devices
- Persistent across browser sessions

### Local (Browser Storage)
- Immediate save on mark entry
- Works offline
- Lost if browser data cleared

### Sync Status
- ⟳ Saving… (1.5s delay)
- ✓ Saved (success, 2s display)
- ✗ Sync error (check connection)

---

## 🚀 Deployment

### GitHub Pages (Recommended)
```bash
npm run build
npm run deploy
```
Automatic HTTPS, free hosting

### Firebase Hosting
```bash
firebase deploy
```
Custom domain support, Realtime features

### Vercel
```bash
git push
# Auto-deploys on commit
```
Serverless functions support

---

## 🛠️ Development

### Available Commands
```bash
npm start          # Dev server (http://localhost:3000)
npm test           # Run tests
npm run build      # Production build
npm run deploy     # Deploy to GitHub Pages
npm run eject      # Advanced: Eject from CRA (not reversible)
```

### Making Changes
1. Create branch: `git checkout -b feature/my-feature`
2. Make changes and test: `npm start`
3. Commit: `git commit -m "Add feature"`
4. Push: `git push origin feature/my-feature`
5. Create Pull Request on GitHub

### Code Quality
- Functional components with React Hooks
- Pure functions (no side effects)
- Memoization for performance
- Component-level CSS
- Testing with Jest/Testing Library

---

## 📈 Current Project Status

**Phase 1: Student Profile, Multi-College Foundation & Academic History — COMPLETED**
- GPA Engine has successfully migrated from a single-semester calculator to a personalized, multi-college academic platform.

### ✅ Completed Phases
1. **Phase 1:** Centralized `useUserData` state, Onboarding Wizard, Edit Profile Modal, Credit-Weighted CGPA Engine, and Multi-College Configuration (SITCOE, D.Y. Patil).

### 🚀 Upcoming Roadmap
- **Phase 2:** Semester 3 Workspace Implementation (New Grade System, Planning Mode).
- **Phase 3:** Analytics Dashboard (Historical CGPA trends, visualizations).
- **Phase 4:** Mobile App transition / PWA enhancements.

## 🐛 Known Limitations

- ⚠️ Can't see full SGPA until Endsem entered (incomplete data)
- ⚠️ Manual calculation (by design for privacy)
- ⚠️ LocalStorage cleared on browser data clear

---

## 🤝 Contributing

This is an academic project. Feedback and suggestions welcome!

**To contribute:**
1. Fork the repository
2. Create a feature branch
3. Submit a pull request
4. Include detailed description of changes

**Reporting Issues:**
1. Check existing issues first
2. Provide detailed reproduction steps
3. Include browser/OS info
4. Attach screenshots if UI-related

---

## 📝 Files Reference

### Core Engine
- **`src/data/engine.js`** (14.4 KB)
  - All calculation algorithms
  - GRADE_SYSTEM, SUBJECTS definitions
  - reverseEngineer(), gradeBoundaryAnalysis(), etc.

### Components
- **`src/App.js`** (5.5 KB)
  - Main app container
  - Auth state management
  - Mode switching (home, marks, target)

- **`src/components/AuthPage.js`** (25.9 KB)
  - Sign in/up/forgot password flows
  - Google OAuth integration
  - Firebase error handling

- **`src/components/MarksMode.js`** (25.9 KB)
  - Marks entry interface
  - Multi-tab dashboard (subjects, dashboard, boundaries, risks)
  - Real-time calculations
  - Cloud sync

### Styling
- **`src/App.css`** (31.2 KB) - Global layout
- **`src/components/AuthPage.css`** (17.5 KB) - Auth styling
- Responsive design (mobile, tablet, desktop)

---

## 📊 Usage Statistics

### Typical Session
1. **Entry:** 2 mins - Sign in, set target SGPA
2. **Input:** 5 mins - Enter marks for all subjects
3. **Analysis:** 3 mins - Check Dashboard, Boundaries, Risks
4. **Planning:** 5 mins - Note Endsem requirements
5. **Exit:** Auto-saved to cloud

### Performance
- Initial load: ~2.5s
- Calculation: <50ms (all 14 subjects)
- Cloud sync: 1.5s debounce

---

## 🎓 Learning Resources

This project showcases:
- React Hooks (useState, useEffect, useMemo)
- Firebase Integration (Auth, Firestore)
- Responsive CSS Design
- Real-time data sync
- Complex calculations
- State management
- Performance optimization

**Great for learning:**
- Modern JavaScript (ES6+)
- React patterns
- Cloud backend integration
- UI/UX design

---

## 📄 License

**Academic Project** - SITCOE BTECH CS (AY 2025-26)

For educational and institutional use only. Not for commercial purposes.

---

## 👤 Creator

**Sankalp Ghasti**
- GitHub: [@SankalpGhasti-dev](https://github.com/SankalpGhasti-dev)
- Institution: SITCOE, Pune
- Program: BTECH Computer Science
- Semester: II (2025-26)

---

## 🙏 Acknowledgments

- **SITCOE** - Academic institution
- **Firebase** - Backend infrastructure
- **React** - Frontend framework
- **Create React App** - Build tooling

---

## 📞 Support & Feedback

- 🐛 **Report bugs:** [GitHub Issues](https://github.com/SankalpGhasti-dev/GPA---Engine/issues)
- 💡 **Suggestions:** Create an issue with tag `enhancement`
- 📧 **Contact:** Through GitHub profile

---

<div align="center">

**Made with ❤️ for SITCOE BTECH CS Students**

⭐ Star this repo if it helped you plan your semester!

[View on GitHub](https://github.com/SankalpGhasti-dev/GPA---Engine) • [Live Demo](https://SankalpGhasti-dev.github.io/GPA---Engine) • [View Docs](./DOCUMENTATION/)

</div>
