// ============================================================
// SEMESTER 3 DATA - DYPATU
// Branch: B.Tech Artificial Intelligence & Machine Learning
// Academic Year: Second Year
// ============================================================
// Note: Official subject codes are pending.

export const DYPATIL_SEM3_TOTAL_CREDITS = 24;

export const DYPATIL_SEM3_SUBJECTS = [
  // Theory Subjects
  { code: "DYP_AS", name: "Applied Statistics", credits: 4, type: "theory100" },
  { code: "DYP_DS", name: "Data Structure", credits: 4, type: "theory100" },
  { code: "DYP_OOP", name: "Object Oriented Programming Using C++", credits: 4, type: "theory100" },
  { code: "DYP_IAI", name: "Introduction to Artificial Intelligence", credits: 3, type: "theory100" },
  { code: "DYP_RDBMS", name: "Relational Database Management System", credits: 4, type: "theory100" },
  
  // Laboratory Subjects
  { code: "DYP_OOP_LAB", name: "OOPS Using C++ Lab", credits: 2, type: "lab100" },
  { code: "DYP_RDBMS_LAB", name: "RDBMS Lab", credits: 2, type: "lab100" },
  { code: "DYP_DS_LAB", name: "Data Structure Lab", credits: 1, type: "lab100" },
];

export function getDypatilSem3Components(type) {
  if (type === "theory100") {
    return [
      { key: "fet", label: "FET", max: 20 },
      { key: "mse", label: "MSE", max: 30 },
      { key: "ese", label: "ESE", max: 50 },
    ];
  }
  if (type === "lab100") {
    return [
      { key: "practical", label: "Practical Evaluation", max: 100 },
    ];
  }
  if (type === "ese50") {
    return [
      { key: "ese", label: "ESE", max: 50 },
    ];
  }
  return [];
}

export function getDypatilSem3MaxMarks(type) {
  if (type === "theory100") return 100;
  if (type === "lab100") return 100;
  if (type === "ese50") return 50;
  return 100;
}
