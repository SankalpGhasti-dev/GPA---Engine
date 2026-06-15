# GPA Engine — Semester Rules

> **Document purpose:** Store official semester structures, marking schemes, credit totals, and grading rules. This is the **source of truth** for all calculation engines. Code must match this document — not the other way around.

---

## Global Grade System (SITCOE Official)

All semesters use the same grade point mapping. Percentages are **rounded first** using `collegeRound` (≥0.5 rounds up), then mapped to grades.

| Percentage (rounded) | Grade | Grade Points |
|---------------------|-------|--------------|
| 90 – 100 | AA | 10 |
| 80 – 89 | AB | 9 |
| 70 – 79 | BB | 8 |
| 60 – 69 | BC | 7 |
| 50 – 59 | CC | 6 |
| 45 – 49 | CD | 5 |
| 40 – 44 | DD | 4 |
| Below 40 | FF (Fail) | 0 |

### Rounding Rule

```
collegeRound(value) = Math.floor(value + 0.5)
```

**Examples:**
- 89.49% → 89 → AB
- 89.50% → 90 → AA
- 8.49 SGPA → 8
- 8.50 SGPA → 9

---

## Global Calculation Rules

### Subject Percentage

```
Percentage = (Total Marks Obtained ÷ Total Max Marks) × 100
```

Total marks is the **full subject maximum**, not the sum of entered components only.

### Credit Points

```
Credit Points = Grade Points × Subject Credits
```

### SGPA

```
SGPA = Total Credit Points Earned ÷ Total Semester Credits
```

- Result rounded to **2 decimal places**
- Denominator is always the **full semester credit total**
- Incomplete subjects contribute **0 credit points** but the full credit denominator still applies for predicted SGPA calculations

### CGPA (Multi-Semester)

```
CGPA = Σ(SGPAᵢ × Creditsᵢ) ÷ Σ(Creditsᵢ)
```

For completed semesters, use finalized SGPA. For the current semester, use **predicted SGPA** from entered marks.

---

## Component Type Definitions

Reusable marking patterns across semesters:

| Type Key | Description | Used In |
|----------|-------------|---------|
| `theory100` | CA1(10) + CA2(10) + Midsem(30) + Endsem(50) = 100 | Sem II legacy |
| `theory50` | CA1(5) + CA2(5) + Midsem(15) + Endsem(25) = 50 | Sem II legacy |
| `lab` | CA1(25) + CA2(25) = 50 | Sem II legacy |
| `theory100_ese` | CA1(25) + CA2(25) + ESE(50) = 100 | Sem III theory (3 cr) |
| `theory50_ca25` | CA1(25) + CA2(25) = 50 | Sem III theory (≤2 cr) |
| `lab_viva` | CA1(15) + CA2(15) + Viva(20) + Practical(50) = 100 | Sem III labs |
| `custom_theory50` | CA1(25) + CA2(25) = 50, user-defined name | Sem III electives |

---

## Currently Implemented Semester

### Semester 3 — BTECH CS (Official)

| Property | Value |
|----------|-------|
| **Status** | Fully Functional |
| **Total Credits** | **22** |
| **Academic Year** | Second Year |
| **Engine File** | `src/data/sem3Engine.js` |
| **Subject Data** | `src/data/semesters/sem3.js` |

> All SGPA calculations for Semester 3 **must use 22 as the denominator**.

---

### Semester 3 — Theory Subjects

#### Mathematics for Computer Science
| Field | Value |
|-------|-------|
| Code | `SEM3_MATH` |
| Credits | 3 |
| Type | `theory100_ese` |
| CA1 | 25 |
| CA2 | 25 |
| ESE | 50 |
| **Total** | **100** |

#### Data Structure and Its Application
| Field | Value |
|-------|-------|
| Code | `SEM3_DSA` |
| Credits | 3 |
| Type | `theory100_ese` |
| CA1 | 25 |
| CA2 | 25 |
| ESE | 50 |
| **Total** | **100** |

#### Computer Networks
| Field | Value |
|-------|-------|
| Code | `SEM3_CN` |
| Credits | 3 |
| Type | `theory100_ese` |
| CA1 | 25 |
| CA2 | 25 |
| ESE | 50 |
| **Total** | **100** |

#### Environmental Sciences
| Field | Value |
|-------|-------|
| Code | `SEM3_ENV` |
| Credits | 2 |
| Type | `theory50_ca25` |
| CA1 | 25 |
| CA2 | 25 |
| **Total** | **50** |

