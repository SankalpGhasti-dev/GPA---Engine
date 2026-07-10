import React from "react";

const GRADE_COLORS = {
  AA: "#1b4332", AB: "#2d6a4f", BB: "#40916c",
  BC: "#52b788", CC: "#b7b7a4", CD: "#e07a5f", DD: "#c1121f", FF: "#6c1111"
};

export default function Sem3BoundariesTab({ boundaries }) {
  if (boundaries.length === 0) {
    return (
      <div className="boundaries-section">
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <p>Enter marks first. The engine will show which subjects are close to a grade upgrade.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="boundaries-section">
      <div className="section-intro">Subjects within 10 marks of the next grade — ranked by ROI (credit points gained per mark invested)</div>
      {boundaries.map((b, i) => (
        <div key={b.subject.code} className={`boundary-card priority-${i === 0 ? "high" : "med"}`}>
          <div className="bc-rank">#{i + 1}</div>
          <div className="bc-info">
            <div className="bc-name">{b.subject.displayName || b.subject.name}</div>
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
    </div>
  );
}
