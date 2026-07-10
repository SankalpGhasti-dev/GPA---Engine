// ============================================================
// useUserData HOOK — GPA Engine
// ============================================================
// Single source of truth for all user profile, academic, and
// goal data throughout the app.
//
// Returns:
//   profile      → users/{uid} data
//   academics    → academic/{uid} data (semNSGPA fields)
//   goals        → academic/{uid}.goals (targetCGPA, targetSGPA)
//   currentCGPA  → credit-weighted, computed dynamically
//   college      → resolved college config object
//   loading      → true while data is being fetched
//   updateProfile, updateAcademics, updateGoals → save helpers
//   refreshProfile → force reload from Firestore
// ============================================================

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  loadUserProfile,
  saveUserProfile,
  saveAcademics,
  saveGoals,
} from "../services/profileService";
import { computeCGPA, getCollegeById } from "../data/colleges/index";

export default function useUserData(user) {
  const [profile, setProfile] = useState(null);
  const [academics, setAcademics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Track if this is the first load to prevent stale-cache overwrites
  const isFirstLoad = useRef(true);

  // ── Load on mount / user change ────────────────────────────
  useEffect(() => {
    if (user === undefined) return; // still checking auth

    setLoading(true);
    isFirstLoad.current = true;

    if (user === null) {
      setProfile(null);
      setAcademics(null);
      setLoading(false);
      return;
    }

    loadUserProfile(user)
      .then(({ profile: p, academics: a }) => {
        setProfile(p);
        setAcademics(a);
        setLoading(false);
        isFirstLoad.current = false;
      })
      .catch(() => {
        setLoading(false);
        isFirstLoad.current = false;
      });
  }, [user]);

  // ── Derived: college config ────────────────────────────────
  const college = getCollegeById(profile?.collegeId);

  // ── Derived: goals (nested inside academics) ───────────────
  // Wrapped in useMemo so identity is stable and updateGoals
  // useCallback doesn't re-create on every render.
  const goals = useMemo(
    () => academics?.goals || { targetCGPA: null, targetSGPA: null },
    [academics]
  );

  // ── Derived: current CGPA (credit-weighted) ────────────────
  const currentCGPA = (() => {
    const sem = parseInt(profile?.currentSemester);
    if (!academics || !sem || sem <= 1) return null;
    return computeCGPA(academics, sem, profile?.collegeId);
  })();

  // ── updateProfile ──────────────────────────────────────────
  const updateProfile = useCallback(
    (fields) => {
      const updated = { ...profile, ...fields };
      setProfile(updated);
      saveUserProfile(user, fields);
    },
    [user, profile]
  );

  // ── updateAcademics ────────────────────────────────────────
  const updateAcademics = useCallback(
    (fields) => {
      const updated = { ...academics, ...fields };
      setAcademics(updated);
      saveAcademics(user, fields);
    },
    [user, academics]
  );

  // ── updateGoals ────────────────────────────────────────────
  const updateGoals = useCallback(
    (fields) => {
      const updatedGoals = { ...goals, ...fields };
      const updatedAcademics = { ...academics, goals: updatedGoals };
      setAcademics(updatedAcademics);
      saveGoals(user, updatedGoals);
    },
    [user, academics, goals]
  );

  // ── refreshProfile (force reload from Firestore) ───────────
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { profile: p, academics: a } = await loadUserProfile(user);
      setProfile(p);
      setAcademics(a);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    profile,
    academics,
    goals,
    college,
    currentCGPA,
    loading,
    updateProfile,
    updateAcademics,
    updateGoals,
    refreshProfile,
  };
}
