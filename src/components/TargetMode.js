import React, { useState, useMemo } from "react";
import {
  SUBJECTS, GRADE_SYSTEM, TOTAL_CREDITS,
  getComponents, getMaxMarks, reverseEngineer,
  overallControlIndex, SCENARIOS, creditLeverageRanking
} from "../data/engine";

const GRADE_COLORS = {
  AA: "#1b4332", AB: "#2d6a4f", BB: "#40916c",
  BC: "#52b788", CC: "#b7b7a4", CD: "#e07a5f", DD: "#c1121f", FF: "#6c1111"
};

export default function TargetMode() {
  const [targetSGPA, setTargetSGPA] = useState("");
  const [activeTab, setActiveTab] = useState("roadmap");

  const roadmap = useMemo(() => {
    const t = parseFloat(targetSGPA);
    if (!t || t <= 0 || t > 10) return null;
    return reverseEngineer(t, {});
  }, [targetSGPA]);

  const controlIdx = useMemo(() => overallControlIndex(), []);
  const scenarios = useMemo(() => SCENARIOS(), []);
  const leverage = useMemo(() => creditLeverageRanking(), []);

  return (
    <main className="mode-main">
      <div className="mode-header">
        <h2>Planning Mode — Full Semester Roadmap</h2>
        <p>Set your target SGPA. Get the complete blueprint for every subject.</p>
      </div>

      <div className="target-bar">
        <span className="target-bar-label">Target SGPA</span>
        <input
          type="number" min="0" max="10" step="0.1"
          placeholder="e.g. 9.0"
          value={targetSGPA}
          onChange={e => setTargetSGPA(e.target.value)}
          className="target-bar-input"
        />
        {roadmap && (
          <div className={`feasibility-inline ${roadmap.feasible ? "ok" : "fail"}`}>
            {roadmap.feasible
              ? `✓ Achievable — need avg ${roadmap.avgGPNeeded} GP per credit`
              : "✗ Target above 10 — not possible"}
          </div>
        )}
      </div>

      {/* Scenario strip always visible */}
      <div className="scenarios-strip">
        {scenarios.map(sc => (
          <div key={sc.label} className={`scenario-chip ${parseFloat(targetSGPA) <= sc.sgpa ? "sc-ok" : "sc-below"}`}>
            <div className="sc-sgpa-val">{sc.sgpa}</div>
            <div className="sc-sgpa-label">{sc.label}</div>
          </div>
        ))}
      </div>

      {!roadmap && (
        <div className="plan-empty">
          <div className="empty-icon">🎯</div>
          <p>Enter your target SGPA above to generate the full roadmap</p>
          <div className="grade-ref-table">
            <div className="grt-title">Grade Reference · {TOTAL_CREDITS} Total Credits</div>
            <table className="grade-table">
              <thead><tr><th>Marks ≥</th><th>Grade</th><th>GP</th><th>100-mark subject CP examples</th></tr></thead>
              <tbody>
                {GRADE_SYSTEM.map(g => (
                  <tr key={g.grade}>
                    <td>{g.min}%</td>
                    <td style={{ color: GRADE_COLORS[g.grade], fontWeight: 700 }}>{g.grade}</td>
                    <td>{g.points}</td>
                    <td style={{ color: "#888", fontSize: "0.75rem" }}>4cr={g.points * 4}cp · 2cr={g.points * 2}cp · 1cr={g.points}cp</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {roadmap && (
        <>
          <div className="tabs">
            {["roadmap", "components", "leverage", "control"].map(t => (
              <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
                {t === "roadmap" && "🗺️ Roadmap"}
                {t === "components" && "🔬 Component Breakdown"}
                {t === "leverage" && "⚡ Credit Leverage"}
                {t === "control" && "🎮 Control Index"}
              </button>
            ))}
          </div>

          {/* ROADMAP TAB */}
          {activeTab === "roadmap" && (
            <div>
              <div className="roadmap-summary">
                <div className="rs-stat">
                  <span>Target Credit Points</span>
                  <strong>{roadmap.targetCP}</strong>
                </div>
                <div className="rs-stat">
                  <span>Total Credits</span>
                  <strong>{TOTAL_CREDITS}</strong>
                </div>
                <div className="rs-stat">
                  <span>Avg GP Needed</span>
                  <strong>{roadmap.avgGPNeeded}</strong>
                </div>
                <div className="rs-stat">
                  <span>Subjects</span>
                  <strong>{SUBJECTS.length}</strong>
                </div>
              </div>

              <div className="req-grid">
                {roadmap.subjectRequirements.map((r, i) => (
                  <div key={r.code} className="req-card-full">
                    <div className="rcf-top">
                      <div className="rcf-rank">#{i + 1}</div>
                      <div className="rcf-info">
                        <div className="rcf-name">{r.name}</div>
                        <div className="rcf-meta">
                          <span className="pill credit">{r.credits} cr</span>
                          <span className={`pill type-${r.type}`}>{r.type}</span>
                        </div>
                      </div>
                      <div className="rcf-rec">
                        <div className="rcf-rec-label">Recommended</div>
                        <div className="rcf-grade" style={{ color: GRADE_COLORS[r.recommendedGrade.grade] }}>
                          {r.recommendedGrade.grade}
                        </div>
                        <div className="rcf-marks">≥ {r.minMarksNeeded}/{r.maxMarks}</div>
                      </div>
                    </div>

                    {/* All grade options */}
                    <div className="grade-ladder">
                      {r.gradeOptions.slice(0, 6).map(g => (
                        <div key={g.grade}
                          className={`gl-row ${g.grade === r.recommendedGrade.grade ? "gl-rec" : ""}`}>
                          <span className="gl-grade" style={{ color: GRADE_COLORS[g.grade] }}>{g.grade}</span>
                          <span className="gl-marks">≥ {g.marksNeeded}/{r.maxMarks}</span>
                          <span className="gl-cp">→ {g.creditPoints} cp</span>
                          <div className="gl-bar">
                            <div className="gl-fill" style={{ width: `${g.points * 10}%`, background: GRADE_COLORS[g.grade] }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COMPONENT BREAKDOWN TAB */}
          {activeTab === "components" && (
            <div className="comp-breakdown-section">
              <div className="section-intro">
                Minimum marks per component for your recommended grade in each subject
              </div>
              {roadmap.subjectRequirements.map(r => (
                <div key={r.code} className="comp-breakdown-card">
                  <div className="cbd-header">
                    <span className="cbd-name">{r.name}</span>
                    <span className="cbd-credits">{r.credits} cr</span>
                    <span className="cbd-target" style={{ color: GRADE_COLORS[r.recommendedGrade.grade] }}>
                      Target: {r.recommendedGrade.grade} (≥{r.minMarksNeeded}/{r.maxMarks})
                    </span>
                  </div>
                  <div className="cbd-comps">
                    {r.compBreakdown.map(c => (
                      <div key={c.key} className="cbd-comp">
                        <span className="cbd-comp-label">{c.label}</span>
                        <div className="cbd-comp-bar">
                          <div className="cbd-comp-fill"
                            style={{ width: `${(c.minNeeded / c.max) * 100}%` }} />
                        </div>
                        <span className="cbd-comp-val">≥ {c.minNeeded}/{c.max}</span>
                      </div>
                    ))}
                  </div>

                  {/* All grade component options */}
                  <details className="comp-all-grades">
                    <summary>See all grade options</summary>
                    <div className="cag-grid">
                      {r.gradeOptions.slice(0, 6).map(g => (
                        <div key={g.grade} className="cag-item">
                          <span className="cag-grade" style={{ color: GRADE_COLORS[g.grade] }}>{g.grade}</span>
                          <div className="cag-comps">
                            {g.compBreakdown.map(c => (
                              <span key={c.key} className="cag-comp">
                                {c.label}: ≥{c.minNeeded}/{c.max}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )}

          {/* LEVERAGE TAB */}
          {activeTab === "leverage" && (
            <div className="leverage-section">
              <div className="section-intro">
                Subjects ranked by how much each grade point improvement affects your SGPA. Focus here first.
              </div>
              {leverage.map((s, i) => (
                <div key={s.code} className="leverage-card">
                  <div className="lc-rank">#{i + 1}</div>
                  <div className="lc-info">
                    <div className="lc-name">{s.name}</div>
                    <div className="lc-meta">
                      <span className="pill credit">{s.credits} cr</span>
                      <span className={`pill type-${s.type}`}>{s.type}</span>
                    </div>
                  </div>
                  <div className="lc-stats">
                    <div className="lc-stat">
                      <span>+1 GP gain</span>
                      <strong>+{s.credits} credit pts</strong>
                    </div>
                    <div className="lc-stat">
                      <span>SGPA impact</span>
                      <strong>+{Math.round(s.credits / TOTAL_CREDITS * 100) / 100}</strong>
                    </div>
                    <div className="lc-stat">
                      <span>Max possible CP</span>
                      <strong>{s.maxPossibleCP}</strong>
                    </div>
                  </div>
                  <div className="lc-bar">
                    <div className="lc-fill" style={{ width: `${(s.credits / 4) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CONTROL INDEX TAB */}
          {activeTab === "control" && (
            <div className="control-section">
              <div className="control-hero">
                <div className="ch-val">{controlIdx.controlled}%</div>
                <div className="ch-label">of your SGPA is in your hands</div>
              </div>
              <div className="ci-bar big">
                <div className="ci-seg ci-controlled" style={{ width: `${controlIdx.controlled}%` }} />
                <div className="ci-seg ci-partial" style={{ width: `${controlIdx.partial}%` }} />
                <div className="ci-seg ci-exam" style={{ width: `${controlIdx.exam}%` }} />
              </div>
              <div className="ci-legend-full">
                <div className="clf-item"><span className="ci-dot controlled" />Student Controlled (CA1, CA2, Lab practicals): {controlIdx.controlled}%</div>
                <div className="clf-item"><span className="ci-dot partial" />Partially Controlled (Midsem): {controlIdx.partial}%</div>
                <div className="clf-item"><span className="ci-dot exam" />Exam Only (Endsem): {controlIdx.exam}%</div>
              </div>
              <div className="control-subject-list">
                {SUBJECTS.map(s => {
                  const comps = getComponents(s.type);
                  const controlled = comps.filter(c => c.key === "ca1" || c.key === "ca2").reduce((x, c) => x + c.max, 0);
                  const partial = comps.filter(c => c.key === "mse").reduce((x, c) => x + c.max, 0);
                  const exam = comps.filter(c => c.key === "endsem").reduce((x, c) => x + c.max, 0);
                  const total = getMaxMarks(s.type);
                  return (
                    <div key={s.code} className="cs-row">
                      <span className="cs-name">{s.name}</span>
                      <span className="pill credit">{s.credits} cr</span>
                      <div className="cs-bar">
                        <div className="ci-seg ci-controlled" style={{ width: `${(controlled / total) * 100}%` }} title={`Controlled: ${controlled}/${total}`} />
                        <div className="ci-seg ci-partial" style={{ width: `${(partial / total) * 100}%` }} title={`Partial: ${partial}/${total}`} />
                        <div className="ci-seg ci-exam" style={{ width: `${(exam / total) * 100}%` }} title={`Exam: ${exam}/${total}`} />
                      </div>
                      <span className="cs-pct">{Math.round((controlled / total) * 100)}% controlled</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
