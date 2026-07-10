import React from "react";


export default function SemesterGoalSelection({ semester, onSelectMode, onBack }) {
  return (
    <main className="home">
      <div className="home-headline">
        <button className="back-btn" onClick={onBack} style={{ marginBottom: 16 }}>← Dashboard</button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <span className="logo-badge">SEM {semester === 3 ? "III" : semester}</span>
          <h2>What's your goal?</h2>
        </div>
        <p>Choose how you want to use GPA Engine for Semester {semester}.</p>
      </div>
      <div className="mode-cards">
        <div className="mode-card" onClick={() => onSelectMode("marks")}>
          <div className="mode-icon">📝</div>
          <h3>I have some marks</h3>
          <p>
            Enter your CA1, CA2, {semester === 3 ? "ESE, Viva, Practical" : "Midsem, Endsem"} scores.
            The engine calculates exactly what you need to hit your target SGPA — subject by subject.
          </p>
          <span className="mode-tag">Reverse Engineer</span>
        </div>
        <div className="mode-card" onClick={() => onSelectMode("planning")}>
          <div className="mode-icon">🎯</div>
          <h3>Fresh Semester Planning</h3>
          <p>
            Set your target SGPA. Get the full roadmap: minimum marks per component, credit leverage ranking,
            boundary alerts, and feasibility analysis.
          </p>
          <span className="mode-tag">Full Roadmap</span>
        </div>
      </div>
      <div className="formula-strip">
        <span>SGPA = Total Credit Points ÷ {semester === 3 ? "22" : "21"}</span>
        <span className="dot">·</span>
        <span>Credit Points = Grade Points × Credits</span>
        <span className="dot">·</span>
        <span>Rounding: ≥0.5 rounds up</span>
      </div>
    </main>
  );
}
