import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  SUBJECTS, GRADE_SYSTEM, TOTAL_CREDITS,
  getComponents, getMaxMarks, computeSubject,
  calcSGPA, reverseEngineer, gradeBoundaryAnalysis,
  riskAnalysis, overallControlIndex, targetCalculator,
  collegeRound, SCENARIOS
} from "../data/engine";
import { db, isFirebaseConfigured } from "../firebase/config";
import { isLocalUser } from "../firebase/localAuth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const GRADE_COLORS = {
  AA: "#1b4332", AB: "#2d6a4f", BB: "#40916c",
  BC: "#52b788", CC: "#b7b7a4", CD: "#e07a5f", DD: "#c1121f", FF: "#6c1111"
};

function GradeChip({ grade, size = "sm" }) {
  if (!grade) return null;
  return (
    <span className={`grade-chip grade-chip-${size}`} style={{ background: GRADE_COLORS[grade.grade] || "#888" }}>
      {grade.grade} · {grade.points}
    </span>
  );
}

export default function MarksMode({ user }) {
  const [marks, setMarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("gpa-marks") || "null") || {}; }
    catch { return {}; }
  });
  const [targetSGPA, setTargetSGPA] = useState(
    () => localStorage.getItem("gpa-target") || ""
  );
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [targetGradeMap, setTargetGradeMap] = useState({});
  const [activeTab, setActiveTab] = useState("subjects");
  const [syncStatus, setSyncStatus] = useState("idle"); // 'idle'|'saving'|'saved'|'error'
  const debounceRef = useRef(null);
  const isFirstLoad = useRef(true);

  // ── Load from Firestore on mount ──────────────────────
  useEffect(() => {
    if (!user || isLocalUser(user) || !isFirebaseConfigured() || !db) {
      isFirstLoad.current = false;
      return;
    }
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "marks", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          if (data.gpa_marks) {
            setMarks(data.gpa_marks);
            localStorage.setItem("gpa-marks", JSON.stringify(data.gpa_marks));
          }
          if (data.gpa_target) {
            setTargetSGPA(data.gpa_target);
            localStorage.setItem("gpa-target", data.gpa_target);
          }
        }
      } catch (err) {
        console.warn("Firestore load failed, using localStorage.", err);
      } finally {
        isFirstLoad.current = false;
      }
    };
    load();
  }, [user]);

  // ── Debounced Firestore write on marks/target change ──
  useEffect(() => {
    // Skip the very first render after load to avoid overwriting Firestore with stale localStorage
    if (isFirstLoad.current) return;
    localStorage.setItem("gpa-marks", JSON.stringify(marks));
    localStorage.setItem("gpa-target", targetSGPA);
    if (!user || isLocalUser(user) || !isFirebaseConfigured() || !db) return;
    clearTimeout(debounceRef.current);
    setSyncStatus("saving");
    debounceRef.current = setTimeout(async () => {
      try {
        await setDoc(doc(db, "marks", user.uid), {
          gpa_marks: marks,
          gpa_target: targetSGPA,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        setSyncStatus("saved");
        setTimeout(() => setSyncStatus("idle"), 2000);
      } catch (err) {
        console.warn("Firestore save failed.", err);
        setSyncStatus("error");
      }
    }, 1500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marks, targetSGPA]);

  const clearAll = () => {
    if (window.confirm("Clear all entered marks and target SGPA?")) {
      setMarks({});
      setTargetSGPA("");
      localStorage.removeItem("gpa-marks");
      localStorage.removeItem("gpa-target");
    }
  };

  const setComponent = (code, key, val) => {
    setMarks(prev => ({
      ...prev,
      [code]: { ...(prev[code] || {}), [key]: val }
    }));
  };

  // Compute all subject results
  const subjectResults = useMemo(() => {
    const results = {};
    for (const s of SUBJECTS) {
      const comps = marks[s.code] || {};
      results[s.code] = { ...computeSubject(s, comps), credits: s.credits, code: s.code };
    }
    return results;
  }, [marks]);

  // Live SGPA from fully entered subjects
  const liveSGPA = useMemo(() => {
    const completed = SUBJECTS
      .filter(s => subjectResults[s.code]?.allEntered)
      .map(s => subjectResults[s.code]);
    if (completed.length === 0) return null;
    return calcSGPA(completed);
  }, [subjectResults]);

  const totalEnteredCP = useMemo(() => {
    return SUBJECTS.reduce((sum, s) => {
      const r = subjectResults[s.code];
      return sum + (r?.creditPoints || 0);
    }, 0);
  }, [subjectResults]);

  // Reverse engineering
  const reverseResult = useMemo(() => {
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
  }, [targetSGPA, subjectResults]);

  // Boundary analysis
  const boundaries = useMemo(() => {
    const map = {};
    for (const s of SUBJECTS) {
      const r = subjectResults[s.code];
      if (r?.pct !== null) map[s.code] = { total: r.total, type: s.type };
    }
    return gradeBoundaryAnalysis(map);
  }, [subjectResults]);

  // Risk analysis
  const risks = useMemo(() => {
    const map = {};
    for (const s of SUBJECTS) {
      const r = subjectResults[s.code];
      if (r?.pct !== null) map[s.code] = { total: r.total, type: s.type };
    }
    return riskAnalysis(map);
  }, [subjectResults]);

  const controlIdx = useMemo(() => overallControlIndex(), []);
  const scenarios = useMemo(() => SCENARIOS(), []);

  const hasAnyData = Object.keys(marks).some(k =>
    Object.values(marks[k] || {}).some(v => v !== "" && v !== undefined && v !== null)
  );

  return (
    <main className="mode-main">
      <div className="mode-header">
        <div className="mode-header-row">
          <h2>Reverse Engineering Mode</h2>
          {syncStatus === "saving" && <span className="sync-badge saving">⟳ Saving…</span>}
          {syncStatus === "saved"  && <span className="sync-badge saved">✓ Saved</span>}
          {syncStatus === "error"  && <span className="sync-badge error">✗ Sync error</span>}
        </div>
        <p>Enter your component marks. The engine tells you exactly what's left to hit your target.</p>
      </div>

      {/* TARGET INPUT */}
      <div className="target-bar">
        <span className="target-bar-label">Target SGPA</span>
        <input
          type="number" min="0" max="10" step="0.1"
          placeholder="e.g. 9.0"
          value={targetSGPA}
          onChange={e => setTargetSGPA(e.target.value)}
          className="target-bar-input"
        />
        {reverseResult && (
          <div className={`feasibility-inline ${reverseResult.feasible ? "ok" : "fail"}`}>
            {reverseResult.feasible
              ? `✓ Achievable — need avg ${reverseResult.avgGPNeeded} GP from remaining subjects`
              : "✗ Not achievable — reduce target"}
          </div>
        )}
      </div>

      {/* TABS */}
      <div className="tabs">
        {["subjects", "dashboard", "boundaries", "risks"].map(t => (
          <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
            {t === "subjects" && "📝 Marks Entry"}
            {t === "dashboard" && "📊 Dashboard"}
            {t === "boundaries" && `🎯 Boundaries ${boundaries.length > 0 ? `(${boundaries.length})` : ""}`}
            {t === "risks" && `⚠️ Risks ${risks.length > 0 ? `(${risks.length})` : ""}`}
          </button>
        ))}
      </div>

      {/* SUBJECTS TAB */}
      {activeTab === "subjects" && (
        <div className="subjects-section">
          {/* PROGRESS BAR */}
          <div className="progress-header">
            <div className="progress-stats">
              <span className="prog-done">{SUBJECTS.filter(s => subjectResults[s.code]?.allEntered).length} complete</span>
              <span className="prog-sep">·</span>
              <span className="prog-partial">{SUBJECTS.filter(s => subjectResults[s.code]?.partial).length} partial</span>
              <span className="prog-sep">·</span>
              <span className="prog-empty">{SUBJECTS.filter(s => !subjectResults[s.code]?.allEntered && !subjectResults[s.code]?.partial).length} empty</span>
              <span className="prog-sep">·</span>
              <span className="prog-total">{SUBJECTS.length} total</span>
            </div>
            <div className="progress-actions">
              {hasAnyData && (
                <button className="clear-btn" onClick={clearAll}>↺ Clear All</button>
              )}
            </div>
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-bar">
              <div className="pb-done" style={{ width: `${(SUBJECTS.filter(s => subjectResults[s.code]?.allEntered).length / SUBJECTS.length) * 100}%` }} />
              <div className="pb-partial" style={{ width: `${(SUBJECTS.filter(s => subjectResults[s.code]?.partial).length / SUBJECTS.length) * 100}%` }} />
            </div>
          </div>
          <div className="subjects-list">
          {SUBJECTS.map(subject => {
            const comps = getComponents(subject.type);
            const result = subjectResults[subject.code];
            const isExpanded = expandedSubject === subject.code;
            const enteredComps = marks[subject.code] || {};
            const tg = targetGradeMap[subject.code] || "AB";
            const tcResult = targetCalculator(subject, enteredComps, tg);

            return (
              <div key={subject.code} className={`subject-card ${result?.allEntered ? "complete" : result?.partial ? "partial" : ""}`}>
                <div className="subject-card-header" onClick={() => setExpandedSubject(isExpanded ? null : subject.code)}>
                  <div className="sc-left">
                    <span className="sc-code">{subject.code}</span>
                    <span className="sc-name">{subject.name}</span>
                    <div className="sc-meta">
                      <span className="pill credit">{subject.credits} cr</span>
                      <span className={`pill type-${subject.type}`}>{subject.type}</span>
                      <span className="pill max">/{getMaxMarks(subject.type)}</span>
                    </div>
                  </div>
                  <div className="sc-right">
                    {result?.pct !== null && (
                      <>
                        <span className="sc-pct">{collegeRound(result.pct)}%</span>
                        <GradeChip grade={result.gradeInfo} />
                        <span className="sc-cp">{result.creditPoints} cp</span>
                      </>
                    )}
                    <span className="expand-icon">{isExpanded ? "▲" : "▼"}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="subject-card-body">
                    <div className="comp-grid">
                      {comps.map(c => (
                        <div key={c.key} className="comp-input-block">
                          <label className="comp-label">{c.label} <span className="comp-max">/{c.max}</span></label>
                          <input
                            type="number" min="0" max={c.max}
                            placeholder="—"
                            value={enteredComps[c.key] ?? ""}
                            onChange={e => setComponent(subject.code, c.key, e.target.value === "" ? "" : Math.min(c.max, Math.max(0, parseFloat(e.target.value))))}
                            className="comp-input"
                          />
                        </div>
                      ))}
                    </div>

                    {result?.pct !== null && (
                      <div className="result-row">
                        <div className="result-item">
                          <span className="ri-label">Total</span>
                          <span className="ri-val">{result.total}/{getMaxMarks(subject.type)}</span>
                        </div>
                        <div className="result-item">
                          <span className="ri-label">Percentage</span>
                          <span className="ri-val">{collegeRound(result.pct)}%</span>
                        </div>
                        <div className="result-item">
                          <span className="ri-label">Grade</span>
                          <GradeChip grade={result.gradeInfo} size="md" />
                        </div>
                        <div className="result-item">
                          <span className="ri-label">Credit Points</span>
                          <span className="ri-val">{result.creditPoints}</span>
                        </div>
                      </div>
                    )}

                    {/* Target Calculator */}
                    <div className="target-calc-block">
                      <div className="tc-header">
                        <span className="tc-label">Target Grade Calculator</span>
                        <select
                          value={tg}
                          onChange={e => setTargetGradeMap(prev => ({ ...prev, [subject.code]: e.target.value }))}
                          className="tc-select"
                        >
                          {GRADE_SYSTEM.slice(0, 6).map(g => (
                            <option key={g.grade} value={g.grade}>{g.grade} ({g.points} GP)</option>
                          ))}
                        </select>
                      </div>
                      {tcResult && (
                        <div className={`tc-result ${tcResult.alreadyAchieved ? "achieved" : tcResult.feasible ? "feasible" : "infeasible"}`}>
                          {tcResult.alreadyAchieved
                            ? `✓ Already achieved ${tg} with ${tcResult.secured}/${tcResult.minTotal} marks secured`
                            : tcResult.feasible
                              ? `Need ${tcResult.needed}/${tcResult.pendingMax} from ${tcResult.pending.map(p => p.label).join(" + ")}`
                              : `✗ Not possible — only ${tcResult.pendingMax} marks left, need ${tcResult.needed}`
                          }
                        </div>
                      )}

                      {/* All grade options */}
                      <div className="grade-options-grid">
                        {GRADE_SYSTEM.slice(0, 6).map(g => {
                          const maxM = getMaxMarks(subject.type);
                          const minM = Math.ceil((g.min / 100) * maxM);
                          const alreadyHave = result?.total || 0;
                          const stillNeed = Math.max(0, minM - alreadyHave);
                          const pendingMaxM = comps
                            .filter(c => !enteredComps[c.key] && enteredComps[c.key] !== 0)
                            .reduce((s, c) => s + c.max, 0);
                          const possible = stillNeed <= pendingMaxM;
                          return (
                            <div key={g.grade} className={`go-item ${!possible && alreadyHave > 0 ? "go-impossible" : ""}`}>
                              <span className="go-grade" style={{ color: GRADE_COLORS[g.grade] }}>{g.grade}</span>
                              <span className="go-marks">≥{minM}/{maxM}</span>
                              <span className="go-cp">{g.points * subject.credits}cp</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </div>
      )}


      {/* DASHBOARD TAB */}
      {activeTab === "dashboard" && (
        <div className="dashboard-grid">
          {/* SGPA Summary */}
          <div className="dash-card span2">
            <div className="dash-card-title">SGPA Overview</div>
            <div className="sgpa-overview">
              <div className="sgpa-block">
                <div className="sgpa-label">Current SGPA</div>
                <div className="sgpa-val">{liveSGPA ?? "—"}</div>
                <div className="sgpa-sub">from {SUBJECTS.filter(s => subjectResults[s.code]?.allEntered).length} complete subjects</div>
              </div>
              <div className="sgpa-block">
                <div className="sgpa-label">Target SGPA</div>
                <div className="sgpa-val target">{targetSGPA || "—"}</div>
                <div className="sgpa-sub">set above</div>
              </div>
              <div className="sgpa-block">
                <div className="sgpa-label">Credit Points Secured</div>
                <div className="sgpa-val">{totalEnteredCP}</div>
                <div className="sgpa-sub">of {10 * TOTAL_CREDITS} max</div>
              </div>
              <div className="sgpa-block">
                <div className="sgpa-label">Still Needed</div>
                <div className="sgpa-val warn">{reverseResult ? Math.max(0, reverseResult.neededCP) : "—"}</div>
                <div className="sgpa-sub">credit points</div>
              </div>
            </div>
          </div>

          {/* Scenarios */}
          <div className="dash-card">
            <div className="dash-card-title">Scenario Reference</div>
            {scenarios.map(sc => (
              <div key={sc.label} className={`scenario-row ${parseFloat(targetSGPA) <= sc.sgpa ? "sc-reachable" : ""}`}>
                <span>{sc.label}</span>
                <span className="sc-val">{sc.sgpa}</span>
              </div>
            ))}
          </div>

          {/* Control Index */}
          <div className="dash-card">
            <div className="dash-card-title">Control Index</div>
            <div className="ci-bar-wrap">
              <div className="ci-bar">
                <div className="ci-seg ci-controlled" style={{ width: `${controlIdx.controlled}%` }} title={`Controlled: ${controlIdx.controlled}%`} />
                <div className="ci-seg ci-partial" style={{ width: `${controlIdx.partial}%` }} title={`Partial: ${controlIdx.partial}%`} />
                <div className="ci-seg ci-exam" style={{ width: `${controlIdx.exam}%` }} title={`Exam: ${controlIdx.exam}%`} />
              </div>
            </div>
            <div className="ci-legend">
              <span className="ci-dot controlled" />You control {controlIdx.controlled}%
            </div>
            <div className="ci-legend">
              <span className="ci-dot partial" />Partial {controlIdx.partial}%
            </div>
            <div className="ci-legend">
              <span className="ci-dot exam" />Exam only {controlIdx.exam}%
            </div>
          </div>

          {/* Credit Leverage */}
          <div className="dash-card span2">
            <div className="dash-card-title">Credit Leverage Ranking — Most valuable subjects</div>
            <div className="leverage-list">
              {SUBJECTS.slice().sort((a, b) => b.credits - a.credits).map((s, i) => (
                <div key={s.code} className="leverage-row">
                  <span className="lev-rank">#{i + 1}</span>
                  <span className="lev-name">{s.name}</span>
                  <span className="lev-credits">{s.credits} cr</span>
                  <div className="lev-bar">
                    <div className="lev-fill" style={{ width: `${(s.credits / 4) * 100}%` }} />
                  </div>
                  <span className="lev-note">+1 GP = +{s.credits} credit pts = +{Math.round(s.credits / TOTAL_CREDITS * 100) / 100} SGPA</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reverse Engineering Results */}
          {reverseResult && reverseResult.subjectRequirements.length > 0 && (
            <div className="dash-card span2">
              <div className="dash-card-title">Required Marks for Target SGPA {targetSGPA}</div>
              <div className="req-grid">
                {reverseResult.subjectRequirements.map(r => (
                  <div key={r.code} className="req-card">
                    <div className="req-name">{r.name}</div>
                    <div className="req-meta">
                      <span className="pill credit">{r.credits} cr</span>
                      <span className="req-rec" style={{ color: GRADE_COLORS[r.recommendedGrade.grade] }}>
                        Need {r.recommendedGrade.grade}
                      </span>
                    </div>
                    <div className="req-marks">≥ {r.minMarksNeeded}/{r.maxMarks} marks</div>
                    <div className="req-comps">
                      {r.compBreakdown.map(c => (
                        <span key={c.key} className="req-comp">
                          {c.label}: ≥{c.minNeeded}/{c.max}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* BOUNDARIES TAB */}
      {activeTab === "boundaries" && (
        <div className="boundaries-section">
          {boundaries.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎯</div>
              <p>Enter marks first. The engine will show which subjects are close to a grade upgrade.</p>
            </div>
          ) : (
            <>
              <div className="section-intro">Subjects within 10 marks of the next grade — ranked by ROI (credit points gained per mark invested)</div>
              {boundaries.map((b, i) => (
                <div key={b.subject.code} className={`boundary-card priority-${b.level || (i === 0 ? "high" : "med")}`}>
                  <div className="bc-rank">#{i + 1}</div>
                  <div className="bc-info">
                    <div className="bc-name">{b.subject.name}</div>
                    <div className="bc-meta">
                      <span className="pill credit">{b.subject.credits} cr</span>
                      <span>Current: <strong style={{ color: GRADE_COLORS[b.currentGrade.grade] }}>{b.currentGrade.grade}</strong></span>
                      <span>→ Next: <strong style={{ color: GRADE_COLORS[b.nextGrade.grade] }}>{b.nextGrade.grade}</strong></span>
                    </div>
                  </div>
                  <div className="bc-numbers">
                    <div className="bc-stat">
                      <span>Gap</span>
                      <strong>+{b.gap} marks</strong>
                    </div>
                    <div className="bc-stat">
                      <span>GP Gain</span>
                      <strong>+{b.gpGain}</strong>
                    </div>
                    <div className="bc-stat">
                      <span>Credit Pts Gain</span>
                      <strong>+{b.creditPointGain}</strong>
                    </div>
                    <div className="bc-stat highlight">
                      <span>SGPA Gain</span>
                      <strong>+{b.sgpaGain}</strong>
                    </div>
                  </div>
                  <div className="bc-alert">
                    {b.creditPointGain >= 4 ? "🔥 HIGH ROI" : b.creditPointGain >= 2 ? "⚡ MEDIUM ROI" : "📌 LOW ROI"}
                    — just {b.gap} mark{b.gap > 1 ? "s" : ""} away from +{b.sgpaGain} SGPA
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* RISKS TAB */}
      {activeTab === "risks" && (
        <div className="risks-section">
          {risks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <p>{hasAnyData ? "No grade drop risks detected with ±3 mark variation." : "Enter marks first to see risk analysis."}</p>
            </div>
          ) : (
            <>
              <div className="section-intro">Subjects where a ±3 mark variation could drop your grade — ranked by impact</div>
              {risks.map((r, i) => (
                <div key={r.subject.code} className={`risk-card risk-${r.level.toLowerCase()}`}>
                  <div className="risk-level-badge">{r.level}</div>
                  <div className="risk-info">
                    <div className="risk-name">{r.subject.name}</div>
                    <div className="risk-grades">
                      <span style={{ color: GRADE_COLORS[r.currentGrade.grade] }}>{r.currentGrade.grade}</span>
                      <span className="risk-arrow">→ could drop to →</span>
                      <span style={{ color: GRADE_COLORS[r.worstGrade.grade] }}>{r.worstGrade.grade}</span>
                    </div>
                  </div>
                  <div className="risk-numbers">
                    <div className="bc-stat">
                      <span>CP Loss</span>
                      <strong>-{r.cpLoss}</strong>
                    </div>
                    <div className="bc-stat">
                      <span>SGPA Loss</span>
                      <strong>-{r.sgpaLoss}</strong>
                    </div>
                    <div className="bc-stat">
                      <span>Credits</span>
                      <strong>{r.subject.credits}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </main>
  );
}
