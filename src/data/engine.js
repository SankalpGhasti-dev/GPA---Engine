// ============================================================
// GRADE ENGINE — SITCOE Official System
// Uses >= logic so decimals are handled correctly:
// 89.99 → rounds to 90 → AA
// 79.99 → rounds to 80 → AB
// ============================================================
export const GRADE_SYSTEM = [
  { grade: "AA", points: 10, min: 90 },
  { grade: "AB", points: 9, min: 80 },
  { grade: "BB", points: 8, min: 70 },
  { grade: "BC", points: 7, min: 60 },
  { grade: "CC", points: 6, min: 50 },
  { grade: "CD", points: 5, min: 45 },
  { grade: "DD", points: 4, min: 40 },
  { grade: "FF", points: 0, min: 0 },
];

// Rounding: < 0.5 round down, >= 0.5 round up
// Examples: 8.4→8, 8.49→8, 8.5→9, 8.67→9, 9.5→10
export function collegeRound(val) {
  return Math.floor(val + 0.5);
}

export function getGradeFromPct(pct) {
  // Round the percentage first, then map to grade
  const rounded = collegeRound(pct);
  for (const g of GRADE_SYSTEM) {
    if (rounded >= g.min) return g;
  }
  return GRADE_SYSTEM[GRADE_SYSTEM.length - 1];
}

export function getGradeFromMarks(marks, maxMarks) {
  const pct = (marks / maxMarks) * 100;
  return getGradeFromPct(pct);
}

export function minMarksForGrade(gradeStr, maxMarks) {
  const g = GRADE_SYSTEM.find(x => x.grade === gradeStr);
  if (!g) return null;
  // minimum raw marks needed
  return Math.ceil((g.min / 100) * maxMarks);
}

// ============================================================
// SUBJECT DEFINITIONS
// type: "theory100" | "theory50" | "lab"
// theory100: CA1=10, CA2=10, MSE=30, Endsem=50, total=100
// theory50:  CA1=5,  CA2=5,  MSE=15, Endsem=25, total=50 → ×2 for grade
// lab:       CA1=25, CA2=25, total=50 → ×2 for grade
// ============================================================
export const SUBJECTS = [
  { code: "23CS1201", name: "Applied Mathematics-II", credits: 4, type: "theory100" },
  { code: "23CS1202", name: "Applied Chemistry", credits: 2, type: "theory100" },
  { code: "23CS1203", name: "Indian Knowledge System", credits: 2, type: "theory100" },
  { code: "23CS1204", name: "Basic Electronics Engineering", credits: 1, type: "theory50" },
  { code: "23CS1205", name: "Basic Civil Engineering", credits: 1, type: "theory50" },
  { code: "23CS1206", name: "Engineering Drawing", credits: 1, type: "theory50" },
  { code: "23CS1207", name: "Python Programming", credits: 2, type: "theory100" },
  { code: "23CS1208", name: "Applied Chemistry Laboratory", credits: 1, type: "lab" },
  { code: "23CS1209", name: "Basic Electronics Engg. Laboratory", credits: 1, type: "lab" },
  { code: "23CS1210", name: "Basic Civil Engg. Laboratory", credits: 1, type: "lab" },
  { code: "23CS1211", name: "Engineering Drawing Laboratory", credits: 1, type: "lab" },
  { code: "23CS1212", name: "Workshop Practices", credits: 1, type: "lab" },
  { code: "23CS1213", name: "Python Programming Laboratory", credits: 1, type: "lab" },
  { code: "23CS1214", name: "Yoga/Sports Practicals/Mini Project", credits: 2, type: "lab" },
];

export const TOTAL_CREDITS = SUBJECTS.reduce((s, x) => s + x.credits, 0); // dynamic, not hardcoded

