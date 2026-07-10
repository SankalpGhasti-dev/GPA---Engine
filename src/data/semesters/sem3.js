// ============================================================
// SEMESTER 3 — BTECH CS Subject Definitions
// Source of truth: SEMESTER_RULES.md
// Total Credits: 22 | Subjects: 13
// ============================================================

export const SEM3_SUBJECTS = [
  // ── Theory (3 credits) — theory100_ese ──────────────────
  { code: "SEM3_MATH", name: "Mathematics for Computer Science", credits: 3, type: "theory100_ese" },
  { code: "SEM3_DSA",  name: "Data Structure and Its Application", credits: 3, type: "theory100_ese" },
  { code: "SEM3_CN",   name: "Computer Networks", credits: 3, type: "theory100_ese" },

  // ── Theory (2 credits) — theory50_ca25 ──────────────────
  { code: "SEM3_ENV",  name: "Environmental Sciences", credits: 2, type: "theory50_ca25" },

  // ── Theory (1 credit) — theory50_ca25 ───────────────────
  { code: "SEM3_IPR",  name: "Intellectual Property Rights", credits: 1, type: "theory50_ca25" },
  { code: "SEM3_APT",  name: "Aptitude Skills I", credits: 1, type: "theory50_ca25" },
  { code: "SEM3_LANG", name: "Language Skills I", credits: 1, type: "theory50_ca25" },
  { code: "SEM3_MINI", name: "Mini Project II", credits: 1, type: "theory50_ca25" },

  // ── Laboratories (1 credit) — lab_viva ──────────────────
  { code: "SEM3_DSA_LAB", name: "DSA Lab", credits: 1, type: "lab_viva" },
  { code: "SEM3_CN_LAB",  name: "Computer Networks Lab", credits: 1, type: "lab_viva" },
  { code: "SEM3_WT_LAB",  name: "Web Technology Lab", credits: 1, type: "lab_viva" },

  // ── Electives (2 credits) — custom_theory50 ─────────────
  { code: "SEM3_MINOR",    name: "Multidisciplinary Minor", credits: 2, type: "custom_theory50", isCustom: true },
  { code: "SEM3_ELECTIVE", name: "Open Elective", credits: 2, type: "custom_theory50", isCustom: true },
];

export const SEM3_TOTAL_CREDITS = SEM3_SUBJECTS.reduce((s, x) => s + x.credits, 0); // 22

// ============================================================
// COMPONENT STRUCTURES PER TYPE
// ============================================================
export function getSem3Components(type) {
  if (type === "theory100_ese") return [
    { key: "ca1", label: "CA1", max: 25 },
    { key: "ca2", label: "CA2", max: 25 },
    { key: "ese", label: "ESE", max: 50 },
  ];
  if (type === "theory50_ca25") return [
    { key: "ca1", label: "CA1", max: 25 },
    { key: "ca2", label: "CA2", max: 25 },
  ];
  if (type === "lab_viva") return [
    { key: "ca1", label: "CA1", max: 15 },
    { key: "ca2", label: "CA2", max: 15 },
    { key: "viva", label: "Viva", max: 20 },
    { key: "practical", label: "Practical", max: 50 },
  ];
  if (type === "custom_theory50") return [
    { key: "ca1", label: "CA1", max: 25 },
    { key: "ca2", label: "CA2", max: 25 },
  ];
  return [];
}

export function getSem3MaxMarks(type) {
  return getSem3Components(type).reduce((s, c) => s + c.max, 0);
}
