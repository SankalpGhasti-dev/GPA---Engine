// ============================================================
// GENERIC SEMESTER ENGINE FACTORY
// Creates a complete calculation engine for any semester.
// Reuses GRADE_SYSTEM, collegeRound, getGradeFromPct from
// the legacy engine.js — does NOT modify engine.js.
// ============================================================

import { GRADE_SYSTEM, getGradeFromPct } from "./engine";

/**
 * Creates a semester-specific engine with all calculation functions.
 *
 * @param {Array}    subjects        — Subject definitions array
 * @param {number}   totalCredits    — Full semester credit total (denominator for SGPA)
 * @param {Function} getComponentsFn — (type) => component[] for this semester
 * @param {Function} getMaxMarksFn   — (type) => max marks for this semester
 * @returns {Object} Engine with all calculation functions
 */
export function createSemesterEngine(subjects, totalCredits, getComponentsFn, getMaxMarksFn) {

  // ── Compute Subject Result ────────────────────────────
  function computeSubject(subject, components) {
    const comps = getComponentsFn(subject.type);
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

    const maxMarks = getMaxMarksFn(subject.type);
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

  // ── SGPA Calculation ──────────────────────────────────
  function calcSGPA(subjectResults) {
    let totalCP = 0;
    for (const r of subjectResults) {
      if (r.creditPoints !== null && r.creditPoints !== undefined) {
        totalCP += r.creditPoints;
      }
    }
    if (subjectResults.length === 0) return null;
    return Math.round((totalCP / totalCredits) * 100) / 100;
  }

  // ── Reverse Engineering ───────────────────────────────
  function reverseEngineer(targetSGPA, lockedSubjects) {
    const targetCP = targetSGPA * totalCredits;

    let lockedCP = 0;
    const lockedCodes = new Set();

    for (const [code, result] of Object.entries(lockedSubjects)) {
      if (result && result.creditPoints !== null) {
        lockedCP += result.creditPoints;
        lockedCodes.add(code);
      }
    }

    const remainingSubjects = subjects.filter(s => !lockedCodes.has(s.code));
    const remainingCredits = remainingSubjects.reduce((s, x) => s + x.credits, 0);
    const neededCP = targetCP - lockedCP;
    const avgGPNeeded = remainingCredits > 0 ? neededCP / remainingCredits : 0;
    const feasible = avgGPNeeded <= 10 && avgGPNeeded >= 0;

    const subjectRequirements = remainingSubjects.map(s => {
      const recommendedGrade = GRADE_SYSTEM.find(g => g.points >= Math.ceil(avgGPNeeded))
        || GRADE_SYSTEM[GRADE_SYSTEM.length - 2];

      const maxMarks = getMaxMarksFn(s.type);
      const minMarksNeeded = Math.ceil((recommendedGrade.min / 100) * maxMarks);

      const comps = getComponentsFn(s.type);
      const compBreakdown = comps.map(c => ({
        ...c,
        minNeeded: Math.ceil((recommendedGrade.min / 100) * c.max),
      }));

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
        leverage: s.credits,
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

  // ── Grade Boundary Analysis ───────────────────────────
  function gradeBoundaryAnalysis(subjectMarksMap) {
    const opportunities = [];

    for (const subject of subjects) {
      const entry = subjectMarksMap[subject.code];
      if (!entry || entry.total === null) continue;

      const maxMarks = getMaxMarksFn(subject.type);
      const currentPct = (entry.total / maxMarks) * 100;
      const currentGrade = getGradeFromPct(currentPct);

      const currentIdx = GRADE_SYSTEM.findIndex(g => g.grade === currentGrade.grade);
      if (currentIdx <= 0) continue;

      const nextGrade = GRADE_SYSTEM[currentIdx - 1];
      const marksForNext = Math.ceil((nextGrade.min / 100) * maxMarks);
      const gap = marksForNext - entry.total;
      const gpGain = nextGrade.points - currentGrade.points;
      const creditPointGain = gpGain * subject.credits;

      if (gap > 0 && gap <= 10) {
        opportunities.push({
          subject,
          currentMarks: entry.total,
          currentGrade,
          nextGrade,
          gap,
          gpGain,
          creditPointGain,
          sgpaGain: Math.round((creditPointGain / totalCredits) * 100) / 100,
          priority: creditPointGain / gap,
        });
      }
    }

    return opportunities.sort((a, b) => b.priority - a.priority);
  }

  // ── Risk Analysis ─────────────────────────────────────
  function riskAnalysis(subjectMarksMap, variation = 3) {
    const risks = [];

    for (const subject of subjects) {
      const entry = subjectMarksMap[subject.code];
      if (!entry || entry.total === null) continue;

      const maxMarks = getMaxMarksFn(subject.type);
      const currentPct = (entry.total / maxMarks) * 100;
      const currentGrade = getGradeFromPct(currentPct);
      const worstPct = currentPct - variation;
      const worstGrade = getGradeFromPct(worstPct);

      if (worstGrade.points < currentGrade.points) {
        const cpLoss = (currentGrade.points - worstGrade.points) * subject.credits;
        const sgpaLoss = Math.round((cpLoss / totalCredits) * 100) / 100;
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

  // ── Credit Leverage Ranking ───────────────────────────
  function creditLeverageRanking() {
    return subjects.map(s => ({
      ...s,
      leveragePerGP: s.credits,
      maxPossibleCP: 10 * s.credits,
    })).sort((a, b) => b.leveragePerGP - a.leveragePerGP);
  }

  // ── Control Index ─────────────────────────────────────
  function controlIndex(type) {
    if (type === "theory100_ese") {
      // CA1(25) + CA2(25) = 50 controlled, ESE(50) = exam
      return { controlled: 50, partial: 0, exam: 50, total: 100 };
    }
    if (type === "theory50_ca25") {
      // CA1(25) + CA2(25) = fully controlled
      return { controlled: 50, partial: 0, exam: 0, total: 50 };
    }
    if (type === "lab_viva") {
      // CA1(15) + CA2(15) + Practical(50) = 80 controlled, Viva(20) = partial
      return { controlled: 80, partial: 20, exam: 0, total: 100 };
    }
    if (type === "custom_theory50") {
      return { controlled: 50, partial: 0, exam: 0, total: 50 };
    }
    return { controlled: 0, partial: 0, exam: 0, total: 0 };
  }

  function overallControlIndex() {
    let totalControlled = 0;
    let totalPartial = 0;
    let totalExam = 0;
    let grandTotal = 0;

    for (const s of subjects) {
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

  // ── Target Calculator ─────────────────────────────────
  function targetCalculator(subject, enteredComponents, targetGrade) {
    const comps = getComponentsFn(subject.type);
    const maxMarks = getMaxMarksFn(subject.type);
    const targetG = GRADE_SYSTEM.find(g => g.grade === targetGrade);
    if (!targetG) return null;

    const minTotal = Math.ceil((targetG.min / 100) * maxMarks);

    let secured = 0;
    const pending = [];

    for (const c of comps) {
      const val = enteredComponents[c.key];
      if (val !== null && val !== undefined && val !== "") {
        secured += parseFloat(val);
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
      needed: Math.max(0, needed),
      pendingMax,
      pending,
      feasible,
      alreadyAchieved: secured >= minTotal,
    };
  }

  // ── Scenario Engine ───────────────────────────────────
  function scenarioSGPA(gpForAll) {
    const totalCP = subjects.reduce((s, x) => s + gpForAll * x.credits, 0);
    return Math.round((totalCP / totalCredits) * 100) / 100;
  }

  function SCENARIOS() {
    return [
      { label: "Best (All AA)", sgpa: scenarioSGPA(10) },
      { label: "All AB", sgpa: scenarioSGPA(9) },
      { label: "All BB", sgpa: scenarioSGPA(8) },
      { label: "All BC", sgpa: scenarioSGPA(7) },
      { label: "All CC", sgpa: scenarioSGPA(6) },
    ];
  }

  // ── Return complete engine ────────────────────────────
  return {
    subjects,
    totalCredits,
    getComponents: getComponentsFn,
    getMaxMarks: getMaxMarksFn,
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
  };
}
