# GPA Engine — Project Vision

> **Document purpose:** Define the long-term vision and direction of GPA Engine for all contributors, maintainers, and AI-assisted development sessions.

---

## What Is GPA Engine?

**GPA Engine** is an **Academic Planning and SGPA/CGPA Optimization Platform**.

It is not a simple GPA calculator. It is a **personal academic operating system** that helps students understand where they stand, where they want to go, and the **minimum actions required** to reach their academic targets.

The platform combines:

- Real-time grade and marks tracking
- SGPA and CGPA prediction
- Reverse engineering of required marks
- Semester-level planning and roadmaps
- Grade optimization insights
- Cloud-synced, personalized academic data

---

## Mission Statement

Empower every student to make **data-driven academic decisions** — turning vague goals like “I want a 9.0 SGPA” into concrete, subject-by-subject action plans.

---

## Target Users

GPA Engine is designed for:

| User Group | Use Case |
|------------|----------|
| **Engineering Students** | Track SGPA/CGPA across semesters; plan marks for theory, lab, and practical components |
| **Diploma Students** | Monitor credit-weighted performance and semester targets |
| **University Students** | Use semester roadmaps, analytics, and grade boundary insights |

Primary initial context: **SITCOE (Sinhgad Institute of Technology and Science)** engineering programs, with architecture designed to scale to other institutions.

---

## Core Value Proposition

| Traditional Approach | GPA Engine Approach |
|---------------------|---------------------|
| “Study harder for Endsem” | “You need 42/50 in ESE for Computer Networks to hold AB” |
| Manual SGPA estimation | Live predicted SGPA from entered components |
| No visibility on grade upgrades | Ranked list: “+2 marks → BB to AB → +0.14 SGPA” |
| Scattered marks in notebooks | Persistent, cloud-synced academic profile |

---

## Long-Term Goals

These are the strategic capabilities GPA Engine must evolve toward:

### Academic Tracking
- **SGPA Prediction** — Live semester GPA from partial or complete marks
- **CGPA Tracking** — Weighted cumulative GPA across completed semesters
- **Progress Tracking** — Visual completion status per subject and semester

### Planning & Optimization
- **Semester Planning** — Full roadmap before any marks are entered
- **Grade Optimization** — Identify highest-ROI grade upgrade opportunities
- **Smart Recommendations** — Actionable insights ranked by credit leverage

### Platform Experience
- **Academic Dashboard** — Central hub for profile, targets, history, and roadmap
- **Academic Analytics** — Charts for SGPA trends, CGPA growth, and subject performance
- **Personalized Academic Insights** — Tailored to branch, semester, and targets

### Infrastructure
- **Multi-Semester Support** — Eight-semester academic roadmap (Years 1–4)
- **Cloud Synchronization** — User-specific data across devices via Firebase
- **Performance Analytics** — Historical and predictive academic visualizations

---

## Future Features

The following capabilities are planned or in active development alignment:

| Feature | Description |
|---------|-------------|
| **Multi-Semester Support** | Semesters 1–8 with year-grouped academic roadmap |
| **Academic Roadmap** | Visual navigation: Year → Semester → Mode → Workspace |
| **Grade Boundary Analysis** | Subjects within reach of next grade, ranked by SGPA impact |
| **Credit Leverage Engine** | Highlight high-credit subjects with maximum SGPA influence |
| **Smart Recommendations** | Context-aware suggestions based on marks, targets, and credits |
| **Cloud Synchronization** | Profile, marks, targets, and preferences stored per user |
| **Performance Analytics** | SGPA trend, CGPA progress, and subject comparison charts |
| **Onboarding & Profile** | One-time setup: branch, college, targets, past semester SGPA |
| **Under-Development Semesters** | Professional placeholder UI for semesters not yet implemented |

---

## Product Identity

| Attribute | Value |
|-----------|-------|
| **Product Name** | GPA Engine |
| **Version Direction** | V2 — Academic Operating System |
| **Experience Standard** | Professional student success platform |
| **Design Language** | Dark theme, premium dashboard, minimal clutter |
| **Platform** | Web (React), mobile-responsive |

---

## User Experience Principles

All future development must align with these UX standards:

1. **Mobile Responsive** — Usable on phones, tablets, and desktops
2. **Fast Loading** — Minimal perceived latency; debounced cloud writes
3. **Dark Theme** — Consistent professional aesthetic
4. **Smooth Animations** — Subtle transitions on cards, navigation, and charts
5. **Minimal Clutter** — Information hierarchy; no overwhelming dashboards
6. **Clear Navigation** — Predictable flow from login to workspace
7. **Persistent User Data** — Never lose marks or profile on refresh
8. **Easy Editing** — Profile and targets editable without re-onboarding
9. **Premium Feel** — Should feel like an academic OS, not a homework calculator

---

## Success Metrics (Vision-Level)

GPA Engine succeeds when a student can:

- [ ] Log in once and see a personalized dashboard immediately
- [ ] Know their current and predicted SGPA/CGPA at a glance
- [ ] Navigate any semester in their academic roadmap
- [ ] Enter partial marks and receive exact remaining requirements
- [ ] Set a target SGPA and receive a full subject-wise strategy
- [ ] Identify the single best grade upgrade opportunity by SGPA impact
- [ ] Return later and find all data restored from the cloud

---

## What GPA Engine Is Not

- Not a replacement for official university result systems
- Not a generic percentage-to-GPA converter without subject structure
- Not a social or collaborative platform (individual student focus)
- Not a one-semester-only tool (multi-semester is the long-term scope)

---

## Document Governance

| Property | Value |
|----------|-------|
| **Owner** | GPA Engine Project |
| **Audience** | Developers, contributors, AI coding agents |
| **Updates** | Revise when strategic direction changes |
| **Related Docs** | `PROJECT_GUARDRAILS.md`, `ARCHITECTURE_PLAN.md`, `SEMESTER_RULES.md` |

---

*GPA Engine — Academic Planning and SGPA/CGPA Optimization Platform*
