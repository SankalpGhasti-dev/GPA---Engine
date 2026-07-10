# DYPATU GPA Engine Rules

> **Document Purpose:** This document is the single source of truth for the DYPATU GPA Engine. It defines the official academic structure, grading system, calculation rules, and semester data used by the application. All GPA-related implementations must follow this document.

---

## Global Grade System

All semesters follow the same official DYPATU grade system. The following table defines the grade, grade points, and performance criteria used throughout the GPA Engine.

The DYPATU grading system follows an **absolute grading** method. Every course is evaluated using letter grades and corresponding grade points.

| Marks Obtained | Grade | Grade Points | Performance                  |
| -------------- | ----- | -----------: | ---------------------------- |
| 90-100         | O     |           10 | Outstanding                  |
| 80-89          | A+    |            9 | Excellent                    |
| 70-79          | A     |            8 | Very Good                    |
| 60-69          | B+    |            7 | Good                         |
| 50-59          | B     |            6 | Above Average                |
| 45-49          | C     |            5 | Average                      |
| 40-44          | P     |            4 | Pass                         |
| 0-39           | F     |            0 | Fail                         |
| -              | Ab    |            0 | Absent                       |
| Satisfactory   | PP    |            - | Pass in Non-Credit Courses   |
| Unsatisfactory | NP    |            - | Failed in Non-Credit Courses |
| X              | X     |            0 | Detained (Failed)            |


### Rounding Rules

Different GPA Engine calculations use different rounding rules.

| Calculation Area | Rounding Rule |
| ---------------- | ------------- |
| Grade Mapping | Round subject percentage to the nearest integer before applying the grade table |
| SGPA | Round final SGPA to 2 decimal places |
| CGPA | Round final CGPA to 2 decimal places |

```text
roundToNearestInteger(value) = Math.floor(value + 0.5)
roundToTwoDecimals(value) = Math.round((value + Number.EPSILON) * 100) / 100
```

**Examples:**

* 89.49% -> 89 -> A+
* 89.50% -> 90 -> O
* 8.494 SGPA -> 8.49
* 8.495 SGPA -> 8.50


---

## Global Calculation Rules


### Subject Percentage

The percentage for a subject is calculated using the total marks obtained and the maximum marks allotted for that subject.

```text
Subject Percentage = (Marks Obtained / Maximum Marks) * 100
```

Where:

```text
Marks Obtained = FET + MSE + ESE        (Theory Courses)
Marks Obtained = Practical Evaluation  (Laboratory Courses)
Marks Obtained = ESE                   (Courses with ESE only)
```

> Laboratory component split is **Pending Official Verification**. Until verified, use `Practical Evaluation = 100`.

### Credit Points

Credit points for a subject are calculated by multiplying the assigned grade points by the subject credits.

```text
Credit Points = Grade Points * Subject Credits
```


### SGPA

```text
SGPA = Total Credit Points Earned / Total Semester Credits
```

* Result rounded to **2 decimal places**
* Denominator is always the **total semester credits**
* Credit Points = Grade Points * Subject Credits
* SGPA is calculated using all registered subjects in the semester
* For completed semesters, use the **finalized subject grades**
* For the current semester, use **predicted subject grades** based on the entered marks


### CGPA (Multi-Semester)

```text
CGPA = Sum(SGPA_i * Semester Credits_i) / Sum(Semester Credits_i)
```

* Result rounded to **2 decimal places**
* Each completed semester contributes according to its total credits
* Completed semesters use the **finalized SGPA**
* The current semester uses the **predicted SGPA** generated from the entered marks
* The overall CGPA is updated dynamically whenever the predicted SGPA changes


---

## Component Type Definitions

Component types define the marking structure used by different categories of subjects. These reusable patterns are referenced throughout the GPA Engine instead of redefining the marking scheme for every subject.


