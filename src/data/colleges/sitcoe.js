// ============================================================
// COLLEGE CONFIG — Sharad Institute of Technology College of
//                 Engineering, Ichalkaranji (SITCOE)
// ============================================================
// Add new colleges as separate files. Never hardcode college
// data inside React components — always import from here.
// ============================================================

const SITCOE = {
  id: "sitcoe-ichalkaranji",
  displayName: "Sharad Institute of Technology College of Engineering, Ichalkaranji",
  shortName: "SITCOE",
  university: "Shivaji University, Kolhapur",

  // Grade system identifier — links to SEMESTER_RULES.md
  gradingSystem: "SITCOE",

  // Branch list for this college
  branches: [
    "Computer Science and Engineering",
    "Artificial Intelligence & Data Science",
    "Electronics & Telecommunication",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
  ],

  // Semester credit totals — used by the credit-weighted CGPA engine.
  // Sem 2 = 21 (engine.js), Sem 3 = 22 (sem3Engine.js per SEMESTER_RULES.md)
  // Remaining semesters are best-estimate placeholders until officially defined.
  semesterCredits: {
    1: 21,
    2: 21,
    3: 22,
    4: 22,
    5: 22,
    6: 22,
    7: 22,
    8: 22,
  },

  // Metadata
  futureSemesterSupport: true,
  allowCustomBranch: false,
  allowCustomName: false,
  allowCustomUniversity: false,
};

export default SITCOE;
