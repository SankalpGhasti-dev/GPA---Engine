// ============================================================
// COLLEGE CONFIG — Other College (Custom Entry Sentinel)
// ============================================================
// This is a sentinel config for users whose college is not in
// the supported list. All name/university/branch fields become
// free-text inputs in the UI.
//
// semesterCredits uses 20 per semester as a generic fallback.
// Users can still get an approximate CGPA. When a college is
// formally added to the registry, users can switch to it.
// ============================================================

const OTHER_COLLEGE = {
  id: "other",
  displayName: "Other College",
  shortName: "Other",
  university: "", // user-entered

  // Grade system
  gradingSystem: "GENERIC",

  // No preset branches — user enters free text
  branches: [],

  // Generic fallback credit totals (20 per semester)
  // These are used for approximate CGPA computation only.
  // Update when a proper config is available for the user's college.
  semesterCredits: {
    1: 20,
    2: 20,
    3: 20,
    4: 20,
    5: 20,
    6: 20,
    7: 20,
    8: 20,
  },

  // Metadata — all fields are user-customizable
  futureSemesterSupport: false,
  allowCustomBranch: true,
  allowCustomName: true,
  allowCustomUniversity: true,
};

export default OTHER_COLLEGE;
