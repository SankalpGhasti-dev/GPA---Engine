import sem3Engine, {
  SUBJECTS,
  TOTAL_CREDITS,
  getComponents,
  getMaxMarks,
  computeSubject,
  calcSGPA,
  reverseEngineer,
  targetCalculator,
  controlIndex,
  overallControlIndex,
  GRADE_SYSTEM,
  collegeRound,
} from "./sem3Engine";
import { getSemesterEngine } from "./engineRegistry";
import dypatilSem3Engine from "./dypatil_sem3Engine";
import { SUBJECTS as SEM2_SUBJECTS, TOTAL_CREDITS as SEM2_TOTAL_CREDITS, getComponents as getSem2Components } from "./engine";

describe("SITCOE CSE Semester 3 Assessment Configuration", () => {
  test("Subject count and credit total match official requirements", () => {
    expect(SUBJECTS.length).toBe(13);
    expect(TOTAL_CREDITS).toBe(22);
  });

  test("Subject positions and codes are preserved and not reordered", () => {
    const expectedCodes = [
      "SEM3_MATH",
      "SEM3_DSA",
      "SEM3_CN",
      "SEM3_ENV",
      "SEM3_IPR",
      "SEM3_APT",
      "SEM3_LANG",
      "SEM3_MINI",
      "SEM3_DSA_LAB",
      "SEM3_CN_LAB",
      "SEM3_WT_LAB",
      "SEM3_MINOR",
      "SEM3_ELECTIVE",
    ];
    expect(SUBJECTS.map((s) => s.code)).toEqual(expectedCodes);
  });

  test("Subjects 1–3 (Theory) have CA1 /10, CA2 /10, MSE /30, ESE /50 (Total: 100)", () => {
    const subjects1to3 = SUBJECTS.slice(0, 3);
    for (const s of subjects1to3) {
      expect(s.credits).toBe(3);
      const comps = getComponents(s.type);
      expect(comps).toEqual([
        { key: "ca1", label: "CA1", max: 10 },
        { key: "ca2", label: "CA2", max: 10 },
        { key: "mse", label: "MSE", max: 30 },
        { key: "ese", label: "ESE", max: 50 },
      ]);
      expect(getMaxMarks(s.type)).toBe(100);
    }
  });

  test("Subjects 4–5 have CA1 /25, CA2 /25 (Total: 50) and NO MSE or ESE", () => {
    const subjects4to5 = SUBJECTS.slice(3, 5);
    for (const s of subjects4to5) {
      const comps = getComponents(s.type);
      expect(comps).toEqual([
        { key: "ca1", label: "CA1", max: 25 },
        { key: "ca2", label: "CA2", max: 25 },
      ]);
      expect(comps.some((c) => c.key === "mse")).toBe(false);
      expect(comps.some((c) => c.key === "ese")).toBe(false);
      expect(getMaxMarks(s.type)).toBe(50);
    }
  });

  test("Aptitude Skills I and Language Skills I (Subjects 6–7) have total 50 marks (CA1 /25, CA2 /25)", () => {
    const skills = [
      SUBJECTS.find((s) => s.code === "SEM3_APT"),
      SUBJECTS.find((s) => s.code === "SEM3_LANG"),
    ];
    for (const s of skills) {
      expect(s.credits).toBe(1);
      const comps = getComponents(s.type);
      expect(comps).toEqual([
        { key: "ca1", label: "CA1", max: 25 },
        { key: "ca2", label: "CA2", max: 25 },
      ]);
      expect(getMaxMarks(s.type)).toBe(50);
    }
  });

  test("Subjects 8–10 (Mini Project & Labs) have CA1 /15, CA2 /15, Oral/Viva /20 (Total: 50)", () => {
    const subjects8to10 = SUBJECTS.slice(7, 10);
    expect(subjects8to10.map((s) => s.code)).toEqual(["SEM3_MINI", "SEM3_DSA_LAB", "SEM3_CN_LAB"]);
    for (const s of subjects8to10) {
      expect(s.credits).toBe(1);
      const comps = getComponents(s.type);
      expect(comps).toEqual([
        { key: "ca1", label: "CA1", max: 15 },
        { key: "ca2", label: "CA2", max: 15 },
        { key: "viva", label: "Oral/Viva", max: 20 },
      ]);
      expect(getMaxMarks(s.type)).toBe(50);
    }
  });

  test("Subject 11 (WT Lab) has CA1 /15, CA2 /15, Oral/Viva /20 (Total: 50)", () => {
    const wtLab = SUBJECTS[10];
    expect(wtLab.code).toBe("SEM3_WT_LAB");
    expect(getComponents(wtLab.type)).toEqual([
      { key: "ca1", label: "CA1", max: 15 },
      { key: "ca2", label: "CA2", max: 15 },
      { key: "viva", label: "Oral/Viva", max: 20 },
    ]);
    expect(getMaxMarks(wtLab.type)).toBe(50);
  });

  test("Multidisciplinary Minor and Open Elective have CA1 /10, CA2 /10, MSE /30, ESE /50 (Total: 100)", () => {
    const electives = [
      SUBJECTS.find((s) => s.code === "SEM3_MINOR"),
      SUBJECTS.find((s) => s.code === "SEM3_ELECTIVE"),
    ];
    for (const el of electives) {
      expect(el.credits).toBe(2);
      expect(el.isCustom).toBe(true);
      const comps = getComponents(el.type);
      expect(comps).toEqual([
        { key: "ca1", label: "CA1", max: 10 },
        { key: "ca2", label: "CA2", max: 10 },
        { key: "mse", label: "MSE", max: 30 },
        { key: "ese", label: "ESE", max: 50 },
      ]);
      expect(getMaxMarks(el.type)).toBe(100);
    }
  });
});

