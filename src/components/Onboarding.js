// ============================================================
// ONBOARDING WIZARD — GPA Engine
// ============================================================
// 4-step guided setup shown to first-time users.
// Triggered by App.js when profile.onboardingComplete !== true.
//
// Step 1: Personal Info (Name, College, Branch)
// Step 2: Academic Info (Year, Semester)
// Step 3: Previous SGPAs (optional — skippable)
// Step 4: Academic Goals (Target CGPA, Target SGPA)
// ============================================================

import React, { useState } from "react";
import "./Onboarding.css";
import {
  COLLEGES,
  getBranches,
  isOtherCollege,
  YEAR_TO_SEMESTERS,
} from "../data/colleges/index";
import { completeOnboarding } from "../services/profileService";

// ── Step indicator ──────────────────────────────────────────
function StepProgress({ current, total }) {
  return (
    <div className="onb-progress">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const isDone = step < current;
        const isActive = step === current;
        return (
          <React.Fragment key={step}>
            <div
              className={`onb-step-dot${isActive ? " active" : ""}${isDone ? " done" : ""}`}
            >
              {isDone ? "✓" : step}
            </div>
            {i < total - 1 && (
              <div className={`onb-step-line${isDone ? " done" : ""}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Main Onboarding Component ───────────────────────────────
export default function Onboarding({ user, onComplete }) {
  const TOTAL_STEPS = 4;
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Step 1 — Personal Info
  const [name, setName] = useState(user?.displayName || "");
  const [collegeId, setCollegeId] = useState("sitcoe-ichalkaranji");
  const [customCollegeName, setCustomCollegeName] = useState("");
  const [customUniversity, setCustomUniversity] = useState("");
  const [branch, setBranch] = useState("");

  // Step 2 — Academic Info
  const [currentYear, setCurrentYear] = useState("");
  const [currentSemester, setCurrentSemester] = useState("");

  // Step 3 — Previous SGPAs (object: { "1": "8.5", "2": "9.0", ... })
  const [prevSGPAs, setPrevSGPAs] = useState({});

  // Step 4 — Goals
  const [targetCGPA, setTargetCGPA] = useState("");
  const [targetSGPA, setTargetSGPA] = useState("");

  // ── Derived helpers ────────────────────────────────────────
  const isOther = isOtherCollege(collegeId);
  const branches = getBranches(collegeId);
  const selectedCollege = COLLEGES.find((c) => c.id === collegeId);
  const semOptions = currentYear ? YEAR_TO_SEMESTERS[parseInt(currentYear)] || [] : [];

  // Semesters to collect SGPAs for (all completed before currentSemester)
  const semNum = parseInt(currentSemester);
  const prevSemCount = isNaN(semNum) || semNum <= 1 ? 0 : semNum - 1;
  const prevSemNumbers = Array.from({ length: prevSemCount }, (_, i) => i + 1);

  // ── Validation ─────────────────────────────────────────────
  function validateStep1() {
    if (!name.trim()) return "Please enter your full name.";
    if (!collegeId) return "Please select your college.";
    if (isOther && !customCollegeName.trim()) return "Please enter your college name.";
    if (!branch.trim()) return "Please select or enter your branch.";
    return null;
  }

  function validateStep2() {
    if (!currentYear) return "Please select your current academic year.";
    if (!currentSemester) return "Please select your current semester.";
    return null;
  }

  function validateSGPA(val) {
    if (val === "" || val == null) return true; // optional
    const n = parseFloat(val);
    return !isNaN(n) && n >= 0 && n <= 10;
  }

  function validateStep3() {
    for (const n of prevSemNumbers) {
      if (prevSGPAs[n] !== undefined && prevSGPAs[n] !== "" && !validateSGPA(prevSGPAs[n])) {
        return `Semester ${n} SGPA must be between 0 and 10.`;
      }
    }
    return null;
  }

  function validateStep4() {
    if (targetCGPA && (isNaN(parseFloat(targetCGPA)) || parseFloat(targetCGPA) < 0 || parseFloat(targetCGPA) > 10)) {
      return "Target CGPA must be between 0 and 10.";
    }
    if (targetSGPA && (isNaN(parseFloat(targetSGPA)) || parseFloat(targetSGPA) < 0 || parseFloat(targetSGPA) > 10)) {
      return "Target SGPA must be between 0 and 10.";
    }
    return null;
  }

  // ── Navigation ─────────────────────────────────────────────
  function goNext(skipSGPA = false) {
    setError("");

    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) { setError(err); return; }
      // Auto-skip Step 3 if currentSemester = 1 (no previous semesters)
      setStep(prevSemCount === 0 ? 4 : 3);
    } else if (step === 3) {
      if (!skipSGPA) {
        const err = validateStep3();
        if (err) { setError(err); return; }
      }
      setStep(4);
    } else if (step === 4) {
      handleComplete();
    }
  }

  function goBack() {
    setError("");
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else if (step === 4) setStep(prevSemCount === 0 ? 2 : 3);
  }

  // ── Submit ─────────────────────────────────────────────────
  async function handleComplete() {
    const err = validateStep4();
    if (err) { setError(err); return; }

    setSaving(true);
    setError("");

    try {
      const resolvedCollegeName = isOther
        ? customCollegeName.trim()
        : selectedCollege?.displayName || "";
      const resolvedUniversity = isOther
        ? customUniversity.trim()
        : selectedCollege?.university || "";

      const profileData = {
        name: name.trim(),
        email: user?.email || "",
        photoURL: user?.photoURL || null,
        collegeId,
        collegeName: resolvedCollegeName,
        university: resolvedUniversity,
        branch: branch.trim(),
        currentYear: parseInt(currentYear),
        currentSemester: parseInt(currentSemester),
      };

      // Build academics — only include filled SGPA values
      const academicsData = {};
      for (const n of prevSemNumbers) {
        const val = prevSGPAs[n];
        academicsData[`sem${n}SGPA`] = val !== "" && val != null ? parseFloat(val) : null;
      }

      const goalsData = {
        targetCGPA: targetCGPA ? parseFloat(targetCGPA) : null,
        targetSGPA: targetSGPA ? parseFloat(targetSGPA) : null,
      };

      await completeOnboarding(user, { profileData, academicsData, goalsData });
      onComplete({ profileData, academicsData, goalsData });
    } catch (e) {
      console.error("Onboarding save failed:", e);
      setError("Failed to save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Step 1: Personal Info ──────────────────────────────────
  function renderStep1() {
    return (
      <>
        <div className="onb-step-label">Step 1 of {TOTAL_STEPS}</div>
        <h2 className="onb-title">Personal Information</h2>
        <p className="onb-subtitle">Let's set up your academic profile.</p>

        {/* Avatar row */}
        <div className="onb-avatar-row">
          <div className="onb-avatar">
            {user?.photoURL
              ? <img src={user.photoURL} alt="avatar" />
              : <span>{(user?.displayName || user?.email || "S")[0].toUpperCase()}</span>
            }
          </div>
          <div className="onb-avatar-info">
            <span className="onb-avatar-name">{user?.displayName || "Welcome!"}</span>
            <span className="onb-avatar-email">{user?.email}</span>
          </div>
        </div>

        <div className="onb-field">
          <label className="onb-label">Full Name <span className="required">*</span></label>
          <input
            className="onb-input"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="onb-field">
          <label className="onb-label">College <span className="required">*</span></label>
          <select
            className="onb-select"
            value={collegeId}
            onChange={(e) => {
              setCollegeId(e.target.value);
              setBranch(""); // reset branch on college change
            }}
          >
            {COLLEGES.map((c) => (
              <option key={c.id} value={c.id}>{c.displayName}</option>
            ))}
          </select>
        </div>

        {isOther && (
          <>
            <div className="onb-field">
              <label className="onb-label">College Name <span className="required">*</span></label>
              <input
                className="onb-input"
                type="text"
                placeholder="Enter your college name"
                value={customCollegeName}
                onChange={(e) => setCustomCollegeName(e.target.value)}
              />
            </div>
            <div className="onb-field">
              <label className="onb-label">University</label>
              <input
                className="onb-input"
                type="text"
                placeholder="Enter your university name"
                value={customUniversity}
                onChange={(e) => setCustomUniversity(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="onb-field">
          <label className="onb-label">Branch <span className="required">*</span></label>
          {isOther ? (
            <input
              className="onb-input"
              type="text"
              placeholder="Enter your branch/department"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            />
          ) : (
            <select
              className="onb-select"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            >
              <option value="">Select your branch</option>
              {branches.map((b) => {
                const cleanName = b.replace(/^\*\s*/, '');
                return <option key={b} value={cleanName}>{b}</option>;
              })}
            </select>
          )}
          {(!isOther && branches.find(b => b.replace(/^\*\s*/, '') === branch)?.startsWith('*')) && (
            <div className="onb-skip-notice" style={{ marginTop: '12px', marginBottom: '0' }}>
              ℹ️ This branch is not yet supported in GPA Engine. Full support will be added in a future update.
            </div>
          )}
        </div>

        {error && <div className="onb-error">{error}</div>}

        <div className="onb-actions">
          <button className="onb-btn-primary" onClick={() => goNext()}>
            Continue →
          </button>
        </div>
      </>
    );
  }

  // ── Step 2: Academic Info ──────────────────────────────────
  function renderStep2() {
    return (
      <>
        <div className="onb-step-label">Step 2 of {TOTAL_STEPS}</div>
        <h2 className="onb-title">Academic Information</h2>
        <p className="onb-subtitle">Tell us where you are in your degree.</p>

        <div className="onb-row">
          <div className="onb-field">
            <label className="onb-label">Academic Year <span className="required">*</span></label>
            <select
              className="onb-select"
              value={currentYear}
              onChange={(e) => {
                setCurrentYear(e.target.value);
                setCurrentSemester(""); // reset semester on year change
              }}
            >
              <option value="">Select year</option>
              <option value="1">First Year</option>
              <option value="2">Second Year</option>
              <option value="3">Third Year</option>
              <option value="4">Fourth Year</option>
            </select>
          </div>

          <div className="onb-field">
            <label className="onb-label">Current Semester <span className="required">*</span></label>
            <select
              className="onb-select"
              value={currentSemester}
              onChange={(e) => setCurrentSemester(e.target.value)}
              disabled={!currentYear}
            >
              <option value="">Select semester</option>
              {semOptions.map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="onb-error">{error}</div>}

        <div className="onb-actions">
          <button className="onb-btn-primary" onClick={() => goNext()}>
            Continue →
          </button>
          <button className="onb-back" onClick={goBack}>← Back</button>
        </div>
      </>
    );
  }

  // ── Step 3: Previous SGPAs (Optional) ─────────────────────
  function renderStep3() {
    return (
      <>
        <div className="onb-step-label">Step 3 of {TOTAL_STEPS}</div>
        <h2 className="onb-title">Previous Results</h2>
        <p className="onb-subtitle">
          Enter your past semester SGPAs for CGPA tracking.
        </p>

        <div className="onb-skip-notice">
          📌 This step is optional. You can skip it now and add results later from <strong>Edit Profile</strong>.
        </div>

        <div className="onb-sgpa-grid">
          {prevSemNumbers.map((n) => (
            <div key={n} className="onb-sgpa-item">
              <span className="onb-sgpa-label">Semester {n} SGPA</span>
              <input
                className="onb-input"
                type="number"
                min="0"
                max="10"
                step="0.01"
                placeholder="e.g. 8.50"
                value={prevSGPAs[n] ?? ""}
                onChange={(e) =>
                  setPrevSGPAs((prev) => ({ ...prev, [n]: e.target.value }))
                }
              />
            </div>
          ))}
        </div>

        {error && <div className="onb-error">{error}</div>}

        <div className="onb-actions">
          <button className="onb-btn-primary" onClick={() => goNext(false)}>
            Save &amp; Continue →
          </button>
          <button className="onb-btn-skip" onClick={() => goNext(true)}>
            Skip for now
          </button>
          <button className="onb-back" onClick={goBack}>← Back</button>
        </div>
      </>
    );
  }

  // ── Step 4: Goals ──────────────────────────────────────────
  function renderStep4() {
    return (
      <>
        <div className="onb-step-label">Step 4 of {TOTAL_STEPS}</div>
        <h2 className="onb-title">Academic Goals</h2>
        <p className="onb-subtitle">
          Set your targets. GPA Engine will track your progress and tell you exactly what you need.
        </p>

        <div className="onb-goal-row">
          <div className="onb-field">
            <label className="onb-label">Target CGPA</label>
            <input
              className="onb-input"
              type="number"
              min="0"
              max="10"
              step="0.01"
              placeholder="e.g. 9.00"
              value={targetCGPA}
              onChange={(e) => setTargetCGPA(e.target.value)}
            />
          </div>
          <div className="onb-field">
            <label className="onb-label">Target SGPA (This Sem)</label>
            <input
              className="onb-input"
              type="number"
              min="0"
              max="10"
              step="0.01"
              placeholder="e.g. 9.00"
              value={targetSGPA}
              onChange={(e) => setTargetSGPA(e.target.value)}
            />
          </div>
        </div>

        {error && <div className="onb-error">{error}</div>}

        {saving && (
          <div className="onb-saving">
            <div className="onb-spinner" /> Saving your profile…
          </div>
        )}

        <div className="onb-actions">
          <button
            className="onb-btn-primary gold"
            onClick={() => goNext()}
            disabled={saving}
          >
            🚀 Complete Setup
          </button>
          <button className="onb-btn-skip" onClick={() => goNext()} disabled={saving}>
            Skip goals for now
          </button>
          <button className="onb-back" onClick={goBack} disabled={saving}>← Back</button>
        </div>
      </>
    );
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="onb-root">
      <div className="onb-brand">
        <span className="onb-brand-badge">GPA</span>
        <span className="onb-brand-name">GPA Engine</span>
      </div>

      <StepProgress current={step} total={TOTAL_STEPS} />

      <div className="onb-card" key={step}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>
    </div>
  );
}
