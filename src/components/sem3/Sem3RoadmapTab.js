import React from "react";

const GRADE_COLORS = {
  AA: "#1b4332", AB: "#2d6a4f", BB: "#40916c",
  BC: "#52b788", CC: "#b7b7a4", CD: "#e07a5f", DD: "#c1121f", FF: "#6c1111"
};

export default function Sem3RoadmapTab({ roadmap, subjects, totalCredits, targetSGPA, GRADE_SYSTEM }) {
  if (!roadmap) {
    return (
      <div className="plan-empty">
        <div className="empty-icon">🎯</div>
        <p>Enter your target SGPA above to generate the full roadmap</p>
        <div className="grade-ref-table">
          <div className="grt-title">Grade Reference · {totalCredits} Total Credits</div>
          <table className="grade-table">
            <thead><tr><th>Marks ≥</th><th>Grade</th><th>GP</th><th>Credit Point Examples</th></tr></thead>
            <tbody>
              {GRADE_SYSTEM.map(g => (
                <tr key={g.grade}>
                  <td>{g.min}%</td>
                  <td style={{ color: GRADE_COLORS[g.grade], fontWeight: 700 }}>{g.grade}</td>
                  <td>{g.points}</td>
                  <td style={{ color: "#888", fontSize: "0.75rem" }}>3cr={g.points * 3}cp · 2cr={g.points * 2}cp · 1cr={g.points}cp</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="roadmap-summary">
        <div className="rs-stat">
          <span>Target Credit Points</span>
          <strong>{roadmap.targetCP}</strong>
        </div>
        <div className="rs-stat">
          <span>Total Credits</span>
          <strong>{totalCredits}</strong>
        </div>
        <div className="rs-stat">
          <span>Avg GP Needed</span>
          <strong>{roadmap.avgGPNeeded}</strong>
        </div>
        <div className="rs-stat">
          <span>Subjects</span>
          <strong>{subjects.length}</strong>
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
                  <span className={`pill type-${r.type}`}>{r.type.replace(/_/g, " ")}</span>
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
  );
}