| Type Key    | Description                       | Used In             |
| ----------- | --------------------------------- | ------------------- |
| `theory100` | FET(20) + MSE(30) + ESE(50) = 100 | Theory Subjects     |
| `lab100`    | Practical Evaluation = 100        | Laboratory Subjects |
| `ese50`     | ESE(50) = 50                      | ESE-Only Subjects   |

> `lab100` uses `Practical Evaluation = 100`. Official laboratory component split is **Pending Official Verification**.


## Currently Implemented Semester

### Semester 3 - B.Tech Artificial Intelligence & Machine Learning

| Property          | Value                        |
| ----------------- | ---------------------------- |
| **Status**        | In Development               |
| **Total Credits** | **24**                       |
| **Academic Year** | Second Year                  |
| **Engine File**   | `src/data/sem3Engine.js`     |
| **Subject Data**  | `src/data/semesters/sem3.js` |

> All SGPA calculations for Semester 3 **must use 24 as the denominator**.

> Subject codes are **Pending Official Verification** unless confirmed from official DYPATU academic documents.


---

### Semester 3 - Theory Subjects


#### Applied Statistics

| Field     | Value                           |
| --------- | ------------------------------- |
| Code      | Pending Official Verification   |
| Credits   | 4                               |
| Type      | `theory100`                     |
| FET       | 20                              |
| MSE       | 30                              |
| ESE       | 50                              |
| **Total** | **100**                         |

#### Data Structure

| Field     | Value                           |
| --------- | ------------------------------- |
| Code      | Pending Official Verification   |
| Credits   | 4                               |
| Type      | `theory100`                     |
| FET       | 20                              |
| MSE       | 30                              |
| ESE       | 50                              |
| **Total** | **100**                         |

#### Object Oriented Programming Using C++

| Field     | Value                           |
| --------- | ------------------------------- |
| Code      | Pending Official Verification   |
| Credits   | 4                               |
| Type      | `theory100`                     |
| FET       | 20                              |
| MSE       | 30                              |
| ESE       | 50                              |
| **Total** | **100**                         |

#### Introduction to Artificial Intelligence

| Field     | Value                           |
| --------- | ------------------------------- |
| Code      | Pending Official Verification   |
| Credits   | 3                               |
| Type      | `theory100`                     |
| FET       | 20                              |
| MSE       | 30                              |
| ESE       | 50                              |
| **Total** | **100**                         |

#### Relational Database Management System

| Field     | Value                           |
| --------- | ------------------------------- |
| Code      | Pending Official Verification   |
| Credits   | 4                               |
| Type      | `theory100`                     |
| FET       | 20                              |
| MSE       | 30                              |
| ESE       | 50                              |
| **Total** | **100**                         |


### Semester 3 - Laboratory Subjects

#### OOPS Using C++ Lab

| Field                    | Value                         |
| ------------------------ | ----------------------------- |
| Code                     | Pending Official Verification |
| Credits                  | 2                             |
| Type                     | `lab100`                      |
| Practical Evaluation     | 100                           |
| **Total**                | **100**                       |

#### RDBMS Lab

| Field                    | Value                         |
| ------------------------ | ----------------------------- |
| Code                     | Pending Official Verification |
| Credits                  | 2                             |
| Type                     | `lab100`                      |
| Practical Evaluation     | 100                           |
| **Total**                | **100**                       |

#### Data Structure Lab

| Field                    | Value                         |
| ------------------------ | ----------------------------- |
| Code                     | Pending Official Verification |
| Credits                  | 1                             |
| Type                     | `lab100`                      |
| Practical Evaluation     | 100                           |
| **Total**                | **100**                       |


### Semester 3 - Credit Summary

| Category     | Subjects                                                                     | Credits |
| ------------ | ---------------------------------------------------------------------------- | ------- |
| Theory       | Applied Statistics, Data Structure, OOP Using C++, Introduction to AI, RDBMS | 19      |
| Laboratories | OOPS Using C++ Lab, RDBMS Lab, Data Structure Lab                            | 5       |
| **Total**    | **8 Subjects**                                                               | **24**  |


### Semester 3 - Credit Impact Analysis

These subjects have the highest impact on the Semester GPA.

