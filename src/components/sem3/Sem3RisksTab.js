import React from "react";

const GRADE_COLORS = {
  AA: "#1b4332", AB: "#2d6a4f", BB: "#40916c",
  BC: "#52b788", CC: "#b7b7a4", CD: "#e07a5f", DD: "#c1121f", FF: "#6c1111"
};

export default function Sem3RisksTab({ risks, hasAnyData }) {
  if (risks.length === 0) {
    return (
      <div className="risks-section">
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <p>{hasAnyData ? "No grade drop risks detected with ±3 mark variation." : "Enter marks first to see risk analysis."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="risks-section">
      <div className="section-intro">Subjects where a ±3 mark variation could drop your grade — ranked by impact</div>
      {risks.map((r, i) => (
        <div key={r.subject.code} className={`risk-card risk-${r.level.toLowerCase()}`}>
          <div className="risk-level-badge">{r.level}</div>
          <div className="risk-info">
            <div className="risk-name">{r.subject.displayName || r.subject.name}</div>
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
    </div>
  );
}
