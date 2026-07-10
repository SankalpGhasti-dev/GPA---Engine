import React, { useState, useMemo, useEffect, useRef } from "react";
import { getSemesterEngine } from "../../data/engineRegistry";
import { db, isFirebaseConfigured } from "../../firebase/config";
import { isLocalUser } from "../../firebase/localAuth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import Sem3MarksTab from "./Sem3MarksTab";
import Sem3DashboardTab from "./Sem3DashboardTab";
import Sem3BoundariesTab from "./Sem3BoundariesTab";
import Sem3RisksTab from "./Sem3RisksTab";
import Sem3RoadmapTab from "./Sem3RoadmapTab";
import Sem3BreakdownTab from "./Sem3BreakdownTab";
import Sem3LeverageTab from "./Sem3LeverageTab";
import Sem3ControlTab from "./Sem3ControlTab";
import "./Sem3Workspace.css";

export default function Sem3Workspace({ user, college, mode, onBack }) {
  const collegeId = college?.id || "sitcoe";
  const engine = useMemo(() => getSemesterEngine(collegeId, 3), [collegeId]);

  const {
    SUBJECTS, TOTAL_CREDITS, GRADE_SYSTEM, collegeRound,
    getComponents, getMaxMarks, computeSubject, calcSGPA,
    reverseEngineer, gradeBoundaryAnalysis, riskAnalysis,
    creditLeverageRanking, overallControlIndex, SCENARIOS, targetCalculator
  } = engine || {};

  const storageKeyMarks = `gpa-${collegeId}-sem3-marks`;
  const storageKeyTarget = `gpa-${collegeId}-sem3-target`;
  const storageKeyCustomNames = `gpa-${collegeId}-sem3-customNames`;

  // ── State ─────────────────────────────────────────────
  const [marks, setMarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKeyMarks) || "null") || {}; }
    catch { return {}; }
  });
  const [targetSGPA, setTargetSGPA] = useState(
    () => localStorage.getItem(storageKeyTarget) || ""
  );
  const [customNames, setCustomNames] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKeyCustomNames) || "null") || {}; }
    catch { return {}; }
  });
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [targetGradeMap, setTargetGradeMap] = useState({});
  const [activeTab, setActiveTab] = useState(mode === "marks" ? "subjects" : "roadmap");
  const [syncStatus, setSyncStatus] = useState("idle");
  const debounceRef = useRef(null);
  const isFirstLoad = useRef(true);

  // Re-load from local storage if college changes
  useEffect(() => {
    if (!isFirstLoad.current) {
      try {
        setMarks(JSON.parse(localStorage.getItem(storageKeyMarks) || "null") || {});
        setTargetSGPA(localStorage.getItem(storageKeyTarget) || "");
        setCustomNames(JSON.parse(localStorage.getItem(storageKeyCustomNames) || "null") || {});
      } catch (e) {
        setMarks({});
        setTargetSGPA("");
        setCustomNames({});
      }
    }
  }, [collegeId, storageKeyMarks, storageKeyTarget, storageKeyCustomNames]);

  // ── Firestore Load ────────────────────────────────────
  useEffect(() => {
    if (!user || isLocalUser(user) || !isFirebaseConfigured() || !db) {
      isFirstLoad.current = false;
      return;
    }
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "academic", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          // Ideally firestore schema should be college aware too, but sticking to existing structure
          // to avoid breaking existing users. If multiple colleges used, they overwrite each other in DB.
          const sem3 = data?.semesters?.["3"];
          if (sem3) {
            if (sem3.marks) {
              setMarks(sem3.marks);
              localStorage.setItem(storageKeyMarks, JSON.stringify(sem3.marks));
            }
            if (sem3.targetSGPA) {
              setTargetSGPA(sem3.targetSGPA);
              localStorage.setItem(storageKeyTarget, sem3.targetSGPA);
            }
            if (sem3.customNames) {
              setCustomNames(sem3.customNames);
              localStorage.setItem(storageKeyCustomNames, JSON.stringify(sem3.customNames));
            }
          }
        }
      } catch (err) {
        console.warn("Firestore load failed for Sem3, using localStorage.", err);
      } finally {
        isFirstLoad.current = false;
      }
    };
    load();
  }, [user, storageKeyMarks, storageKeyTarget, storageKeyCustomNames]);

  // ── Debounced Save ────────────────────────────────────
  useEffect(() => {
    if (isFirstLoad.current) return;
    localStorage.setItem(storageKeyMarks, JSON.stringify(marks));
    localStorage.setItem(storageKeyTarget, targetSGPA);
    localStorage.setItem(storageKeyCustomNames, JSON.stringify(customNames));

    if (!user || isLocalUser(user) || !isFirebaseConfigured() || !db) return;
    clearTimeout(debounceRef.current);
    setSyncStatus("saving");
    debounceRef.current = setTimeout(async () => {
      try {
        await setDoc(doc(db, "academic", user.uid), {
          semesters: {
            "3": {
              marks,
              targetSGPA,
              customNames,
              workflowMode: mode,
            }
          },
          updatedAt: serverTimestamp(),
        }, { merge: true });
        setSyncStatus("saved");
        setTimeout(() => setSyncStatus("idle"), 2000);
      } catch (err) {
        console.warn("Firestore save failed for Sem3.", err);
        setSyncStatus("error");
      }
    }, 1500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marks, targetSGPA, customNames, storageKeyMarks, storageKeyTarget, storageKeyCustomNames]);

  // ── Helpers ───────────────────────────────────────────
  const setComponent = (code, key, val) => {
    setMarks(prev => ({
      ...prev,
      [code]: { ...(prev[code] || {}), [key]: val }
    }));
  };

  const setCustomName = (code, name) => {
    setCustomNames(prev => ({ ...prev, [code]: name }));
  };

  const clearAll = () => {
    if (window.confirm("Clear all entered marks and target SGPA?")) {
      setMarks({});
      setTargetSGPA("");
      setCustomNames({});
      localStorage.removeItem(storageKeyMarks);
      localStorage.removeItem(storageKeyTarget);
      localStorage.removeItem(storageKeyCustomNames);
    }
  };

  // ── Computed Data ─────────────────────────────────────
  const subjectResults = useMemo(() => {
    if (!engine) return {};
    const results = {};
    for (const s of SUBJECTS) {
      const comps = marks[s.code] || {};
      results[s.code] = { ...computeSubject(s, comps), credits: s.credits, code: s.code };
    }
    return results;
  }, [marks, engine, SUBJECTS, computeSubject]);

  const liveSGPA = useMemo(() => {
    if (!engine) return null;
    const completed = SUBJECTS
      .filter(s => subjectResults[s.code]?.allEntered)
      .map(s => subjectResults[s.code]);
    if (completed.length === 0) return null;
    return calcSGPA(completed);
  }, [subjectResults, engine, SUBJECTS, calcSGPA]);

  const totalEnteredCP = useMemo(() => {
    if (!engine) return 0;
    return SUBJECTS.reduce((sum, s) => {
      const r = subjectResults[s.code];
      return sum + (r?.creditPoints || 0);
    }, 0);
  }, [subjectResults, engine, SUBJECTS]);

  const reverseResult = useMemo(() => {
    if (!engine) return null;
    const t = parseFloat(targetSGPA);
    if (!t || t <= 0 || t > 10) return null;
    const locked = {};
    for (const s of SUBJECTS) {
      const r = subjectResults[s.code];
      if (r?.allEntered && r.creditPoints !== null) {
        locked[s.code] = r;
      }
    }
    return reverseEngineer(t, locked);
  }, [targetSGPA, subjectResults, engine, SUBJECTS, reverseEngineer]);

  const boundaries = useMemo(() => {
    if (!engine) return [];
    const map = {};
    for (const s of SUBJECTS) {
      const r = subjectResults[s.code];
      if (r?.pct !== null) map[s.code] = { total: r.total, type: s.type };
    }
    return gradeBoundaryAnalysis(map);
  }, [subjectResults, engine, SUBJECTS, gradeBoundaryAnalysis]);

  const risks = useMemo(() => {
    if (!engine) return [];
    const map = {};
    for (const s of SUBJECTS) {
      const r = subjectResults[s.code];
      if (r?.pct !== null) map[s.code] = { total: r.total, type: s.type };
    }
    return riskAnalysis(map);
  }, [subjectResults, engine, SUBJECTS, riskAnalysis]);

  const controlIdx = useMemo(() => engine ? overallControlIndex() : 0, [engine, overallControlIndex]);
  const scenarios = useMemo(() => engine ? SCENARIOS() : [], [engine, SCENARIOS]);
  const leverage = useMemo(() => engine ? creditLeverageRanking() : [], [engine, creditLeverageRanking]);

  const roadmap = useMemo(() => {
    if (!engine) return null;
    const t = parseFloat(targetSGPA);
    if (!t || t <= 0 || t > 10) return null;
    return reverseEngineer(t, {});
  }, [targetSGPA, engine, reverseEngineer]);

  const hasAnyData = Object.keys(marks).some(k =>
    Object.values(marks[k] || {}).some(v => v !== "" && v !== undefined && v !== null)
  );

  // ── Tab Config ────────────────────────────────────────
  const marksTabs = [
    { key: "subjects", label: "📝 Marks Entry" },
    { key: "dashboard", label: "📊 Analytics" },
    { key: "boundaries", label: `🎯 Boundaries${boundaries.length > 0 ? ` (${boundaries.length})` : ""}` },
    { key: "risks", label: `⚠️ Risks${risks.length > 0 ? ` (${risks.length})` : ""}` },
  ];

  const planningTabs = [
    { key: "roadmap", label: "🗺️ Roadmap" },
    { key: "breakdown", label: "🔬 Breakdown" },
    { key: "leverage", label: "⚡ Leverage" },
    { key: "control", label: "🎮 Control" },
  ];

  const tabs = mode === "marks" ? marksTabs : planningTabs;

  // ── Resolve subject display names ─────────────────────
  const resolvedSubjects = useMemo(() => {
    if (!engine) return [];
    return SUBJECTS.map(s => ({
      ...s,
      displayName: s.isCustom && customNames[s.code] ? customNames[s.code] : s.name,
    }));
  }, [customNames, engine, SUBJECTS]);

  if (!engine) {
    return <div className="mode-main sem3-workspace">Semester 3 data not available for this college.</div>;
  }

  // ── Render ────────────────────────────────────────────
  return (
    <main className="mode-main sem3-workspace">
      <div className="mode-header">
        <div className="mode-header-row">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="logo-badge" style={{ fontSize: "0.7rem" }}>SEM III</span>
            <h2>{mode === "marks" ? "Reverse Engineering Mode" : "Planning Mode — Full Semester Roadmap"}</h2>
          </div>
          {syncStatus === "saving" && <span className="sync-badge saving">⟳ Saving…</span>}
          {syncStatus === "saved"  && <span className="sync-badge saved">✓ Saved</span>}
          {syncStatus === "error"  && <span className="sync-badge error">✗ Sync error</span>}
        </div>
        <p>
          {mode === "marks"
            ? "Enter your component marks. The engine tells you exactly what's left to hit your target."
            : "Set your target SGPA. Get the complete blueprint for every subject."
          }
        </p>
      </div>

      {/* Target SGPA Input */}
      <div className="target-bar">
        <span className="target-bar-label">Target SGPA</span>
        <input
          type="number" min="0" max="10" step="0.1"
          placeholder="e.g. 9.0"
          value={targetSGPA}
          onChange={e => setTargetSGPA(e.target.value)}
          className="target-bar-input"
        />
        {mode === "marks" && reverseResult && (
          <div className={`feasibility-inline ${reverseResult.feasible ? "ok" : "fail"}`}>
            {reverseResult.feasible
              ? `✓ Achievable — need avg ${reverseResult.avgGPNeeded} GP from remaining subjects`
              : "✗ Not achievable — reduce target"}
          </div>
        )}
        {mode === "planning" && roadmap && (
          <div className={`feasibility-inline ${roadmap.feasible ? "ok" : "fail"}`}>
            {roadmap.feasible
              ? `✓ Achievable — need avg ${roadmap.avgGPNeeded} GP per credit`
              : "✗ Target above 10 — not possible"}
          </div>
        )}
      </div>

      {/* Planning mode scenarios strip */}
      {mode === "planning" && (
        <div className="scenarios-strip">
          {scenarios.map(sc => (
            <div key={sc.label} className={`scenario-chip ${parseFloat(targetSGPA) <= sc.sgpa ? "sc-ok" : "sc-below"}`}>
              <div className="sc-sgpa-val">{sc.sgpa}</div>
              <div className="sc-sgpa-label">{sc.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`tab ${activeTab === t.key ? "active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Marks Mode Tabs ──────────────────────────── */}
      {activeTab === "subjects" && (
        <Sem3MarksTab
          subjects={resolvedSubjects}
          marks={marks}
          subjectResults={subjectResults}
          customNames={customNames}
          setComponent={setComponent}
          setCustomName={setCustomName}
          targetGradeMap={targetGradeMap}
          setTargetGradeMap={setTargetGradeMap}
          expandedSubject={expandedSubject}
          setExpandedSubject={setExpandedSubject}
          hasAnyData={hasAnyData}
          clearAll={clearAll}
          getComponents={getComponents}
          getMaxMarks={getMaxMarks}
          GRADE_SYSTEM={GRADE_SYSTEM}
          collegeRound={collegeRound}
          targetCalculator={targetCalculator}
        />
      )}

      {activeTab === "dashboard" && (
        <Sem3DashboardTab
          subjects={resolvedSubjects}
          subjectResults={subjectResults}
          liveSGPA={liveSGPA}
          targetSGPA={targetSGPA}
          totalEnteredCP={totalEnteredCP}
          reverseResult={reverseResult}
          controlIdx={controlIdx}
          scenarios={scenarios}
          totalCredits={TOTAL_CREDITS}
        />
      )}

      {activeTab === "boundaries" && (
        <Sem3BoundariesTab boundaries={boundaries} />
      )}

      {activeTab === "risks" && (
        <Sem3RisksTab risks={risks} hasAnyData={hasAnyData} />
      )}

      {/* ── Planning Mode Tabs ───────────────────────── */}
      {activeTab === "roadmap" && mode === "planning" && (
        <Sem3RoadmapTab
          roadmap={roadmap}
          subjects={resolvedSubjects}
          totalCredits={TOTAL_CREDITS}
          targetSGPA={targetSGPA}
          GRADE_SYSTEM={GRADE_SYSTEM}
        />
      )}

      {activeTab === "breakdown" && (
        <Sem3BreakdownTab roadmap={roadmap} />
      )}

      {activeTab === "leverage" && (
        <Sem3LeverageTab leverage={leverage} totalCredits={TOTAL_CREDITS} />
      )}

      {activeTab === "control" && (
        <Sem3ControlTab
          controlIdx={controlIdx}
          subjects={resolvedSubjects}
          getComponents={getComponents}
          getMaxMarks={getMaxMarks}
        />
      )}
    </main>
  );
}