#### Intellectual Property Rights
| Field | Value |
|-------|-------|
| Code | `SEM3_IPR` |
| Credits | 1 |
| Type | `theory50_ca25` |
| CA1 | 25 |
| CA2 | 25 |
| **Total** | **50** |

#### Aptitude Skills I
| Field | Value |
|-------|-------|
| Code | `SEM3_APT` |
| Credits | 1 |
| Type | `theory50_ca25` |
| CA1 | 25 |
| CA2 | 25 |
| **Total** | **50** |

#### Language Skills I
| Field | Value |
|-------|-------|
| Code | `SEM3_LANG` |
| Credits | 1 |
| Type | `theory50_ca25` |
| CA1 | 25 |
| CA2 | 25 |
| **Total** | **50** |

#### Mini Project II
| Field | Value |
|-------|-------|
| Code | `SEM3_MINI` |
| Credits | 1 |
| Type | `theory50_ca25` |
| CA1 | 25 |
| CA2 | 25 |
| **Total** | **50** |

---

### Semester 3 — Laboratories

#### DSA Lab
| Field | Value |
|-------|-------|
| Code | `SEM3_DSA_LAB` |
| Credits | 1 |
| Type | `lab_viva` |
| CA1 | 15 |
| CA2 | 15 |
| Viva | 20 |
| Practical | 50 |
| **Total** | **100** |

#### Computer Networks Lab
| Field | Value |
|-------|-------|
| Code | `SEM3_CN_LAB` |
| Credits | 1 |
| Type | `lab_viva` |
| CA1 | 15 |
| CA2 | 15 |
| Viva | 20 |
| Practical | 50 |
| **Total** | **100** |

#### Web Technology Lab
| Field | Value |
|-------|-------|
| Code | `SEM3_WT_LAB` |
| Credits | 1 |
| Type | `lab_viva` |
| CA1 | 15 |
| CA2 | 15 |
| Viva | 20 |
| Practical | 50 |
| **Total** | **100** |

---

### Semester 3 — Electives & Minor

#### Multidisciplinary Minor
| Field | Value |
|-------|-------|
| Code | `SEM3_MINOR` |
| Credits | 2 (fixed) |
| Type | `custom_theory50` |
| Subject Name | **User-entered** (dynamic) |
| CA1 | 25 |
| CA2 | 25 |
| **Total** | **50** |

#### Open Elective
| Field | Value |
|-------|-------|
| Code | `SEM3_ELECTIVE` |
| Credits | 2 (fixed) |
| Type | `custom_theory50` |
| Subject Name | **User-entered** (dynamic) |
| CA1 | 25 |
| CA2 | 25 |
| **Total** | **50** |

Custom subject names are stored in Firestore:
```
academic/{uid}.semesters.3.customNames.SEM3_MINOR
academic/{uid}.semesters.3.customNames.SEM3_ELECTIVE
```

---

### Semester 3 — Credit Summary

| Category | Subjects | Credits |
|----------|----------|---------|
| Theory (3 cr) | Maths, DSA, CN | 9 |
| Theory (2 cr) | Environmental Sciences | 2 |
| Theory (1 cr) | IPR, Aptitude, Language, Mini Project | 4 |
| Labs (1 cr) | DSA Lab, CN Lab, WT Lab | 3 |
| Electives (2 cr) | Minor, Open Elective | 4 |
| **Total** | **13 subjects** | **22** |

### High-Impact Subjects (3 Credits)

These subjects have the highest SGPA leverage:

| Subject | Short | Credits | SGPA Impact per +1 GP |
|---------|-------|---------|----------------------|
| Mathematics for Computer Science | Maths | 3 | +0.136 SGPA |
| Data Structure and Its Application | DSA | 3 | +0.136 SGPA |
| Computer Networks | CN | 3 | +0.136 SGPA |

Formula: `+1 GP impact = subjectCredits ÷ totalCredits = 3 ÷ 22 ≈ 0.136`

---

## Analysis Rules (All Semesters)

### Grade Boundary Analysis
- Only subjects with at least partial marks entered
- Show upgrades where gap to next grade is **≤ 10 marks**
- Rank by ROI: `(creditPointGain) ÷ gap`
- Display SGPA gain: `creditPointGain ÷ totalCredits`

