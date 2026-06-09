import React, { useState, useEffect } from "react";
import "./App.css";
import MarksMode from "./components/MarksMode";
import TargetMode from "./components/TargetMode";
import AuthPage from "./components/AuthPage";
import { TOTAL_CREDITS } from "./data/engine";
import { auth, isFirebaseConfigured } from "./firebase/config";
import { isLocalUser } from "./firebase/localAuth";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function App() {
  const [mode, setMode] = useState(null);
  const [user, setUser] = useState(undefined); // undefined = loading, null = not logged in

  // ── Auth state listener ────────────────────────────────
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

  const handleSignOut = async () => {
    try {
      if (isLocalUser(user)) {
        setUser(null);
        setMode(null);
        return;
      }
      if (!auth) {
        setUser(null);
        setMode(null);
        return;
      }
      await signOut(auth);
      setUser(null);
      setMode(null);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  // ── Loading state while Firebase checks session ────────
  if (user === undefined) {
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

  // ── Logged in → show main app ──────────────────────────
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <span className="logo-badge">SEM II</span>
            <h1 className="app-title">GPA Engine</h1>
            <p className="app-sub">BTECH CS · F.Y. · AY 2025-26 · Academic Reverse Engineering System</p>
          </div>
          <div className="header-actions">
            {mode && (
              <button className="back-btn" onClick={() => setMode(null)}>← Back</button>
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

      {!mode && (
        <main className="home">
          <div className="home-headline">
            <h2>What's your goal?</h2>
            <p>This is not a calculator. This tells you the <em>minimum actions</em> needed to reach your target GPA.</p>
          </div>
          <div className="mode-cards">
            <div className="mode-card" onClick={() => setMode("marks")}>
              <div className="mode-icon">📝</div>
              <h3>I have some marks</h3>
              <p>Enter your CA1, CA2, Midsem scores. The engine calculates exactly what you need in Endsem to hit your target SGPA — subject by subject.</p>
              <span className="mode-tag">Reverse Engineer</span>
            </div>
            <div className="mode-card" onClick={() => setMode("target")}>
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

      {mode === "marks" && <MarksMode user={user} onBack={() => setMode(null)} />}
      {mode === "target" && <TargetMode onBack={() => setMode(null)} />}

      <footer className="app-footer">
        <span className="footer-copy">GPA Engine · SITCOE · Sem II · AY 2025-26</span>
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
