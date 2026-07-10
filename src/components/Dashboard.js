import React, { useState } from "react";
import "./Dashboard.css";
import ProfileModal from "./ProfileModal";

// ── Progress Ring SVG Component ─────────────────────────
function ProgressRing({ value, max = 10, size = 130, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min((value || 0) / max, 1);
  const offset = circumference * (1 - pct);

  return (
    <svg className="progress-ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d4a843" />
          <stop offset="100%" stopColor="#f0d078" />
        </linearGradient>
        <filter id="ring-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="url(#ring-gradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        filter="url(#ring-glow)"
        className="progress-ring-fill"
      />
      <text x="50%" y="46%" textAnchor="middle" className="progress-ring-value">
        {value != null ? value : "—"}
      </text>
      <text x="50%" y="62%" textAnchor="middle" className="progress-ring-label">
        CGPA
      </text>
    </svg>
  );
}

// ── Academic Health Logic ────────────────────────────────
function getHealthStatus(cgpa, target) {
  if (!cgpa || !target) return { label: "Unknown", level: "unknown", position: 50 };
  const gap = target - cgpa;
  if (gap <= 0) return { label: "Excellent", level: "excellent", position: 95 };
  if (gap <= 0.5) return { label: "Good", level: "good", position: 75 };
  if (gap <= 1.5) return { label: "Needs Work", level: "warning", position: 40 };
  return { label: "At Risk", level: "danger", position: 15 };
}

// ── Main Dashboard Component ────────────────────────────
export default function Dashboard({ user, profile, academics, goals, currentCGPA, college, onNavigate, onProfileSaved }) {
  const [underDevSem, setUnderDevSem] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const userName = profile?.name || user?.displayName || user?.email?.split("@")[0] || "Student";
  const branch = profile?.branch || "—";
  const college_name = profile?.collegeName || college?.displayName || "—";
  const currentSem = profile?.currentSemester || null;
  const targetCGPA = parseFloat(goals?.targetCGPA) || null;
  const targetSGPA = parseFloat(goals?.targetSGPA) || null;

  // CGPA is computed credit-weighted by useUserData hook — use directly
  // Fallback: try to compute from legacy cgpaHistory if hook hasn't loaded yet
  let displayCGPA = currentCGPA;
  if (displayCGPA == null && profile?.cgpaHistory) {
    const histEntries = Object.entries(profile.cgpaHistory);
    let tw = 0, tc = 0;
    for (const [, entry] of histEntries) {
      if (entry.sgpa && entry.credits) { tw += entry.sgpa * entry.credits; tc += entry.credits; }
    }
    if (tc > 0) displayCGPA = Math.round((tw / tc) * 100) / 100;
  }

  // Credits earned from academics semNSGPA (count completed sems × approx credits)
  let creditsEarned = 0;
  if (academics && currentSem) {
    const semCr = college?.semesterCredits || {};
    for (let i = 1; i < currentSem; i++) {
      const v = academics[`sem${i}SGPA`];
      if (v != null && !isNaN(parseFloat(v))) creditsEarned += semCr[i] || 20;
    }
  }
  const totalDegreeCredits = 176;

  // Health status
  const health = getHealthStatus(displayCGPA, targetCGPA);

  // Goal progress
  const goalProgress = (displayCGPA && targetCGPA) ? Math.min((displayCGPA / targetCGPA) * 100, 100) : 0;
  const goalGap = (displayCGPA && targetCGPA) ? Math.max(targetCGPA - displayCGPA, 0) : null;
  const goalStatus = goalGap === null ? "—" : goalGap <= 0 ? "Achieved ✓" : goalGap <= 0.3 ? "Almost There" : "On Track";


  // Semester roadmap data — status derived from user's currentSemester
  const semesters = [
    { num: 1, year: "First Year" },
    { num: 2, year: "First Year" },
    { num: 3, year: "Second Year" },
    { num: 4, year: "Second Year" },
    { num: 5, year: "Third Year" },
    { num: 6, year: "Third Year" },
    { num: 7, year: "Fourth Year" },
    { num: 8, year: "Fourth Year" },
  ].map((s) => {
    let status, label;
    if (currentSem && s.num < currentSem) {
      status = "completed";
      label = "✓ Completed";
    } else if (s.num === 3) {
      // Sem 3 is always accessible (only functional workspace)
      status = currentSem === 3 ? "active" : s.num < (currentSem || 3) ? "completed" : "coming-soon";
      label = status === "active" ? "● Active" : status === "completed" ? "✓ Completed" : "Coming Soon";
    } else if (s.num === 2) {
      status = "legacy";
      label = "✓ Available";
    } else if (!currentSem || s.num === currentSem) {
      status = "active";
      label = "● Active";
    } else {
      status = "coming-soon";
      label = "Coming Soon";
    }
    const semSGPA = academics ? academics[`sem${s.num}SGPA`] : null;
    return { ...s, status, label, sgpa: semSGPA };
  });

  const years = ["First Year", "Second Year", "Third Year", "Fourth Year"];

  // Recent activity
  const activities = [];
  if (profile?.updatedAt) {
    activities.push({ icon: "⚙️", text: "Profile updated", time: "Recently" });
  }
  if (targetCGPA) {
    activities.push({ icon: "🎯", text: `Target CGPA set to ${targetCGPA}`, time: "Active" });
  }
  if (targetSGPA) {
    activities.push({ icon: "📊", text: `Target SGPA set to ${targetSGPA}`, time: "Active" });
  }
  activities.push({ icon: "🚀", text: "Semester 3 available", time: "Now" });
  if (profile?.createdAt) {
    activities.push({ icon: "✨", text: "Account created", time: "Earlier" });
  }

  const handleSemesterClick = (sem) => {
    if (sem.status === "active" && sem.num === 3) {
      onNavigate("sem3-goal");
    } else if (sem.status === "completed" && sem.num === 3) {
      onNavigate("sem3-goal");
    } else if (sem.status === "legacy" || sem.num === 2) {
      onNavigate("sem2-home");
    } else {
      setUnderDevSem(underDevSem === sem.num ? null : sem.num);
    }
  };

  return (
    <div className="dashboard">
      {/* ── Profile Modal ────────────────────────────────── */}
      {profileModalOpen && (
        <ProfileModal
          user={user}
          profile={profile}
          academics={academics}
          goals={goals}
          onClose={() => setProfileModalOpen(false)}
          onSaved={(updated) => {
            setProfileModalOpen(false);
            if (onProfileSaved) onProfileSaved(updated);
          }}
        />
      )}

      {/* ── Hero Section ───────────────────────────────── */}
      <section className="dash-hero">
        <div className="dash-hero-content">
          <div className="dash-hero-left">
            <div className="dash-hero-greeting">
              <span className="dash-hero-wave">👋</span>
              <h1>Welcome back, <span className="dash-hero-name">{userName}</span></h1>
            </div>
            <p className="dash-hero-subtitle">
              {branch} · {college_name} · {currentSem ? `Semester ${currentSem}` : "Set up your profile"}
            </p>
            <div className="dash-hero-badges">
              {currentSem && <span className="dash-badge dash-badge-sem">Sem {currentSem}</span>}
              <span className="dash-badge dash-badge-year">AY 2025-26</span>
            </div>
          </div>
          <div className="dash-hero-right">
            <ProgressRing value={displayCGPA} />
          </div>
        </div>
      </section>

      {/* ── KPI Cards ──────────────────────────────────── */}
      <section className="dash-kpis">
        <div className="dash-kpi-card">
          <div className="dash-kpi-icon">📊</div>
          <div className="dash-kpi-body">
            <span className="dash-kpi-label">Current CGPA</span>
            <span className="dash-kpi-value">{displayCGPA ?? "—"}</span>
            {displayCGPA != null && (
              <span className="dash-kpi-detail">credit-weighted · {currentSem ? currentSem - 1 : 0} sem{(currentSem || 1) - 1 !== 1 ? "s" : ""}</span>
            )}
          </div>
        </div>

        <div className="dash-kpi-card">
          <div className="dash-kpi-icon">📈</div>
          <div className="dash-kpi-body">
            <span className="dash-kpi-label">Semester SGPA</span>
            <span className="dash-kpi-value">—</span>
            <span className="dash-kpi-detail">Sem {currentSem ?? "?"} · enter marks</span>
          </div>
        </div>

        <div className="dash-kpi-card dash-kpi-gold">
          <div className="dash-kpi-icon">🎯</div>
          <div className="dash-kpi-body">
            <span className="dash-kpi-label">Target CGPA</span>
            <span className="dash-kpi-value">{targetCGPA ?? "—"}</span>
            <span className="dash-kpi-detail">{targetCGPA ? "goal set" : "set in Edit Profile"}</span>
          </div>
        </div>

        <div className="dash-kpi-card">
          <div className="dash-kpi-icon">🎓</div>
          <div className="dash-kpi-body">
            <span className="dash-kpi-label">Credits Earned</span>
            <span className="dash-kpi-value">{creditsEarned}/{totalDegreeCredits}</span>
            <div className="dash-kpi-minibar">
              <div className="dash-kpi-minibar-fill" style={{ width: `${(creditsEarned / totalDegreeCredits) * 100}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Academic Health Meter ──────────────────────── */}
      <section className="dash-health-card">
        <div className="dash-health-header">
          <h3>Academic Health</h3>
          <span className={`dash-health-badge dash-health-${health.level}`}>{health.label}</span>
        </div>
        <div className="dash-health-gauge">
          <div className="dash-health-bar">
            <div className="dash-health-indicator" style={{ left: `${health.position}%` }} />
          </div>
          <div className="dash-health-labels">
            <span>At Risk</span>
            <span>Needs Work</span>
            <span>Good</span>
            <span>Excellent</span>
          </div>
        </div>
        <p className="dash-health-detail">
          {displayCGPA && targetCGPA
            ? `Based on CGPA ${displayCGPA} vs Target ${targetCGPA}`
            : "Enter past semester data to see your health status"
          }
        </p>
      </section>

      {/* ── Goal Progress Card ─────────────────────────── */}
      <section className="dash-goal-card">
        <div className="dash-goal-header">
          <h3>🎯 CGPA Goal Progress</h3>
          <span className="dash-goal-status">{goalStatus}</span>
        </div>
        <div className="dash-goal-bar-wrap">
          <div className="dash-goal-numbers">
            <span>Current: <strong>{displayCGPA ?? "—"}</strong></span>
            <span>Target: <strong>{targetCGPA ?? "—"}</strong></span>
          </div>
          <div className="dash-goal-bar">
            <div className="dash-goal-bar-fill" style={{ width: `${goalProgress}%` }} />
          </div>
          <div className="dash-goal-footer">
            {goalGap !== null && goalGap > 0 && (
              <span className="dash-goal-gap">+{goalGap.toFixed(2)} to go</span>
            )}
            {goalProgress > 0 && (
              <span className="dash-goal-pct">{goalProgress.toFixed(1)}%</span>
            )}
          </div>
        </div>
      </section>

      {/* ── Academic Snapshot ──────────────────────────── */}
      <section className="dash-snapshot">
        <div className="dash-snapshot-item">
          <span className="dash-snapshot-val">13</span>
          <span className="dash-snapshot-label">Subjects This Sem</span>
        </div>
        <div className="dash-snapshot-divider" />
        <div className="dash-snapshot-item">
          <span className="dash-snapshot-val">3</span>
          <span className="dash-snapshot-label">High-Impact (3cr)</span>
        </div>
        <div className="dash-snapshot-divider" />
        <div className="dash-snapshot-item">
          <span className="dash-snapshot-val">0%</span>
          <span className="dash-snapshot-label">Completion</span>
        </div>
      </section>

      {/* ── Academic Roadmap ───────────────────────────── */}
      <section className="dash-roadmap">
        <h3 className="dash-section-title">Academic Roadmap</h3>
        <div className="dash-roadmap-grid">
          {years.map(year => (
            <div key={year} className="dash-roadmap-year">
              <span className="dash-roadmap-year-label">{year}</span>
              <div className="dash-roadmap-sems">
                {semesters.filter(s => s.year === year).map(sem => (
                  <button
                    key={sem.num}
                    className={`dash-roadmap-sem dash-roadmap-${sem.status}`}
                    onClick={() => handleSemesterClick(sem)}
                  >
                    <span className="dash-sem-num">Semester {sem.num}</span>
                    <span className={`dash-sem-badge dash-sem-badge-${sem.status}`}>
                      {sem.label}
                    </span>
                    {/* Show SGPA for completed semesters */}
                    {sem.status === "completed" && sem.sgpa != null && (
                      <span className="dash-sem-sgpa">SGPA: {sem.sgpa}</span>
                    )}
                    {underDevSem === sem.num && sem.status === "coming-soon" && (
                      <div className="dash-sem-underdev">
                        <span>🚧 Under Development</span>
                        <p>Subject structure, credit system, and SGPA engine are being prepared.</p>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Recent Activity ────────────────────────────── */}
      <section className="dash-activity">
        <h3 className="dash-section-title">📋 Recent Activity</h3>
        <div className="dash-activity-list">
          {activities.slice(0, 5).map((a, i) => (
            <div key={i} className="dash-activity-item">
              <span className="dash-activity-icon">{a.icon}</span>
              <span className="dash-activity-text">{a.text}</span>
              <span className="dash-activity-time">{a.time}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quick Actions ──────────────────────────────── */}
      <section className="dash-actions">
        <button className="dash-action-btn dash-action-primary" onClick={() => onNavigate("sem3-marks")}>
          📝 Enter Marks
        </button>
        <button className="dash-action-btn dash-action-secondary" onClick={() => onNavigate("sem3-planning")}>
          🎯 Plan Semester
        </button>
        <button
          className="dash-action-btn dash-action-settings"
          id="edit-profile-btn"
          onClick={() => setProfileModalOpen(true)}
        >
          ⚙️ Edit Profile
        </button>
      </section>

      {/* ── Formula Strip ──────────────────────────────── */}
      <div className="dash-formula-strip">
        <span>SGPA = Total Credit Points ÷ Total Credits</span>
        <span className="dash-formula-dot">·</span>
        <span>Credit Points = Grade Points × Credits</span>
        <span className="dash-formula-dot">·</span>
        <span>Rounding: ≥0.5 rounds up</span>
      </div>
    </div>
  );
}