// Component structure per type
export function getComponents(type) {
  if (type === "theory100") return [
    { key: "ca1", label: "CA1", max: 10 },
    { key: "ca2", label: "CA2", max: 10 },
    { key: "mse", label: "Midsem", max: 30 },
    { key: "endsem", label: "Endsem", max: 50 },
  ];
  if (type === "theory50") return [
    { key: "ca1", label: "CA1", max: 5 },
    { key: "ca2", label: "CA2", max: 5 },
    { key: "mse", label: "Midsem", max: 15 },
    { key: "endsem", label: "Endsem", max: 25 },
  ];
  if (type === "lab") return [
    { key: "ca1", label: "CA1", max: 25 },
    { key: "ca2", label: "CA2", max: 25 },
  ];
  return [];
}

export function getMaxMarks(type) {
  return getComponents(type).reduce((s, c) => s + c.max, 0); // 100 or 50
}

export function getGradeMaxMarks(type) {
  // For grade calculation, 50-mark subjects are converted to 100
  return 100;
}

// Raw marks → grade-percentage (50-mark subjects ×2)
export function rawToGradePct(rawMarks, type) {
  const max = getMaxMarks(type);
  const pct = (rawMarks / max) * 100;
  return pct; // already out of 100 since 50→100 is same percentage
}

// ============================================================
// COMPUTE SUBJECT RESULT FROM COMPONENT MARKS
// ============================================================
export function computeSubject(subject, components) {
  // components: { ca1, ca2, mse, endsem } — any can be null/undefined
  const comps = getComponents(subject.type);
  let total = 0;
  let maxEntered = 0;
  let allEntered = true;

  for (const c of comps) {
    const val = components[c.key];
    if (val !== null && val !== undefined && val !== "") {
      total += parseFloat(val);
      maxEntered += c.max;
    } else {
      allEntered = false;
    }
  }

  const maxMarks = getMaxMarks(subject.type);
  const pct = maxEntered > 0 ? (total / maxMarks) * 100 : null;
  const gradeInfo = pct !== null ? getGradeFromPct(pct) : null;
  const creditPoints = gradeInfo ? gradeInfo.points * subject.credits : null;

  return {
    total,
    maxEntered,
    maxMarks,
    pct,
    gradeInfo,
    creditPoints,
    allEntered,
    partial: maxEntered > 0 && !allEntered,
  };
}

// ============================================================
// SGPA ENGINE
// ============================================================
export function calcSGPA(subjectResults) {
  // subjectResults: array of { credits, creditPoints } — only complete subjects
  let totalCP = 0;
  let totalCredits = 0;
  for (const r of subjectResults) {
    if (r.creditPoints !== null && r.creditPoints !== undefined) {
      totalCP += r.creditPoints;
      totalCredits += r.credits;
    }
  }
  if (totalCredits === 0) return null;
  return Math.round((totalCP / TOTAL_CREDITS) * 100) / 100;
}