| Subject                               | Credits | SGPA Impact per +1 Grade Point |
| ------------------------------------- | ------- | -----------------------------: |
| Applied Statistics                    | 4       |                    +0.167 SGPA |
| Data Structure                        | 4       |                    +0.167 SGPA |
| Object Oriented Programming Using C++ | 4       |                    +0.167 SGPA |
| Relational Database Management System | 4       |                    +0.167 SGPA |

Formula:

```text
SGPA Impact = Subject Credits / Total Semester Credits
```

Example:

```text
4 / 24 = 0.1667 ~= 0.167
```


---

## Semester 4 - B.Tech Artificial Intelligence & Machine Learning

| Property          | Value                        |
| ----------------- | ---------------------------- |
| **Status**        | In Development               |
| **Total Credits** | **TBD**                      |
| **Academic Year** | Second Year                  |
| **Engine File**   | `src/data/sem4Engine.js`     |
| **Subject Data**  | `src/data/semesters/sem4.js` |

> All SGPA calculations for Semester 4 **must use the official semester credit total as the denominator**.

---

### Semester 4 - Theory Subjects

#### Linear Algebra

> Pending official subject structure.

#### Introduction to Internet of Things

> Pending official subject structure.

#### Project Management

> Pending official subject structure.

#### Introduction to Machine Learning

> Pending official subject structure.

#### R Programming

> Pending official subject structure.

---

### Semester 4 - Laboratory Subjects

> Pending official laboratory structure.

---

### Semester 4 - Credit Summary

| Category     | Subjects | Credits |
| ------------ | -------- | ------- |
| Theory       | 5        | TBD     |
| Laboratories | TBD      | TBD     |
| **Total**    | **TBD**  | **TBD** |

---

### Semester 4 - Credit Impact Analysis

> To be finalized after verification of the official Semester 4 credit structure.


## Analysis Rules (All Semesters)

### Grade Boundary Analysis

* Analyze all subjects with available marks.
* Calculate the minimum marks required to reach the next grade boundary.
* Calculate the expected Grade Point gain.
* Calculate the expected Credit Point gain.
* Calculate the expected SGPA improvement.
* Rank subjects by Return on Improvement (ROI).

```text
Grade Point Gain = Next Grade Point - Current Grade Point

Credit Point Gain = Grade Point Gain * Subject Credits

SGPA Gain = Credit Point Gain / Total Semester Credits

ROI = Credit Point Gain / Marks Required
```

---

### Risk Analysis

* Analyze every subject against the next lower grade boundary.
* Calculate the maximum marks that can be lost before the grade decreases.
* Calculate the expected Grade Point loss.
* Calculate the expected Credit Point loss.
* Calculate the expected SGPA reduction.
* Rank subjects by highest academic risk.

```text
Grade Point Loss = Current Grade Point - Next Lower Grade Point

Credit Point Loss = Grade Point Loss * Subject Credits

SGPA Loss = Credit Point Loss / Total Semester Credits
```

---

### Reverse Engineering

#### Marks Mode

* Lock all completed subjects.
* Calculate the remaining marks required in incomplete subjects.
* Calculate the minimum Grade Point required.
* Determine whether the target SGPA is achievable.

```text
Target Credit Points = Target SGPA * Total Semester Credits

Remaining Credit Points = Target Credit Points - Earned Credit Points

Average Grade Point Required = Remaining Credit Points / Remaining Credits
```

---

#### Planning Mode

* Assume no subjects are locked.
* Calculate the average Grade Point required across all subjects.
* Calculate the minimum marks required for each subject.
* Generate multiple study plans based on the selected target SGPA.

---

### Target Calculator (Per Subject)

Given the entered marks and a target grade, the GPA Engine calculates the minimum marks required to achieve the desired result.

