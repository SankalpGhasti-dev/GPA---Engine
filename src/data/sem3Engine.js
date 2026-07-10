// ============================================================
// SEMESTER 3 ENGINE INSTANCE
// Pre-built engine using the generic factory + Sem 3 data.
// Import from here in all Sem 3 components.
// ============================================================

import { createSemesterEngine } from "./semesterEngine";
import { SEM3_SUBJECTS, SEM3_TOTAL_CREDITS, getSem3Components, getSem3MaxMarks } from "./semesters/sem3";

const sem3Engine = createSemesterEngine(
  SEM3_SUBJECTS,
  SEM3_TOTAL_CREDITS,
  getSem3Components,
  getSem3MaxMarks
);

// Re-export everything for clean imports
export const {
  subjects: SUBJECTS,
  totalCredits: TOTAL_CREDITS,
  getComponents,
  getMaxMarks,
  computeSubject,
  calcSGPA,
  reverseEngineer,
  gradeBoundaryAnalysis,
  riskAnalysis,
  creditLeverageRanking,
  controlIndex,
  overallControlIndex,
  targetCalculator,
  scenarioSGPA,
  SCENARIOS,
} = sem3Engine;

// Also export the grade system for UI components
export { GRADE_SYSTEM, collegeRound } from "./engine";

export default sem3Engine;
