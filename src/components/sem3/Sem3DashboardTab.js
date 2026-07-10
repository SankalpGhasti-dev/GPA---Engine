import React from "react";

const GRADE_COLORS = {
  AA: "#1b4332", AB: "#2d6a4f", BB: "#40916c",
  BC: "#52b788", CC: "#b7b7a4", CD: "#e07a5f", DD: "#c1121f", FF: "#6c1111"
};

export default function Sem3DashboardTab({
  subjects, subjectResults, liveSGPA, targetSGPA,
  totalEnteredCP, reverseResult, controlIdx, scenarios, totalCredits
}) {
  return (
    <div className="dashboard-grid">
      {/* SGPA Summary */}
      <div className="dash-card span2">
        <div className="dash-card-title">SGPA Overview</div>
        <div className="sgpa-overview">
          <div className="sgpa-block">
            <div className="sgpa-label">Current SGPA</div>
            <div className="sgpa-val">{liveSGPA ?? "—"}</div>
            <div className="sgpa-sub">from {subjects.filter(s => subjectResults[s.code]?.allEntered).length} complete subjects</div>
          </div>
          <div className="sgpa-block">
            <div className="sgpa-label">Target SGPA</div>
            <div className="sgpa-val target">{targetSGPA || "—"}</div>
            <div className="sgpa-sub">set above</div>
          </div>
          <div className="sgpa-block">
            <div className="sgpa-label">Credit Points Secured</div>
            <div className="sgpa-val">{totalEnteredCP}</div>
            <div className="sgpa-sub">of {10 * totalCredits} max</div>
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
        <div className="ci-legend"><span className="ci-dot controlled" />You control {controlIdx.controlled}%</div>
        <div className="ci-legend"><span className="ci-dot partial" />Partial {controlIdx.partial}%</div>
        <div className="ci-legend"><span className="ci-dot exam" />Exam only {controlIdx.exam}%</div>
      </div>

      {/* Credit Leverage */}
      <div className="dash-card span2">
        <div className="dash-card-title">Credit Leverage Ranking — Most valuable subjects</div>
        <div className="leverage-list">
          {subjects.slice().sort((a, b) => b.credits - a.credits).map((s, i) => (
            <div key={s.code} className="leverage-row">
              <span className="lev-rank">#{i + 1}</span>
              <span className="lev-name">{s.displayName || s.name}</span>
              <span className="lev-credits">{s.credits} cr</span>
              <div className="lev-bar">
                <div className="lev-fill" style={{ width: `${(s.credits / 3) * 100}%` }} />
              </div>
              <span className="lev-note">+1 GP = +{s.credits} credit pts = +{Math.round(s.credits / totalCredits * 100) / 100} SGPA</span>
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
  );
}
