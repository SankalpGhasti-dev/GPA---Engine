import React from "react";

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

export default function Sem3MarksTab({
  subjects, marks, subjectResults, customNames,
  setComponent, setCustomName,
  targetGradeMap, setTargetGradeMap,
  expandedSubject, setExpandedSubject,
  hasAnyData, clearAll,
  getComponents, getMaxMarks,
  GRADE_SYSTEM, collegeRound, targetCalculator
}) {
  return (
    <div className="subjects-section">
      {/* Progress Bar */}
      <div className="progress-header">
        <div className="progress-stats">
          <span className="prog-done">{subjects.filter(s => subjectResults[s.code]?.allEntered).length} complete</span>
          <span className="prog-sep">·</span>
          <span className="prog-partial">{subjects.filter(s => subjectResults[s.code]?.partial).length} partial</span>
          <span className="prog-sep">·</span>
          <span className="prog-empty">{subjects.filter(s => !subjectResults[s.code]?.allEntered && !subjectResults[s.code]?.partial).length} empty</span>
          <span className="prog-sep">·</span>
          <span className="prog-total">{subjects.length} total</span>
        </div>
        <div className="progress-actions">
          {hasAnyData && (
            <button className="clear-btn" onClick={clearAll}>↺ Clear All</button>
          )}
        </div>
      </div>
      <div className="progress-bar-wrap">
        <div className="progress-bar">
          <div className="pb-done" style={{ width: `${(subjects.filter(s => subjectResults[s.code]?.allEntered).length / subjects.length) * 100}%` }} />
          <div className="pb-partial" style={{ width: `${(subjects.filter(s => subjectResults[s.code]?.partial).length / subjects.length) * 100}%` }} />
        </div>
      </div>

      {/* Subject Cards */}
      <div className="subjects-list">
        {subjects.map(subject => {
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
                  <span className="sc-name">{subject.displayName || subject.name}</span>
                  <div className="sc-meta">
                    <span className="pill credit">{subject.credits} cr</span>
                    <span className={`pill type-${subject.type}`}>{subject.type.replace(/_/g, " ")}</span>
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
                  {/* Custom Name Input */}
                  {subject.isCustom && (
                    <div className="custom-name-block">
                      <label className="comp-label">Subject Name</label>
                      <input
                        type="text"
                        placeholder={`Enter ${subject.name} name...`}
                        value={customNames[subject.code] || ""}
                        onChange={e => setCustomName(subject.code, e.target.value)}
                        className="comp-input custom-name-input"
                      />
                    </div>
                  )}

                  {/* Component Inputs */}
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

                  {/* Result Row */}
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

                    {/* Grade Options Grid */}
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
  );
}