| Property             | Value                                           |
| -------------------- | ----------------------------------------------- |
| Input                | Entered Component Marks                         |
| Target               | Grade / Grade Point                             |
| Components Supported | FET, MSE, ESE, Practical Evaluation             |
| Required Marks       | `Target Total Marks - Marks Obtained`           |
| Remaining Marks      | `Maximum Marks - Marks Obtained`                |
| Prediction Status    | Achievable / Not Achievable                     |
| Output               | Required Marks in Pending Components            |
| Grade Prediction     | Highest Possible Grade Based on Remaining Marks |

The Target Calculator must:

* Calculate the target percentage.
* Calculate the corresponding target grade.
* Calculate the required Grade Point.
* Calculate the minimum marks required in pending evaluation components.
* Display whether the target is achievable.
* Display the remaining marks required.


### Semester 3 Subject Types

| Type        | Components                  | Total |
| ----------- | --------------------------- | ----: |
| `theory100` | FET(20) + MSE(30) + ESE(50) |   100 |
| `lab100`    | Practical Evaluation = 100  |   100 |
| `ese50`     | ESE(50)                     |    50 |


## Legacy Semester - Semester II (Pending)

> **Status:** Awaiting Official DYPATU Semester II Academic Data

### Semester II Subject Types

> Pending official evaluation pattern.

### Semester II Subject List

> Pending official subject codes, credits, and evaluation structure.

Semester II will be implemented after the official DYPATU Semester II result and academic structure are available. Until then, the GPA Engine architecture remains compatible, and this section serves as a placeholder for future implementation.



## Planned Semesters (Not Yet Implemented)

| Semester   | Academic Year | Status            |
| ---------- | ------------- | ----------------- |
| Semester 1 | First Year    | Under Development |
| Semester 2 | First Year    | Under Development |
| Semester 4 | Second Year   | Under Development |
| Semester 5 | Third Year    | Under Development |
| Semester 6 | Third Year    | Under Development |
| Semester 7 | Fourth Year   | Under Development |
| Semester 8 | Fourth Year   | Under Development |

When implementing a new semester:

1. Add the complete semester structure to this document **first**.
2. Create `src/data/semesters/semN.js`.
3. Register the semester in `src/data/semesters/index.js`.
4. Create the corresponding semester engine (`src/data/semNEngine.js`).
5. Add or extend the semester workspace component.
6. Update the semester status in the project architecture documentation.
7. Verify all calculations using official DYPATU academic data before deployment.


## Validation Checklist

Before merging any semester-related code, verify:

* [ ] Subject credits match the official DYPATU curriculum.
* [ ] Component marks match the official DYPATU evaluation pattern.
* [ ] Subject codes are unique within the semester.
* [ ] `TOTAL_CREDITS` matches the official semester credit structure.
* [ ] Grade system matches the official DYPATU grading regulations.
* [ ] SGPA calculation uses the correct total semester credits.
* [ ] Component types (`theory100`, `lab100`, `ese50`) are correctly assigned.
* [ ] Semester data matches the official DYPATU syllabus.
* [ ] Engine files are synchronized with semester data files.
* [ ] All calculations are verified against official DYPATU results before deployment.


## Related Documents

| Document                     | Role                                                          |
| ---------------------------- | ------------------------------------------------------------- |
| `PROJECT_VISION.md`          | Defines the long-term vision and objectives of the GPA Engine |
| `DYPATU_GPA_ENGINE_RULES.md` | Official academic rules and calculation specification         |
| `PROJECT_GUARDRAILS.md`      | Rules and constraints for modifying the GPA Engine            |
| `ARCHITECTURE_PLAN.md`       | Overall project architecture and implementation plan          |
| `src/data/semesters/sem3.js` | Semester 3 academic data                                      |
| `src/data/sem3Engine.js`     | Semester 3 GPA calculation engine                             |
| `src/data/semesters/sem4.js` | Semester 4 academic data (planned)                            |
| `src/data/sem4Engine.js`     | Semester 4 GPA calculation engine (planned)                   |

---

*DYPATU_GPA_ENGINE_RULES.md - Official source of truth for all DYPATU GPA Engine academic structures, grading rules, semester configurations, and calculation logic.*
