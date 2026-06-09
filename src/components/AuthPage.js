import React, { useState, useEffect } from "react";
import { auth, db, isFirebaseConfigured, getFirebaseAuthSetupUrl, getFirebaseProjectId } from "../firebase/config";
import { LOCAL_USER } from "../firebase/localAuth";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import "./AuthPage.css";

// ── Password Strength ────────────────────────────────────────
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const levels = [
    { label: "", color: "" },
    { label: "Very Weak", color: "#c03030" },
    { label: "Weak", color: "#b07a30" },
    { label: "Fair", color: "#b8a020" },
    { label: "Good", color: "#2e8b6a" },
    { label: "Strong", color: "#3ab882" },
  ];
  return { score, ...levels[Math.min(score, 5)] };
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── Firebase error messages ──────────────────────────────────
function firebaseErrorMessage(code) {
  const map = {
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/popup-blocked": "Popup was blocked. Allow popups for this site.",
    "auth/popup-closed-by-user": "",
    "auth/invalid-api-key": "Firebase is not configured. Add your keys to .env.local and restart the app.",
    "auth/operation-not-allowed": "Email/Password sign-in is disabled. Enable it in Firebase Console → Authentication → Sign-in method.",
    "auth/configuration-not-found": "Firebase Authentication is not enabled for this project yet.",
  };
  return map[code] || "Something went wrong. Please try again.";
}

function isAuthNotEnabledError(code) {
  return code === "auth/configuration-not-found";
}

const googleProvider = new GoogleAuthProvider();

// ── Create user Firestore doc on first sign-up ───────────────
async function createUserDoc(user, name) {
  if (!db) return;
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      name: name || user.displayName || "",
      email: user.email,
      createdAt: serverTimestamp(),
      rollNo: "",
    });
  }
}

