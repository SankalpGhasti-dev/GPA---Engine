// ============================================================
// PROFILE SERVICE — GPA Engine
// ============================================================
// Handles all Firestore reads and writes for:
//   users/{uid}       → profile (name, college, branch, semester…)
//   academic/{uid}    → academics (semNSGPA) + goals (targetCGPA, targetSGPA)
//
// Strategy:
//   - Firestore is source of truth
//   - localStorage is the offline cache (written on every load/save)
//   - All Firestore writes use merge: true — never overwrites documents
//   - Writes are debounced (1200ms) to avoid excessive Firestore calls
//   - Local users (isLocalUser) skip all Firestore calls
//
// GUARDRAIL: Do not modify the marks/{uid} or academic/{uid}.semesters
// collections — those belong to the Sem II / Sem III engine layers.
// ============================================================

import { isLocalUser } from "../firebase/localAuth";
import { isFirebaseConfigured } from "../firebase/config";

// ── Debounce helpers ────────────────────────────────────────
const debounceTimers = {};

function debounce(key, fn, delay = 1200) {
  if (debounceTimers[key]) clearTimeout(debounceTimers[key]);
  debounceTimers[key] = setTimeout(() => {
    fn();
    delete debounceTimers[key];
  }, delay);
}

// ── localStorage helpers ────────────────────────────────────
function cacheSet(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn("[ProfileService] localStorage write failed:", e);
  }
}

function cacheGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ── Firestore dynamic import (lazy, same pattern as App.js) ─
async function getFirestore() {
  if (!isFirebaseConfigured()) return { doc: null, db: null };
  try {
    const { doc, getDoc, setDoc, serverTimestamp } = await import("firebase/firestore");
    const { db } = await import("../firebase/config");
    return { doc, getDoc, setDoc, serverTimestamp, db };
  } catch (err) {
    console.warn("[ProfileService] Firestore import failed:", err);
    return { doc: null, db: null };
  }
}

// ── Load user profile ───────────────────────────────────────
// Returns { profile, academics } merged from Firestore + localStorage fallback
export async function loadUserProfile(user) {
  if (!user) return { profile: null, academics: null };

  const uid = user.uid;
  const profileKey = `gpa-profile-${uid}`;
  const academicKey = `gpa-academic-${uid}`;

  // Local-only users (no Firebase) — use localStorage or defaults
  if (isLocalUser(user) || !isFirebaseConfigured()) {
    const cachedProfile = cacheGet(profileKey);
    const cachedAcademic = cacheGet(academicKey);
    return {
      profile: cachedProfile || buildDefaultProfile(user),
      academics: cachedAcademic || buildDefaultAcademics(),
    };
  }

  // Firestore load
  try {
    const { doc, getDoc, db } = await getFirestore();
    if (!db) throw new Error("db not initialized");

    const [profileSnap, academicSnap] = await Promise.all([
      getDoc(doc(db, "users", uid)),
      getDoc(doc(db, "academic", uid)),
    ]);

    const profile = profileSnap.exists() ? profileSnap.data() : null;
    const academics = academicSnap.exists() ? academicSnap.data() : null;

    // Cache to localStorage immediately
    if (profile) cacheSet(profileKey, profile);
    if (academics) cacheSet(academicKey, academics);

    return {
      profile: profile || cacheGet(profileKey) || buildDefaultProfile(user),
      academics: academics || cacheGet(academicKey) || buildDefaultAcademics(),
    };
  } catch (err) {
    console.warn("[ProfileService] Firestore load failed, using cache.", err);
    return {
      profile: cacheGet(profileKey) || buildDefaultProfile(user),
      academics: cacheGet(academicKey) || buildDefaultAcademics(),
    };
  }
}

// ── Save profile (users/{uid}) ──────────────────────────────
// Writes to localStorage immediately; debounces Firestore write.
export function saveUserProfile(user, profileData) {
  if (!user) return;
  const uid = user.uid;
  const profileKey = `gpa-profile-${uid}`;

  // Merge with timestamp
  const dataToSave = {
    ...profileData,
    updatedAt: new Date().toISOString(),
  };

  // Write localStorage immediately
  const existing = cacheGet(profileKey) || {};
  const merged = { ...existing, ...dataToSave };
  cacheSet(profileKey, merged);

  // Debounce Firestore write
  if (!isLocalUser(user) && isFirebaseConfigured()) {
    debounce(`profile-${uid}`, async () => {
      try {
        const { doc, setDoc, serverTimestamp, db } = await getFirestore();
        if (!db) return;
        await setDoc(
          doc(db, "users", uid),
          { ...dataToSave, updatedAt: serverTimestamp() },
          { merge: true }
        );
      } catch (err) {
        console.warn("[ProfileService] Firestore profile save failed:", err);
      }
    });
  }
}

