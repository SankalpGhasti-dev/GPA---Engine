// ============================================================
// COLLEGE REGISTRY — GPA Engine
// ============================================================
// Central registry for all supported colleges.
//
// To add a new college:
//   1. Create src/data/colleges/yourcollege.js (follow sitcoe.js pattern)
//   2. Import it here and add to COLLEGES array
//   3. No UI changes required — all dropdowns are data-driven
// ============================================================

import SITCOE from "./sitcoe";
import DYPATIL from "./dypatil";
import OTHER_COLLEGE from "./other";

// ── Ordered college list (order determines dropdown order) ──
export const COLLEGES = [SITCOE, DYPATIL, OTHER_COLLEGE];

// ── Helper: get college object by id ───────────────────────
export function getCollegeById(id) {
  return COLLEGES.find((c) => c.id === id) || OTHER_COLLEGE;
}

// ── Helper: get branch list for a college id ───────────────
// Returns [] for Other College (triggers free-text input)
export function getBranches(collegeId) {
  const college = getCollegeById(collegeId);
  return college.branches || [];
}

// ── Helper: get semester credit total for CGPA computation ─
// Returns the credit count for a specific semester number.
// Falls back to 20 if not defined in the college config.
export function getSemesterCredits(collegeId, semesterNumber) {
  const college = getCollegeById(collegeId);
  return college.semesterCredits?.[semesterNumber] || 20;
}

// ── Helper: compute credit-weighted CGPA ───────────────────
// academics: { sem1SGPA, sem2SGPA, ..., sem8SGPA }
// currentSemester: the student's current (active) semester
// collegeId: used to look up per-semester credit weights
//
// Only completed semesters (< currentSemester) with a non-null,
// non-NaN SGPA value are included. Skipped/null SGPAs are ignored.
export function computeCGPA(academics, currentSemester, collegeId) {
  const college = getCollegeById(collegeId);
  const credits = college?.semesterCredits || {};

  let totalWeighted = 0;
  let totalCredits = 0;

  for (let i = 1; i < currentSemester; i++) {
    const sgpa = parseFloat(academics?.[`sem${i}SGPA`]);
    const cr = credits[i] || 20;
    if (!isNaN(sgpa) && sgpa >= 0) {
      totalWeighted += sgpa * cr;
      totalCredits += cr;
    }
  }

  if (totalCredits === 0) return null;
  return Math.round((totalWeighted / totalCredits) * 100) / 100;
}

// ── Helper: check if college uses custom/free-text fields ──
export function isOtherCollege(collegeId) {
  return collegeId === "other" || !collegeId;
}

// ── Helper: get dropdown options for the college selector ──
export function getCollegeOptions() {
  return COLLEGES.map((c) => ({ value: c.id, label: c.displayName }));
}

// ── Year → Semester mapping (standard 8-sem BTech) ─────────
export const YEAR_TO_SEMESTERS = {
  1: [1, 2],
  2: [3, 4],
  3: [5, 6],
  4: [7, 8],
};

export const YEAR_LABELS = {
  1: "First Year",
  2: "Second Year",
  3: "Third Year",
  4: "Fourth Year",
};

export { SITCOE, DYPATIL, OTHER_COLLEGE };
export default COLLEGES;
