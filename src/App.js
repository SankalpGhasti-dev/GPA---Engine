import React, { useState, useEffect } from "react";
import "./App.css";
import MarksMode from "./components/MarksMode";
import TargetMode from "./components/TargetMode";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import Onboarding from "./components/Onboarding";
import SemesterGoalSelection from "./components/SemesterGoalSelection";
import Sem3Workspace from "./components/sem3/Sem3Workspace";
import { TOTAL_CREDITS } from "./data/engine";
import { auth, isFirebaseConfigured } from "./firebase/config";
import { isLocalUser } from "./firebase/localAuth";
import { onAuthStateChanged, signOut } from "firebase/auth";
import useUserData from "./hooks/useUserData";

export default function App() {
  // ── View state machine ──────────────────────────────
  // "loading" | "auth" | "onboarding" | "dashboard"
  // | "sem2-home" | "sem2-marks" | "sem2-target"
  // | "sem3-goal" | "sem3-workspace"
  const [view, setView] = useState("dashboard");
  const [sem3Mode, setSem3Mode] = useState(null); // "marks" | "planning"
  const [user, setUser] = useState(undefined); // undefined = loading, null = not logged in

  // ── Auth state listener ─────────────────────────────
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setUser(null);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (u) => setUser(u || null),
      (err) => {
        console.error("Auth state error:", err);
        setUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // ── Profile + academic data via hook ────────────────────
  const {
    profile,
    academics,
    goals,
    college,
    currentCGPA,
    loading: profileLoading,
    refreshProfile,
  } = useUserData(user);

  // ── Onboarding gate ────────────────────────────────
  // After profile loads: if onboardingComplete is false/missing, redirect to onboarding.
  // Only runs once per session (when profile first loads and view is still "dashboard").
  useEffect(() => {
    if (!profileLoading && profile && !profile.onboardingComplete && view === "dashboard") {
      setView("onboarding");
    }
  }, [profileLoading, profile, view]);

  const handleSignOut = async () => {
    try {
      if (isLocalUser(user)) {
        setUser(null);
        setView("dashboard");
        setSem3Mode(null);
        return;
      }
      if (!auth) {
        setUser(null);
        setView("dashboard");
        setSem3Mode(null);
        return;
      }
      await signOut(auth);
      setUser(null);
      setView("dashboard");
      setSem3Mode(null);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  // ── Navigation helpers ─────────────────────────────────
  const handleDashboardNavigate = (target) => {
    if (target === "sem2-home") {
      setView("sem2-home");
    } else if (target === "sem3-goal") {
      setView("sem3-goal");
    } else if (target === "sem3-marks") {
      setSem3Mode("marks");
      setView("sem3-workspace");
    } else if (target === "sem3-planning") {
      setSem3Mode("planning");
      setView("sem3-workspace");
    }
  };

  const handleBack = () => {
    if (view === "sem2-marks" || view === "sem2-target") {
      setView("sem2-home");
    } else if (view === "sem2-home") {
      setView("dashboard");
    } else if (view === "sem3-workspace") {
      setView("sem3-goal");
      setSem3Mode(null);
    } else if (view === "sem3-goal") {
      setView("dashboard");
    } else {
      setView("dashboard");
    }
  };

  // ── Loading state while Firebase checks session ──────────
  if (user === undefined || (user && profileLoading && !profile)) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" />
        <p>Loading GPA Engine…</p>
      </div>
    );
  }

  // ── Not logged in → show Auth page ────────────────────
  if (!user) {
    return <AuthPage onAuth={(u) => setUser(u)} />;
  }

  // ── Onboarding (first login, no profile yet) ──────────────
  if (view === "onboarding") {
    return (
      <Onboarding
        user={user}
        onComplete={() => {
          refreshProfile();
          setView("dashboard");
        }}
      />
    );
  }

  // ── Determine header badge ─────────────────────────────
  const isSem3View = view === "sem3-goal" || view === "sem3-workspace";
  const isSem2View = view === "sem2-home" || view === "sem2-marks" || view === "sem2-target";
  const headerBadge = isSem3View ? "SEM III" : isSem2View ? "SEM II" : "DASHBOARD";

  // ── Logged in → show main app ──────────────────────────
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <span className="logo-badge">{headerBadge}</span>
            <h1 className="app-title">GPA Engine</h1>
            <p className="app-sub">
              {isSem3View
                ? "BTECH CS · S.Y. · AY 2025-26 · Semester III"
                : isSem2View
                  ? "BTECH CS · F.Y. · AY 2025-26 · Academic Reverse Engineering System"
                  : "Academic Planning & SGPA/CGPA Optimization Platform"
              }
            </p>
          </div>
          <div className="header-actions">
            {view !== "dashboard" && (
              <button className="back-btn" onClick={handleBack}>← Back</button>
            )}
            <div className="user-menu">
              <div className="user-avatar">
                {user.photoURL
                  ? <img src={user.photoURL} alt="avatar" className="user-avatar-img" />
                  : <span>{(user.displayName || user.email || "U")[0].toUpperCase()}</span>
                }
              </div>
              <div className="user-info">
                <span className="user-name">{user.displayName || user.email?.split("@")[0] || "User"}</span>
                <span className="user-email">{user.email}</span>
              </div>
              <button className="signout-btn" onClick={handleSignOut} title="Sign Out">
                <SignOutIcon />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Dashboard View ───────────────────────────── */}
      {view === "dashboard" && (
        <Dashboard
          user={user}
          profile={profile}
          academics={academics}
          goals={goals}
          currentCGPA={currentCGPA}
          college={college}
          onNavigate={handleDashboardNavigate}
          onProfileSaved={({ profile: p, academics: a, goals: g }) => {
            // ProfileModal calls saveUserProfile/saveAcademics/saveGoals directly.
            // Trigger a refresh so the hook state picks up the latest saved data.
            refreshProfile();
          }}
        />
      )}

      {/* ── Semester 2: Goal Selection (existing JSX) ── */}
      {view === "sem2-home" && (
        <main className="home">
          <div className="home-headline">
            <h2>What's your goal?</h2>
            <p>This is not a calculator. This tells you the <em>minimum actions</em> needed to reach your target GPA.</p>
          </div>
          <div className="mode-cards">
            <div className="mode-card" onClick={() => setView("sem2-marks")}>
              <div className="mode-icon">📝</div>
              <h3>I have some marks</h3>
              <p>Enter your CA1, CA2, Midsem scores. The engine calculates exactly what you need in Endsem to hit your target SGPA — subject by subject.</p>
              <span className="mode-tag">Reverse Engineer</span>
            </div>
            <div className="mode-card" onClick={() => setView("sem2-target")}>
              <div className="mode-icon">🎯</div>
              <h3>Fresh Semester / Planning</h3>
              <p>Set your target SGPA. Get the full roadmap: minimum marks per component, credit leverage ranking, boundary alerts, and risk analysis.</p>
              <span className="mode-tag">Full Roadmap</span>
            </div>
          </div>
          <div className="formula-strip">
            <span>SGPA = Total Credit Points ÷ {TOTAL_CREDITS}</span>
            <span className="dot">·</span>
            <span>Credit Points = Grade Points × Credits</span>
            <span className="dot">·</span>
            <span>Rounding: ≥0.5 rounds up</span>
          </div>
        </main>
      )}

      {/* ── Semester 2: MarksMode (unchanged) ─────────── */}
      {view === "sem2-marks" && <MarksMode user={user} onBack={() => setView("sem2-home")} />}

      {/* ── Semester 2: TargetMode (unchanged) ────────── */}
      {view === "sem2-target" && <TargetMode onBack={() => setView("sem2-home")} />}

      {/* ── Semester 3: Goal Selection ────────────────── */}
      {view === "sem3-goal" && (
        <SemesterGoalSelection
          semester={3}
          onSelectMode={(mode) => {
            setSem3Mode(mode);
            setView("sem3-workspace");
          }}
          onBack={() => setView("dashboard")}
        />
      )}

      {/* ── Semester 3: Workspace ─────────────────────── */}
      {view === "sem3-workspace" && sem3Mode && (
        <Sem3Workspace
          user={user}
          college={college}
          mode={sem3Mode}
          onBack={() => {
            setView("sem3-goal");
            setSem3Mode(null);
          }}
        />
      )}

      <footer className="app-footer">
        <span className="footer-copy">
          {isSem3View
            ? "GPA Engine · SITCOE · Sem III · AY 2025-26"
            : isSem2View
              ? "GPA Engine · SITCOE · Sem II · AY 2025-26"
              : "GPA Engine · Academic Planning & Optimization Platform"
          }
        </span>
      </footer>
    </div>
  );
}

function SignOutIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