describe("SITCOE CSE Semester 3 Calculation Engine", () => {
  test("computeSubject correctly handles empty, partial, and full marks", () => {
    const mathSub = SUBJECTS[0];

    // Empty marks
    const emptyResult = computeSubject(mathSub, {});
    expect(emptyResult.total).toBe(0);
    expect(emptyResult.maxEntered).toBe(0);
    expect(emptyResult.pct).toBeNull();
    expect(emptyResult.gradeInfo).toBeNull();
    expect(emptyResult.creditPoints).toBeNull();
    expect(emptyResult.allEntered).toBe(false);
    expect(emptyResult.partial).toBe(false);

    // Partial marks (CA1, CA2, MSE entered; ESE missing)
    const partialResult = computeSubject(mathSub, { ca1: 10, ca2: 9, mse: 26 });
    expect(partialResult.total).toBe(45);
    expect(partialResult.maxEntered).toBe(50);
    expect(partialResult.pct).toBe(45);
    expect(partialResult.allEntered).toBe(false);
    expect(partialResult.partial).toBe(true);

    // Full marks
    const fullResult = computeSubject(mathSub, { ca1: 10, ca2: 10, mse: 28, ese: 47 });
    expect(fullResult.total).toBe(95);
    expect(fullResult.maxEntered).toBe(100);
    expect(fullResult.pct).toBe(95);
    expect(fullResult.gradeInfo.grade).toBe("AA");
    expect(fullResult.creditPoints).toBe(30); // 10 GP * 3 cr
    expect(fullResult.allEntered).toBe(true);
    expect(fullResult.partial).toBe(false);
  });

  test("calcSGPA calculates weighted SGPA over full 22 semester credits", () => {
    // When only completed subjects are passed
    const mathResult = { creditPoints: 30, credits: 3 }; // AA -> 10 * 3
    const dsaResult = { creditPoints: 27, credits: 3 };  // AB -> 9 * 3
    // 57 / 22 = 2.59
    expect(calcSGPA([mathResult, dsaResult])).toBe(2.59);

    // All subjects completed with AA (10 GP)
    const allAAResults = SUBJECTS.map((s) => ({ creditPoints: 10 * s.credits, credits: s.credits }));
    expect(calcSGPA(allAAResults)).toBe(10.00);
  });

  test("Target Grade Calculator correctly accounts for MSE marks", () => {
    const mathSub = SUBJECTS[0]; // theory100_ese: CA1(10), CA2(10), MSE(30), ESE(50)

    // Scenario 1: User has CA1=9, CA2=8, MSE=25 (Total secured = 42).
    // Target grade AA (min 90%). Min total needed = 90.
    // Needed from ESE = 90 - 42 = 48. ESE max is 50.
    const resAA = targetCalculator(mathSub, { ca1: 9, ca2: 8, mse: 25 }, "AA");
    expect(resAA.secured).toBe(42);
    expect(resAA.minTotal).toBe(90);
    expect(resAA.needed).toBe(48);
    expect(resAA.pendingMax).toBe(50);
    expect(resAA.feasible).toBe(true);
    expect(resAA.alreadyAchieved).toBe(false);
    expect(resAA.pending.map((p) => p.key)).toEqual(["ese"]);

    // Scenario 2: Target grade AB (min 80%). Min total needed = 80.
    // Needed from ESE = 80 - 42 = 38.
    const resAB = targetCalculator(mathSub, { ca1: 9, ca2: 8, mse: 25 }, "AB");
    expect(resAB.needed).toBe(38);
    expect(resAB.feasible).toBe(true);

    // Scenario 3: Poor early marks: CA1=3, CA2=3, MSE=10 (Total secured = 16).
    // Target AA (min 90): Needed = 90 - 16 = 74 > 50 (ESE max) -> infeasible.
    const resInfeasible = targetCalculator(mathSub, { ca1: 3, ca2: 3, mse: 10 }, "AA");
    expect(resInfeasible.needed).toBe(74);
    expect(resInfeasible.feasible).toBe(false);

    // Scenario 4: Already achieved: CA1=10, CA2=10, MSE=30, ESE=45 (Total = 95).
    const resAchieved = targetCalculator(mathSub, { ca1: 10, ca2: 10, mse: 30, ese: 45 }, "AA");
    expect(resAchieved.alreadyAchieved).toBe(true);
    expect(resAchieved.needed).toBe(0);
  });

  test("Reverse Engineering Calculator accounts for MSE in component breakdowns", () => {
    const rev = reverseEngineer(9.0, {});
    expect(rev.targetCP).toBe(198.0); // 9.0 * 22
    expect(rev.remainingCredits).toBe(22);
    expect(rev.feasible).toBe(true);

    const mathReq = rev.subjectRequirements.find((r) => r.code === "SEM3_MATH");
    expect(mathReq.maxMarks).toBe(100);
    const mseComp = mathReq.compBreakdown.find((c) => c.key === "mse");
    expect(mseComp).toBeDefined();
    expect(mseComp.max).toBe(30);
    // For AB (80%), minNeeded is ceil(0.8 * 30) = 24
    // For AA (90%), minNeeded is ceil(0.9 * 30) = 27
    expect(mseComp.minNeeded).toBeGreaterThanOrEqual(24);
  });

  test("Control Index accurately reflects MSE (partial 30) and corrected lab_viva (50 total)", () => {
    const ciTheory100 = controlIndex("theory100_ese");
    expect(ciTheory100).toEqual({ controlled: 20, partial: 30, exam: 50, total: 100 });

    const ciLab = controlIndex("lab_viva");
    expect(ciLab).toEqual({ controlled: 30, partial: 20, exam: 0, total: 50 });

    const ciTheory50 = controlIndex("theory50_ca25");
    expect(ciTheory50).toEqual({ controlled: 50, partial: 0, exam: 0, total: 50 });

    const overall = overallControlIndex();
    expect(overall).toEqual({
      controlled: 47,
      partial: 26,
      exam: 28,
    });
    expect(overall.controlled + overall.partial + overall.exam).toBeGreaterThanOrEqual(99);
    expect(overall.controlled + overall.partial + overall.exam).toBeLessThanOrEqual(101);
  });
});

