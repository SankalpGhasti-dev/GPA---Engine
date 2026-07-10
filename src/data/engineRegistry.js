// ============================================================
// ENGINE REGISTRY
// Central resolver for fetching the correct semester engine 
// based on the user's selected college and semester number.
// ============================================================

import sitcoeSem3Engine from "./sem3Engine";
import dypatilSem3Engine from "./dypatil_sem3Engine";
import { GRADE_SYSTEM, collegeRound } from "./engine";

/**
 * Returns the complete engine and configuration for a specific college and semester.
 * The workspace components should use this as their single source of truth.
 * 
 * @param {string} collegeId 
 * @param {number|string} semesterNumber 
 * @returns {Object} Complete engine context
 */
export function getSemesterEngine(collegeId, semesterNumber) {
  const sem = String(semesterNumber);
  
  let engine;
  
  if (collegeId === "dypatil-kolhapur") {
    if (sem === "3") {
      engine = dypatilSem3Engine;
    }
    // Fallback to SITCOE for unconfigured semesters to prevent hard crashes
    // Note: Semester 2 uses a legacy approach, so it's not handled here yet.
  } 
  
  // Default (SITCOE)
  if (!engine) {
    if (sem === "3") {
      // sitcoeSem3Engine is exported as default from sem3Engine.js, 
      // but sem3Engine exports specific named exports too.
      // We will just return the base engine object.
      // Since sem3Engine is a proxy/factory return, it has all methods.
      engine = sitcoeSem3Engine;
    }
  }

  // If no engine exists at all (e.g. sem 4 which isn't built yet), return null
  if (!engine) {
    return null;
  }

  // Combine engine with global grading rules
  return {
    ...engine,
    SUBJECTS: engine.subjects,
    TOTAL_CREDITS: engine.totalCredits,
    GRADE_SYSTEM,
    collegeRound
  };
}
