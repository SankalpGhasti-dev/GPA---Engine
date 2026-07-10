// ============================================================
// PROFILE MODAL — GPA Engine
// ============================================================
// Edit Profile modal opened from the Dashboard quick action.
// Sections:
//   1. Personal Information (name, college, branch)
//   2. Academic Information (year, semester)
//   3. Academic Goals (target CGPA, target SGPA)
//   4. Previous Semester Results (editable SGPAs for completed sems)
//
// CGPA preview updates in real time as SGPAs are edited.
// Saves to Firestore + localStorage via profileService.
// ============================================================

import React, { useState, useEffect, useMemo } from "react";
import "./ProfileModal.css";
import {
  COLLEGES,
  getBranches,
  isOtherCollege,
  computeCGPA,
  YEAR_TO_SEMESTERS,
} from "../data/colleges/index";
import { saveUserProfile, saveAcademics, saveGoals } from "../services/profileService";

export default function ProfileModal({
  user,
  profile,
  academics,
  goals,
  onClose,
  onSaved,
}) {
  // ── Personal Info ──────────────────────────────────────────
  const [name, setName] = useState(profile?.name || "");
  const [collegeId, setCollegeId] = useState(profile?.collegeId || "sitcoe-ichalkaranji");
  const [customCollegeName, setCustomCollegeName] = useState(
    isOtherCollege(profile?.collegeId) ? profile?.collegeName || "" : ""
  );
  const [customUniversity, setCustomUniversity] = useState(
    isOtherCollege(profile?.collegeId) ? profile?.university || "" : ""
  );
  const [branch, setBranch] = useState(profile?.branch || "");

  // ── Academic Info ──────────────────────────────────────────
  const [currentYear, setCurrentYear] = useState(String(profile?.currentYear || ""));
  const [currentSemester, setCurrentSemester] = useState(String(profile?.currentSemester || ""));

  // ── Goals ──────────────────────────────────────────────────
  const [targetCGPA, setTargetCGPA] = useState(String(goals?.targetCGPA ?? ""));
  const [targetSGPA, setTargetSGPA] = useState(String(goals?.targetSGPA ?? ""));

  // ── Previous SGPAs ─────────────────────────────────────────
  const [sgpas, setSgpas] = useState(() => {
    const init = {};
    for (let i = 1; i <= 8; i++) {
      const val = academics?.[`sem${i}SGPA`];
      init[i] = val != null ? String(val) : "";
    }
    return init;
  });

  // ── UI state ───────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ── Derived ────────────────────────────────────────────────
  const isOther = isOtherCollege(collegeId);
  const branches = getBranches(collegeId);
  const semNum = parseInt(currentSemester) || 0;
  const prevSemNumbers = semNum > 1 ? Array.from({ length: semNum - 1 }, (_, i) => i + 1) : [];
  const semOptions = currentYear ? YEAR_TO_SEMESTERS[parseInt(currentYear)] || [] : [];

  // Reset branch when college changes (only if previous was a dropdown selection)
  useEffect(() => {
    if (!isOther) {
      const cleanBranches = branches.map(b => b.replace(/^\*\s*/, ''));
      if (branch && !cleanBranches.includes(branch)) {
        setBranch("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collegeId]);

  // Reset semester when year changes and previous semester doesn't belong to new year
  useEffect(() => {
    if (currentYear && currentSemester) {
      const valid = YEAR_TO_SEMESTERS[parseInt(currentYear)] || [];
      if (!valid.includes(parseInt(currentSemester))) {
        setCurrentSemester("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear]);

  // ── Live CGPA preview ──────────────────────────────────────
  const previewCGPA = useMemo(() => {
    if (!semNum || semNum <= 1) return null;
    const mockAcademics = {};
    for (let i = 1; i <= 8; i++) {
      const raw = sgpas[i];
      mockAcademics[`sem${i}SGPA`] = raw !== "" ? parseFloat(raw) : null;
    }
    return computeCGPA(mockAcademics, semNum, collegeId);
  }, [sgpas, semNum, collegeId]);

  // ── Validation ─────────────────────────────────────────────
  function validate() {
    if (!name.trim()) return "Name is required.";
    if (isOther && !customCollegeName.trim()) return "College name is required.";
    if (!branch.trim()) return "Branch is required.";
    if (!currentYear) return "Academic year is required.";
    if (!currentSemester) return "Current semester is required.";

    for (const n of prevSemNumbers) {
      const v = sgpas[n];
      if (v !== "" && v != null) {
        const f = parseFloat(v);
        if (isNaN(f) || f < 0 || f > 10) return `Semester ${n} SGPA must be between 0 and 10.`;
      }
    }
    if (targetCGPA !== "" && (isNaN(parseFloat(targetCGPA)) || parseFloat(targetCGPA) < 0 || parseFloat(targetCGPA) > 10)) {
      return "Target CGPA must be between 0 and 10.";
    }
    if (targetSGPA !== "" && (isNaN(parseFloat(targetSGPA)) || parseFloat(targetSGPA) < 0 || parseFloat(targetSGPA) > 10)) {
      return "Target SGPA must be between 0 and 10.";
    }
    return null;
  }

  // ── Save ───────────────────────────────────────────────────
  async function handleSave() {
    const err = validate();
    if (err) { setError(err); return; }

    setSaving(true);
    setError("");

    try {
      const selectedCollege = COLLEGES.find((c) => c.id === collegeId);
      const resolvedCollegeName = isOther ? customCollegeName.trim() : selectedCollege?.displayName || "";
      const resolvedUniversity = isOther ? customUniversity.trim() : selectedCollege?.university || "";

      const newProfile = {
        name: name.trim(),
        collegeId,
        collegeName: resolvedCollegeName,
        university: resolvedUniversity,
        branch: branch.trim(),
        currentYear: parseInt(currentYear),
        currentSemester: parseInt(currentSemester),
      };

      const newAcademics = {};
      for (let i = 1; i <= 8; i++) {
        const raw = sgpas[i];
        newAcademics[`sem${i}SGPA`] = raw !== "" && raw != null ? parseFloat(raw) : null;
      }

      const newGoals = {
        targetCGPA: targetCGPA !== "" ? parseFloat(targetCGPA) : null,
        targetSGPA: targetSGPA !== "" ? parseFloat(targetSGPA) : null,
      };

      // Save to localStorage + debounced Firestore
      saveUserProfile(user, newProfile);
      saveAcademics(user, newAcademics);
      saveGoals(user, newGoals);

      onSaved({
        profile: { ...profile, ...newProfile },
        academics: { ...academics, ...newAcademics },
        goals: newGoals,
      });
      onClose();
    } catch (e) {
      console.error("Profile save failed:", e);
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Close on overlay click ─────────────────────────────────
  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="pm-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label="Edit Profile">
      <div className="pm-panel">

        {/* Header */}
        <div className="pm-header">
          <div className="pm-header-left">
            <div className="pm-header-icon">⚙️</div>
            <div>
              <h2>Edit Profile</h2>
              <span className="pm-header-sub">Changes saved automatically</span>
            </div>
          </div>
          <button className="pm-close" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        {/* Scrollable body */}
        <div className="pm-body">

          {/* ── Section 1: Personal Information ────────────── */}
          <div className="pm-section">
            <div className="pm-section-title">Personal Information</div>

            {/* Avatar + readonly email */}
            <div className="pm-profile-row">
              <div className="pm-avatar">
                {user?.photoURL
                  ? <img src={user.photoURL} alt="avatar" />
                  : <span>{(profile?.name || user?.email || "S")[0].toUpperCase()}</span>
                }
              </div>
              <div className="pm-profile-meta">
                <span className="pm-profile-name">{profile?.name || "—"}</span>
                <span className="pm-profile-email">{user?.email}</span>
              </div>
              <span className="pm-readonly-tag">Read Only</span>
            </div>

            <div className="pm-field">
              <label className="pm-label">Full Name</label>
              <input
                className="pm-input"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="pm-field">
              <label className="pm-label">College</label>
              <select
                className="pm-select"
                value={collegeId}
                onChange={(e) => {
                  setCollegeId(e.target.value);
                  setBranch("");
                }}
              >
                {COLLEGES.map((c) => (
                  <option key={c.id} value={c.id}>{c.displayName}</option>
                ))}
              </select>
            </div>

            {isOther && (
              <div className="pm-row">
                <div className="pm-field">
                  <label className="pm-label">College Name</label>
                  <input
                    className="pm-input"
                    type="text"
                    placeholder="Enter college name"
                    value={customCollegeName}
                    onChange={(e) => setCustomCollegeName(e.target.value)}
                  />
                </div>
                <div className="pm-field">
                  <label className="pm-label">University</label>
                  <input
                    className="pm-input"
                    type="text"
                    placeholder="Enter university"
                    value={customUniversity}
                    onChange={(e) => setCustomUniversity(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="pm-field">
              <label className="pm-label">Branch</label>
              {isOther ? (
                <input
                  className="pm-input"
                  type="text"
                  placeholder="Enter your branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                />
              ) : (
                <select
                  className="pm-select"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                >
                  <option value="">Select branch</option>
                  {branches.map((b) => {
                    const cleanName = b.replace(/^\*\s*/, '');
                    return <option key={b} value={cleanName}>{b}</option>;
                  })}
                </select>
              )}
              {(!isOther && branches.find(b => b.replace(/^\*\s*/, '') === branch)?.startsWith('*')) && (
                <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#d4a843', backgroundColor: 'rgba(212, 168, 67, 0.1)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(212, 168, 67, 0.2)' }}>
                  ℹ️ This branch is not yet supported in GPA Engine. Full support will be added in a future update.
                </div>
              )}
            </div>
          </div>

          {/* ── Section 2: Academic Information ────────────── */}
          <div className="pm-section">
            <div className="pm-section-title">Academic Information</div>
            <div className="pm-row">
              <div className="pm-field">
                <label className="pm-label">Academic Year</label>
                <select
                  className="pm-select"
                  value={currentYear}
                  onChange={(e) => {
                    setCurrentYear(e.target.value);
                    setCurrentSemester("");
                  }}
                >
                  <option value="">Select year</option>
                  <option value="1">First Year</option>
                  <option value="2">Second Year</option>
                  <option value="3">Third Year</option>
                  <option value="4">Fourth Year</option>
                </select>
              </div>
              <div className="pm-field">
                <label className="pm-label">Current Semester</label>
                <select
                  className="pm-select"
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
          </div>

          {/* ── Section 3: Academic Goals ───────────────────── */}
          <div className="pm-section">
            <div className="pm-section-title">Academic Goals</div>
            <div className="pm-row">
              <div className="pm-field">
                <label className="pm-label">Target CGPA</label>
                <input
                  className="pm-input"
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  placeholder="e.g. 9.00"
                  value={targetCGPA}
                  onChange={(e) => setTargetCGPA(e.target.value)}
                />
              </div>
              <div className="pm-field">
                <label className="pm-label">Target SGPA (This Sem)</label>
                <input
                  className="pm-input"
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
          </div>

          {/* ── Section 4: Previous Semester Results ───────── */}
          <div className="pm-section">
            <div className="pm-section-title">Previous Semester Results</div>

            {prevSemNumbers.length === 0 ? (
              <p className="pm-no-prev">
                {semNum <= 1
                  ? "No completed semesters yet. Results will appear here when you advance to Semester 2."
                  : "Select your current semester above to see previous SGPA fields."}
              </p>
            ) : (
              <>
                <div className="pm-sgpa-grid">
                  {prevSemNumbers.map((n) => (
                    <div key={n} className="pm-sgpa-item">
                      <span className="pm-sgpa-label">Semester {n} SGPA</span>
                      <input
                        className="pm-input"
                        type="number"
                        min="0"
                        max="10"
                        step="0.01"
                        placeholder="—"
                        value={sgpas[n] ?? ""}
                        onChange={(e) =>
                          setSgpas((prev) => ({ ...prev, [n]: e.target.value }))
                        }
                      />
                    </div>
                  ))}
                </div>

                {/* Live CGPA preview */}
                {previewCGPA !== null && (
                  <div className="pm-cgpa-preview">
                    <span className="pm-cgpa-preview-label">
                      Computed CGPA ({prevSemNumbers.length} sem{prevSemNumbers.length > 1 ? "s" : ""}, credit-weighted)
                    </span>
                    <span className="pm-cgpa-preview-value">{previewCGPA}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Error */}
        {error && <div className="pm-error">{error}</div>}

        {/* Saving indicator */}
        {saving && (
          <div className="pm-saving">
            <div className="pm-spinner" /> Saving changes…
          </div>
        )}

        {/* Footer */}
        <div className="pm-footer">
          <button
            className="pm-btn-save"
            onClick={handleSave}
            disabled={saving}
            id="profile-save-btn"
          >
            {saving ? "Saving…" : "✓ Save Changes"}
          </button>
          <button
            className="pm-btn-cancel"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