describe("Multi-College and Legacy Semester Protection", () => {
  test("D.Y. Patil Semester 3 engine and subjects remain completely unchanged", () => {
    const dypEngine = getSemesterEngine("dypatil-kolhapur", 3);
    expect(dypEngine.subjects.length).toBe(8);
    expect(dypEngine.totalCredits).toBe(24);

    const dypTheory = dypEngine.subjects[0];
    const dypComps = dypEngine.getComponents(dypTheory.type);
    expect(dypComps).toEqual([
      { key: "fet", label: "FET", max: 20 },
      { key: "mse", label: "MSE", max: 30 },
      { key: "ese", label: "ESE", max: 50 },
    ]);
  });

  test("SITCOE Semester 2 engine remains completely untouched", () => {
    expect(SEM2_SUBJECTS.length).toBe(14);
    expect(SEM2_TOTAL_CREDITS).toBe(21);
    expect(SEM2_SUBJECTS[0].code).toBe("23CS1201");
    const sem2Comps = getSem2Components("theory100");
    expect(sem2Comps).toEqual([
      { key: "ca1", label: "CA1", max: 10 },
      { key: "ca2", label: "CA2", max: 10 },
      { key: "mse", label: "Midsem", max: 30 },
      { key: "endsem", label: "Endsem", max: 50 },
    ]);
  });
});