// ── Save academics (academic/{uid} — semNSGPA fields) ───────
// GUARDRAIL: Only touches top-level semNSGPA fields and updatedAt.
// Does NOT touch academic/{uid}.semesters (Sem III marks engine data).
export function saveAcademics(user, academicsData) {
  if (!user) return;
  const uid = user.uid;
  const academicKey = `gpa-academic-${uid}`;

  const dataToSave = {
    ...academicsData,
    updatedAt: new Date().toISOString(),
  };

  // Write localStorage immediately
  const existing = cacheGet(academicKey) || {};
  const merged = { ...existing, ...dataToSave };
  cacheSet(academicKey, merged);

  // Debounce Firestore write
  if (!isLocalUser(user) && isFirebaseConfigured()) {
    debounce(`academic-${uid}`, async () => {
      try {
        const { doc, setDoc, serverTimestamp, db } = await getFirestore();
        if (!db) return;
        await setDoc(
          doc(db, "academic", uid),
          { ...dataToSave, updatedAt: serverTimestamp() },
          { merge: true }
        );
      } catch (err) {
        console.warn("[ProfileService] Firestore academics save failed:", err);
      }
    });
  }
}

// ── Save goals (academic/{uid}.goals) ───────────────────────
export function saveGoals(user, goalsData) {
  if (!user) return;
  const uid = user.uid;
  const academicKey = `gpa-academic-${uid}`;

  const dataToSave = {
    goals: goalsData,
    updatedAt: new Date().toISOString(),
  };

  // Write localStorage immediately
  const existing = cacheGet(academicKey) || {};
  const merged = { ...existing, ...dataToSave };
  cacheSet(academicKey, merged);

  // Debounce Firestore write
  if (!isLocalUser(user) && isFirebaseConfigured()) {
    debounce(`goals-${uid}`, async () => {
      try {
        const { doc, setDoc, serverTimestamp, db } = await getFirestore();
        if (!db) return;
        await setDoc(
          doc(db, "academic", uid),
          { goals: goalsData, updatedAt: serverTimestamp() },
          { merge: true }
        );
      } catch (err) {
        console.warn("[ProfileService] Firestore goals save failed:", err);
      }
    });
  }
}

// ── Complete onboarding (sets onboardingComplete: true) ─────
export async function completeOnboarding(user, { profileData, academicsData, goalsData }) {
  if (!user) return;

  const uid = user.uid;
  const profileKey = `gpa-profile-${uid}`;
  const academicKey = `gpa-academic-${uid}`;

  const now = new Date().toISOString();
  const fullProfile = {
    ...profileData,
    onboardingComplete: true,
    createdAt: now,
    updatedAt: now,
  };
  const fullAcademic = {
    ...academicsData,
    goals: goalsData,
    updatedAt: now,
  };

  // Write localStorage immediately
  cacheSet(profileKey, fullProfile);
  cacheSet(academicKey, fullAcademic);

  // Write to Firestore (not debounced — onboarding should be immediate)
  if (!isLocalUser(user) && isFirebaseConfigured()) {
    try {
      const { doc, setDoc, serverTimestamp, db } = await getFirestore();
      if (!db) return;
      await Promise.all([
        setDoc(
          doc(db, "users", uid),
          { ...fullProfile, createdAt: serverTimestamp(), updatedAt: serverTimestamp() },
          { merge: true }
        ),
        setDoc(
          doc(db, "academic", uid),
          { ...fullAcademic, updatedAt: serverTimestamp() },
          { merge: true }
        ),
      ]);
    } catch (err) {
      console.warn("[ProfileService] Onboarding Firestore write failed (data saved locally):", err);
    }
  }
}

// ── Default builders (used when no data exists) ─────────────
function buildDefaultProfile(user) {
  return {
    name: user?.displayName || "",
    email: user?.email || "",
    photoURL: user?.photoURL || null,
    collegeId: "sitcoe-ichalkaranji",
    collegeName: "Sharad Institute of Technology College of Engineering, Ichalkaranji",
    university: "Shivaji University, Kolhapur",
    branch: "",
    currentYear: null,
    currentSemester: null,
    onboardingComplete: false,
  };
}

function buildDefaultAcademics() {
  return {
    sem1SGPA: null,
    sem2SGPA: null,
    sem3SGPA: null,
    sem4SGPA: null,
    sem5SGPA: null,
    sem6SGPA: null,
    sem7SGPA: null,
    sem8SGPA: null,
    goals: {
      targetCGPA: null,
      targetSGPA: null,
    },
  };
}