// ============================================================
// REVERSE ENGINEERING ENGINE
// Target SGPA → per-subject required marks
// ============================================================
export function reverseEngineer(targetSGPA, lockedSubjects) {
  // lockedSubjects: { code: { gradeInfo, creditPoints } } for subjects with full marks
  const targetCP = targetSGPA * TOTAL_CREDITS;

  let lockedCP = 0;
  let lockedCredits = 0;
  const lockedCodes = new Set();

  for (const [code, result] of Object.entries(lockedSubjects)) {
    if (result && result.creditPoints !== null) {
      lockedCP += result.creditPoints;
      lockedCredits += result.credits;
      lockedCodes.add(code);
    }
  }

  const remainingSubjects = SUBJECTS.filter(s => !lockedCodes.has(s.code));
  const remainingCredits = remainingSubjects.reduce((s, x) => s + x.credits, 0);
  const neededCP = targetCP - lockedCP;
  const avgGPNeeded = remainingCredits > 0 ? neededCP / remainingCredits : 0;
  const feasible = avgGPNeeded <= 10 && avgGPNeeded >= 0;

  // Per subject: what grade + what marks
  const subjectRequirements = remainingSubjects.map(s => {
    // Find minimum grade that satisfies avgGPNeeded
    const recommendedGrade = GRADE_SYSTEM.find(g => g.points >= Math.ceil(avgGPNeeded))
      || GRADE_SYSTEM[GRADE_SYSTEM.length - 2];

    const maxMarks = getMaxMarks(s.type);
    const minMarksNeeded = Math.ceil((recommendedGrade.min / 100) * maxMarks);

    // Component breakdown for recommended grade
    const comps = getComponents(s.type);
    const compBreakdown = comps.map(c => ({
      ...c,
      minNeeded: Math.ceil((recommendedGrade.min / 100) * c.max),
    }));

    // All grade options
    const gradeOptions = GRADE_SYSTEM.map(g => ({
      ...g,
      marksNeeded: Math.ceil((g.min / 100) * maxMarks),
      creditPoints: g.points * s.credits,
      compBreakdown: comps.map(c => ({
        ...c,
        minNeeded: Math.ceil((g.min / 100) * c.max),
      })),
    }));

    return {
      ...s,
      maxMarks,
      recommendedGrade,
      minMarksNeeded,
      compBreakdown,
      gradeOptions,
      leverage: s.credits, // higher credits = higher leverage
    };
  }).sort((a, b) => b.leverage - a.leverage);

  return {
    targetCP: Math.round(targetCP * 10) / 10,
    lockedCP: Math.round(lockedCP * 10) / 10,
    neededCP: Math.round(neededCP * 10) / 10,
    remainingCredits,
    avgGPNeeded: Math.round(avgGPNeeded * 100) / 100,
    feasible,
    subjectRequirements,
  };
}

// ============================================================
// GRADE BOUNDARY ANALYZER
// ============================================================
export function gradeBoundaryAnalysis(subjectMarksMap) {
  // subjectMarksMap: { code: { total, type } }
  const opportunities = [];

  for (const subject of SUBJECTS) {
    const entry = subjectMarksMap[subject.code];
    if (!entry || entry.total === null) continue;

    const maxMarks = getMaxMarks(subject.type);
    const currentPct = (entry.total / maxMarks) * 100;
    const currentGrade = getGradeFromPct(currentPct);

    // Find next grade up
    const currentIdx = GRADE_SYSTEM.findIndex(g => g.grade === currentGrade.grade);
    if (currentIdx <= 0) continue; // already AA

    const nextGrade = GRADE_SYSTEM[currentIdx - 1];
    const marksForNext = Math.ceil((nextGrade.min / 100) * maxMarks);
    const gap = marksForNext - entry.total;
    const gpGain = nextGrade.points - currentGrade.points;
    const creditPointGain = gpGain * subject.credits;

    if (gap > 0 && gap <= 10) { // only show if within reach
      opportunities.push({
        subject,
        currentMarks: entry.total,
        currentGrade,
        nextGrade,
        gap,
        gpGain,
        creditPointGain,
        sgpaGain: Math.round((creditPointGain / TOTAL_CREDITS) * 100) / 100,
        priority: creditPointGain / gap, // ROI score
      });
    }
  }

  return opportunities.sort((a, b) => b.priority - a.priority);
}

// ============================================================
// CREDIT LEVERAGE ENGINE
// ============================================================
export function creditLeverageRanking() {
  return SUBJECTS.map(s => {
    const leveragePerGP = s.credits; // each GP gained = credits gained in CP
    return {
      ...s,
      leveragePerGP,
      maxPossibleCP: 10 * s.credits,
    };
  }).sort((a, b) => b.leveragePerGP - a.leveragePerGP);
}

// ============================================================
// CONTROL INDEX ENGINE
// ============================================================
export function controlIndex(type) {
  if (type === "theory100") {
    // CA1(10) + CA2(10) = 20 controlled, MSE(30) partial, Endsem(50) exam
    return { controlled: 20, partial: 30, exam: 50, total: 100 };
  }
  if (type === "theory50") {
    return { controlled: 10, partial: 15, exam: 25, total: 50 };
  }
  if (type === "lab") {
    // Both CA1 and CA2 are lab practicals = fully controlled
    return { controlled: 50, partial: 0, exam: 0, total: 50 };
  }
  return { controlled: 0, partial: 0, exam: 0, total: 0 };
}

