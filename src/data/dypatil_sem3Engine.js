// ============================================================
// SEMESTER 3 ENGINE INSTANCE - DYPATU
// Pre-built engine using the generic factory + DYPATU Sem 3 data.
// ============================================================

import { createSemesterEngine } from "./semesterEngine";
import { 
  DYPATIL_SEM3_SUBJECTS, 
  DYPATIL_SEM3_TOTAL_CREDITS, 
  getDypatilSem3Components, 
  getDypatilSem3MaxMarks 
} from "./semesters/dypatil_sem3";

const dypatilSem3Engine = createSemesterEngine(
  DYPATIL_SEM3_SUBJECTS,
  DYPATIL_SEM3_TOTAL_CREDITS,
  getDypatilSem3Components,
  getDypatilSem3MaxMarks
);

export default dypatilSem3Engine;
