// ============================================================
// COLLEGE CONFIG — D. Y. Patil College of Engineering &
//                 Technology, Kolhapur
// ============================================================
// Semester credits are placeholder values (22 per semester)
// until official credit totals per DYPatil syllabus are confirmed.
// Update semesterCredits here only — the CGPA engine will
// automatically reflect the change everywhere.
// ============================================================

const DYPATIL = {
  id: "dypatil-kolhapur",
  displayName: "D.Y. Patil Agriculture & Technical University, Talsande",
  shortName: "DYP Kolhapur",
  university: "Shivaji University, Kolhapur",

  // Grade system identifier
  gradingSystem: "SITCOE", // Follows same Shivaji University grading

  // Branch list for this college
  branches: [
    "Computer Science & Engineering (CSE)",
    "Artificial Intelligence & Machine Learning (AI & ML)",
    "* Electronics & Telecommunication Engineering (ENTC)",
    "* Mechanical Engineering",
    "* Civil Engineering",
    "* Electrical Engineering",
    "* Artificial Intelligence & Data Science (AI & DS)",
    "* Robotics & Automation",
    "* Food Technology",
    "* Agricultural Engineering",
    "* Biotechnology"
  ],

  // Semester credit totals — placeholder values until official syllabus confirmed.
  // Update these values once the official DYPatil semester credit structure is available.
  semesterCredits: {
    1: 22,
    2: 22,
    3: 24,
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

export default DYPATIL;