export function overallControlIndex() {
  let totalControlled = 0;
  let totalPartial = 0;
  let totalExam = 0;
  let grandTotal = 0;

  for (const s of SUBJECTS) {
    const ci = controlIndex(s.type);
    totalControlled += ci.controlled;
    totalPartial += ci.partial;
    totalExam += ci.exam;
    grandTotal += ci.total;
  }

  return {
    controlled: Math.round((totalControlled / grandTotal) * 100),
    partial: Math.round((totalPartial / grandTotal) * 100),
    exam: Math.round((totalExam / grandTotal) * 100),
  };
}

// ============================================================
// RISK ENGINE
// ============================================================
export function riskAnalysis(subjectMarksMap, variation = 3) {
  const risks = [];

  for (const subject of SUBJECTS) {
    const entry = subjectMarksMap[subject.code];
    if (!entry || entry.total === null) continue;

    const maxMarks = getMaxMarks(subject.type);
    const currentPct = (entry.total / maxMarks) * 100;
    const currentGrade = getGradeFromPct(currentPct);
    const worstPct = currentPct - variation;
    const worstGrade = getGradeFromPct(worstPct);

    if (worstGrade.points < currentGrade.points) {
      const cpLoss = (currentGrade.points - worstGrade.points) * subject.credits;
      const sgpaLoss = Math.round((cpLoss / TOTAL_CREDITS) * 100) / 100;
      risks.push({
        subject,
        currentGrade,
        worstGrade,
        cpLoss,
        sgpaLoss,
        level: cpLoss >= 4 ? "HIGH" : cpLoss >= 2 ? "MEDIUM" : "LOW",
      });
    }
  }

  return risks.sort((a, b) => b.cpLoss - a.cpLoss);
}

// ============================================================
// SCENARIO ENGINE
// ============================================================
export function scenarioSGPA(gpForAll) {
  const totalCP = SUBJECTS.reduce((s, x) => s + gpForAll * x.credits, 0);
  return Math.round((totalCP / TOTAL_CREDITS) * 100) / 100;
}

export function SCENARIOS() {
  return [
    { label: "Best (All AA)", sgpa: scenarioSGPA(10) },
    { label: "All AB", sgpa: scenarioSGPA(9) },
    { label: "All BB", sgpa: scenarioSGPA(8) },
    { label: "All BC", sgpa: scenarioSGPA(7) },
    { label: "All CC", sgpa: scenarioSGPA(6) },
  ];
}

// ============================================================
// TARGET CALCULATOR (partial marks → what's left)
// ============================================================
export function targetCalculator(subject, enteredComponents, targetGrade) {
  const comps = getComponents(subject.type);
  const maxMarks = getMaxMarks(subject.type);
  const targetG = GRADE_SYSTEM.find(g => g.grade === targetGrade);
  if (!targetG) return null;

  const minTotal = Math.ceil((targetG.min / 100) * maxMarks);

  let secured = 0;
  let securedMax = 0;
  const pending = [];

  for (const c of comps) {
    const val = enteredComponents[c.key];
    if (val !== null && val !== undefined && val !== "") {
      secured += parseFloat(val);
      securedMax += c.max;
    } else {
      pending.push(c);
    }
  }

  const pendingMax = pending.reduce((s, c) => s + c.max, 0);
  const needed = minTotal - secured;
  const feasible = needed <= pendingMax && needed >= 0;

  return {
    targetGrade: targetG,
    minTotal,
    secured,
    securedMax,
    needed: Math.max(0, needed),
    pendingMax,
    pending,
    feasible,
    alreadyAchieved: secured >= minTotal,
  };
}
