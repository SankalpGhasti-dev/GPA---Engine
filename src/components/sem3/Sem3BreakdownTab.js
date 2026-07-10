import React from "react";

const GRADE_COLORS = {
  AA: "#1b4332", AB: "#2d6a4f", BB: "#40916c",
  BC: "#52b788", CC: "#b7b7a4", CD: "#e07a5f", DD: "#c1121f", FF: "#6c1111"
};

export default function Sem3BreakdownTab({ roadmap }) {
  if (!roadmap) {
    return (
      <div className="comp-breakdown-section">
        <div className="empty-state">
          <div className="empty-icon">🔬</div>
          <p>Enter your target SGPA to see the component breakdown.</p>
        </div>
      </div>
    );
  }

  return (
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
  );
}
