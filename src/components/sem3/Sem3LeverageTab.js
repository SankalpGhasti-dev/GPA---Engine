import React from "react";

export default function Sem3LeverageTab({ leverage, totalCredits }) {
  return (
    <div className="leverage-section">
      <div className="section-intro">
        Subjects ranked by how much each grade point improvement affects your SGPA. Focus here first.
      </div>
      {leverage.map((s, i) => (
        <div key={s.code} className="leverage-card">
          <div className="lc-rank">#{i + 1}</div>
          <div className="lc-info">
            <div className="lc-name">{s.displayName || s.name}</div>
            <div className="lc-meta">
              <span className="pill credit">{s.credits} cr</span>
              <span className={`pill type-${s.type}`}>{s.type.replace(/_/g, " ")}</span>
            </div>
          </div>
          <div className="lc-stats">
            <div className="lc-stat">
              <span>+1 GP gain</span>
              <strong>+{s.credits} credit pts</strong>
            </div>
            <div className="lc-stat">
              <span>SGPA impact</span>
              <strong>+{Math.round(s.credits / totalCredits * 100) / 100}</strong>
            </div>
            <div className="lc-stat">
              <span>Max possible CP</span>
              <strong>{s.maxPossibleCP}</strong>
            </div>
          </div>
          <div className="lc-bar">
            <div className="lc-fill" style={{ width: `${(s.credits / 3) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