// ── MAIN COMPONENT ───────────────────────────────────────────
export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup' | 'forgot'
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [authNotEnabled, setAuthNotEnabled] = useState(false);

  const authSetupUrl = getFirebaseAuthSetupUrl();
  const firebaseProjectId = getFirebaseProjectId();

  useEffect(() => {
    if (!isFirebaseConfigured() || !auth) return;

    fetchSignInMethodsForEmail(auth, "setup-check@gpa-engine.app")
      .catch((err) => {
        if (isAuthNotEnabledError(err.code)) setAuthNotEnabled(true);
      });
  }, []);

  const showAuthSetupHelp = authNotEnabled || globalError === firebaseErrorMessage("auth/configuration-not-found");

  const strength = getPasswordStrength(form.password);

  const setField = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: "" }));
    setGlobalError("");
  };

  const switchMode = (m) => {
    setMode(m);
    setErrors({});
    setGlobalError("");
    setForgotSent(false);
    setForm({ name: "", email: "", password: "", confirm: "" });
    setShowPass(false);
    setShowConfirm(false);
  };

  const validate = () => {
    const e = {};
    if (mode === "signup" && !form.name.trim()) e.name = "Full name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!validateEmail(form.email)) e.email = "Enter a valid email address.";
    if (!form.password) e.password = "Password is required.";
    else if (mode === "signup" && form.password.length < 8) e.password = "Password must be at least 8 characters.";
    if (mode === "signup" && form.password !== form.confirm)
      e.confirm = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Email/Password Submit ────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!isFirebaseConfigured()) {
      setGlobalError("Firebase is not configured. Add your keys to .env.local and restart the app.");
      return;
    }
    setLoading(true);
    setGlobalError("");
    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await updateProfile(cred.user, { displayName: form.name });
        try {
          await createUserDoc(cred.user, form.name);
        } catch (docErr) {
          console.warn("Could not create user profile in Firestore:", docErr);
        }
        onAuth(cred.user);
      } else {
        const cred = await signInWithEmailAndPassword(auth, form.email, form.password);
        onAuth(cred.user);
      }
    } catch (err) {
      if (isAuthNotEnabledError(err.code)) setAuthNotEnabled(true);
      const msg = firebaseErrorMessage(err.code);
      if (msg) setGlobalError(msg);
      else console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ── Google Sign-In ───────────────────────────────────────
  const handleGoogle = async () => {
    if (!isFirebaseConfigured()) {
      setGlobalError("Firebase is not configured. Add your keys to .env.local and restart the app.");
      return;
    }
    setLoading(true);
    setGlobalError("");
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      try {
        await createUserDoc(cred.user, cred.user.displayName);
      } catch (docErr) {
        console.warn("Could not create user profile in Firestore:", docErr);
      }
      onAuth(cred.user);
    } catch (err) {
      if (isAuthNotEnabledError(err.code)) setAuthNotEnabled(true);
      const msg = firebaseErrorMessage(err.code);
      if (msg) setGlobalError(msg);
      else console.error("Google auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocalContinue = () => {
    onAuth(LOCAL_USER);
  };

  // ── Forgot Password ──────────────────────────────────────
  const handleForgot = async (e) => {
    e.preventDefault();
    if (!isFirebaseConfigured()) {
      setGlobalError("Firebase is not configured. Add your keys to .env.local and restart the app.");
      return;
    }
    if (!form.email.trim() || !validateEmail(form.email)) {
      setErrors({ email: "Enter a valid email address." });
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, form.email);
      setForgotSent(true);
    } catch (err) {
      if (isAuthNotEnabledError(err.code)) setAuthNotEnabled(true);
      const msg = firebaseErrorMessage(err.code);
      if (msg) setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── RENDER ───────────────────────────────────────────────
  return (
    <div className="auth-root">

      {/* ── LEFT BRANDING PANEL ── */}
      <div className="auth-brand">
        <div className="ab-glow" />
        <div className="ab-grid-overlay" />

        <div className="ab-content">
          <div className="ab-logo-row">
            <span className="ab-sem-badge">SEM II</span>
            <h1 className="ab-app-title">GPA Engine</h1>
          </div>
          <p className="ab-tagline">Academic Reverse Engineering System</p>

          <div className="ab-features">
            {[
              { icon: "🎯", title: "Target SGPA Planner", sub: "Know exactly what marks you need" },
              { icon: "📊", title: "Grade Boundary Analysis", sub: "Find subjects closest to a grade upgrade" },
              { icon: "⚡", title: "Credit Leverage Engine", sub: "Maximise SGPA with minimum effort" },
              { icon: "☁️", title: "Cloud-Sync Progress", sub: "Your marks saved across all devices" },
            ].map((f) => (
              <div key={f.title} className="ab-feat">
                <span className="ab-feat-icon">{f.icon}</span>
                <div>
                  <div className="ab-feat-title">{f.title}</div>
                  <div className="ab-feat-sub">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="ab-sgpa-card">
            <div className="ab-sgpa-header">SGPA SIMULATOR</div>
            <div className="ab-sgpa-number">9.2</div>
            <div className="ab-sgpa-status">Target achievable · 3 subjects remaining</div>
            <div className="ab-sgpa-bar">
              <div className="ab-sgpa-fill" style={{ width: "92%" }} />
            </div>
          </div>
        </div>

        <div className="ab-footer-text">SITCOE · BTECH CS · AY 2025–26</div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="auth-panel">
        <div className="auth-card">
          {!isFirebaseConfigured() && (
            <div className="auth-config-banner" role="status">
              <strong>Firebase not set up yet.</strong>
              <span>Copy <code>.env.example</code> to <code>.env.local</code>, add your Firebase keys, then restart <code>npm start</code>.</span>
              <button type="button" className="auth-local-btn" onClick={handleLocalContinue}>
                Continue locally (no cloud sync)
              </button>
            </div>
          )}

          {isFirebaseConfigured() && showAuthSetupHelp && (
            <div className="auth-setup-banner" role="alert">
              <strong>One-time Firebase setup required</strong>
              <span>Your API keys are correct, but Authentication is not turned on in Firebase yet.</span>
              <ol className="auth-setup-steps">
                <li>Open Firebase Console → project <strong>{firebaseProjectId}</strong></li>
                <li>Go to <strong>Build → Authentication</strong></li>
                <li>Click <strong>Get started</strong></li>
                <li>Sign-in method → enable <strong>Email/Password</strong> and <strong>Google</strong></li>
              </ol>
              <a
                href={authSetupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="auth-setup-link"
              >
                Open Firebase Authentication setup →
              </a>
            </div>
          )}

          {/* FORGOT PASSWORD FLOW */}
          {mode === "forgot" ? (
            <div className="auth-form-section">
              <div className="auth-heading">
                <h2>{forgotSent ? "Check Your Email" : "Reset Password"}</h2>
                <p>
                  {forgotSent
                    ? `A reset link has been sent to ${form.email}`
                    : "Enter your account email to receive a reset link."}
                </p>
              </div>

              {forgotSent ? (
                <div className="auth-success-box">
                  <div className="auth-success-check">✓</div>
                  <p>Didn't get it? Check your spam folder.</p>
                </div>
              ) : (
                <form onSubmit={handleForgot} className="auth-form" noValidate>
                  <div className={`af-field ${errors.email ? "has-error" : ""}`}>
                    <label htmlFor="forgot-email">Email Address</label>
                    <div className="af-input-wrap">
                      <span className="af-icon">
                        <MailIcon />
                      </span>
                      <input
                        id="forgot-email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) => setField("email", e.target.value)}
                        autoFocus
                        autoComplete="email"
                      />
                    </div>
                    {errors.email && <span className="af-error">{errors.email}</span>}
                  </div>
                  {globalError && <div className="auth-global-error">{globalError}</div>}
                  <button type="submit" id="forgot-submit-btn" className="auth-submit-btn" disabled={loading}>
                    {loading ? <Spinner /> : "Send Reset Link"}
                  </button>
                </form>
              )}

              <button className="auth-back-link" onClick={() => switchMode("signin")}>
                ← Back to Sign In
              </button>
            </div>
          ) : (
            <>
              {/* MODE TOGGLE TABS */}
              <div className="auth-mode-tabs">
                <button
                  id="signin-tab-btn"
                  className={`amt-tab ${mode === "signin" ? "active" : ""}`}
                  onClick={() => switchMode("signin")}
                >Sign In</button>
                <button
                  id="signup-tab-btn"
                  className={`amt-tab ${mode === "signup" ? "active" : ""}`}
                  onClick={() => switchMode("signup")}
                >Sign Up</button>
                <div className={`amt-slider ${mode === "signup" ? "right" : "left"}`} />
              </div>

              <div className="auth-form-section">
                <div className="auth-heading">
                  <h2>{mode === "signin" ? "Welcome back" : "Create account"}</h2>
                  <p>
                    {mode === "signin"
                      ? "Sign in to access your saved GPA data."
                      : "Start planning your academic roadmap today."}
                  </p>
                </div>

                {/* GOOGLE BUTTON */}
                <button
                  id="google-signin-btn"
                  className="auth-google-btn"
                  onClick={handleGoogle}
                  disabled={loading}
                >
                  <GoogleIcon />
                  Continue with Google
                </button>

                <div className="auth-divider">
                  <span>or continue with email</span>
                </div>

                {/* MAIN FORM */}
                <form onSubmit={handleSubmit} className="auth-form" noValidate>

                  {/* NAME — sign up only */}
                  {mode === "signup" && (
                    <div className={`af-field ${errors.name ? "has-error" : ""}`}>
                      <label htmlFor="signup-name">Full Name</label>
                      <div className="af-input-wrap">
                        <span className="af-icon"><UserIcon /></span>
                        <input
                          id="signup-name"
                          type="text"
                          placeholder="Your full name"
                          value={form.name}
                          onChange={(e) => setField("name", e.target.value)}
                          autoFocus
                          autoComplete="name"
                        />
                      </div>
                      {errors.name && <span className="af-error">{errors.name}</span>}
                    </div>
                  )}

                  {/* EMAIL */}
                  <div className={`af-field ${errors.email ? "has-error" : ""}`}>
                    <label htmlFor="auth-email">Email Address</label>
                    <div className="af-input-wrap">
                      <span className="af-icon"><MailIcon /></span>
                      <input
                        id="auth-email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) => setField("email", e.target.value)}
                        autoFocus={mode === "signin"}
                        autoComplete="email"
                      />
                    </div>
                    {errors.email && <span className="af-error">{errors.email}</span>}
                  </div>

                  {/* PASSWORD */}
                  <div className={`af-field ${errors.password ? "has-error" : ""}`}>
                    <div className="af-label-row">
                      <label htmlFor="auth-password">Password</label>
                      {mode === "signin" && (
                        <button
                          type="button"
                          id="forgot-password-link"
                          className="af-forgot-link"
                          onClick={() => switchMode("forgot")}
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="af-input-wrap">
                      <span className="af-icon"><LockIcon /></span>
                      <input
                        id="auth-password"
                        type={showPass ? "text" : "password"}
                        placeholder={mode === "signup" ? "Min. 8 characters" : "Enter your password"}
                        value={form.password}
                        onChange={(e) => setField("password", e.target.value)}
                        autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      />
                      <button
                        type="button"
                        className="af-eye-btn"
                        onClick={() => setShowPass((p) => !p)}
                        tabIndex={-1}
                        aria-label={showPass ? "Hide password" : "Show password"}
                      >
                        {showPass ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    {errors.password && <span className="af-error">{errors.password}</span>}

                    {/* Password strength meter */}
                    {mode === "signup" && form.password && (
                      <div className="pw-strength">
                        <div className="pw-bars">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className="pw-bar"
                              style={{ background: i <= strength.score ? strength.color : "" }}
                            />
                          ))}
                        </div>
                        <span className="pw-label" style={{ color: strength.color }}>
                          {strength.label}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CONFIRM PASSWORD — sign up only */}
                  {mode === "signup" && (
                    <div className={`af-field ${errors.confirm ? "has-error" : ""}`}>
                      <label htmlFor="auth-confirm">Confirm Password</label>
                      <div className="af-input-wrap">
                        <span className="af-icon"><LockIcon /></span>
                        <input
                          id="auth-confirm"
                          type={showConfirm ? "text" : "password"}
                          placeholder="Repeat your password"
                          value={form.confirm}
                          onChange={(e) => setField("confirm", e.target.value)}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="af-eye-btn"
                          onClick={() => setShowConfirm((p) => !p)}
                          tabIndex={-1}
                          aria-label={showConfirm ? "Hide password" : "Show password"}
                        >
                          {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>
                      {errors.confirm && <span className="af-error">{errors.confirm}</span>}
                    </div>
                  )}

                  {globalError && (
                    <div className="auth-global-error" role="alert">
                      {globalError}
                    </div>
                  )}

                  <button
                    type="submit"
                    id="auth-submit-btn"
                    className="auth-submit-btn"
                    disabled={loading}
                  >
                    {loading ? <Spinner /> : mode === "signin" ? "Sign In" : "Create Account"}
                  </button>
                </form>

                <p className="auth-switch-text">
                  {mode === "signin" ? "Don't have an account?" : "Already have an account?"}
                  {" "}
                  <button
                    id="auth-mode-switch-btn"
                    className="auth-inline-link"
                    onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
                  >
                    {mode === "signin" ? "Sign Up free" : "Sign In"}
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
        <p className="auth-panel-footer">
          GPA Engine · SITCOE · Sem II · AY 2025–26
        </p>
      </div>
    </div>
  );
}

// ── Inline SVG Icons ─────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function Spinner() {
  return <span className="auth-spinner" aria-label="Loading" />;
}