### Risk Analysis
- Simulate **±3 percentage point** drop from current percentage
- Flag if grade would decrease
- Rank by credit point loss (descending)
- Severity: HIGH (≥4 CP), MEDIUM (≥2 CP), LOW (<2 CP)

### Reverse Engineering
- **Marks Mode:** Lock subjects with all components entered; compute requirements for remainder
- **Planning Mode:** No locked subjects; compute requirements for all subjects
- Target CP = `targetSGPA × totalCredits`
- `avgGPNeeded = (targetCP - lockedCP) ÷ remainingCredits`
- Feasible if `0 ≤ avgGPNeeded ≤ 10`

### Target Calculator (Per Subject)
- Given partial component marks and a target grade
- Compute minimum total marks for target grade
- Return marks still needed from pending components
- Flag if already achieved or infeasible

---

## Legacy Semester — Semester II (Preserved)

> **Status:** Implemented in `src/data/engine.js` — do not delete.

| Property | Value |
|----------|-------|
| Total Credits | 21 |
| Subjects | 14 |
| Codes | `23CS1201` – `23CS1214` |

### Sem II Subject Types

| Type | Components | Total |
|------|------------|-------|
| `theory100` | CA1(10), CA2(10), Midsem(30), Endsem(50) | 100 |
| `theory50` | CA1(5), CA2(5), Midsem(15), Endsem(25) | 50 |
| `lab` | CA1(25), CA2(25) | 50 |

### Sem II Subject List

| Code | Name | Credits | Type |
|------|------|---------|------|
| 23CS1201 | Applied Mathematics-II | 4 | theory100 |
| 23CS1202 | Applied Chemistry | 2 | theory100 |
| 23CS1203 | Indian Knowledge System | 2 | theory100 |
| 23CS1204 | Basic Electronics Engineering | 1 | theory50 |
| 23CS1205 | Basic Civil Engineering | 1 | theory50 |
| 23CS1206 | Engineering Drawing | 1 | theory50 |
| 23CS1207 | Python Programming | 2 | theory100 |
| 23CS1208 | Applied Chemistry Laboratory | 1 | lab |
| 23CS1209 | Basic Electronics Engg. Laboratory | 1 | lab |
| 23CS1210 | Basic Civil Engg. Laboratory | 1 | lab |
| 23CS1211 | Engineering Drawing Laboratory | 1 | lab |
| 23CS1212 | Workshop Practices | 1 | lab |
| 23CS1213 | Python Programming Laboratory | 1 | lab |
| 23CS1214 | Yoga/Sports Practicals/Mini Project | 2 | lab |

---

## Planned Semesters (Not Yet Implemented)

| Semester | Year | Status |
|----------|------|--------|
| Semester 1 | First Year | Under Development |
| Semester 2 | First Year | Under Development |
| Semester 4 | Second Year | Under Development |
| Semester 5 | Third Year | Under Development |
| Semester 6 | Third Year | Under Development |
| Semester 7 | Fourth Year | Under Development |
| Semester 8 | Fourth Year | Under Development |

When implementing a new semester:

1. Add full subject structure to this document **first**
2. Create `src/data/semesters/semN.js`
3. Register in `src/data/semesters/index.js`
4. Create engine instance (do not modify other semester engines)
5. Add workspace component or extend `Sem3Workspace` pattern
6. Update `ARCHITECTURE_PLAN.md` semester status table

---

## Validation Checklist

Before merging any semester-related code, verify:

- [ ] Subject credits sum to documented total
- [ ] Component marks sum to documented subject total
- [ ] Subject codes are unique within the semester
- [ ] `TOTAL_CREDITS` matches this document
- [ ] Grade system matches global table above
- [ ] SGPA denominator uses full semester credits
- [ ] Custom subjects store name separately from code
- [ ] Firestore schema matches `ARCHITECTURE_PLAN.md`

---

## Related Documents

| Document | Role |
|----------|------|
| `PROJECT_VISION.md` | Why semesters matter to the platform |
| `PROJECT_GUARDRAILS.md` | Rules for modifying semester engines |
| `ARCHITECTURE_PLAN.md` | Where semester data lives in the app |
| `src/data/engine.js` | Sem II implementation reference |
| `src/data/semesters/sem3.js` | Sem III implementation reference |

---

*SEMESTER_RULES.md — Official source of truth for GPA Engine academic structures*
