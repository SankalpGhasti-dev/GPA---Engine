// ============================================================
// FIREBASE CONFIG — GPA Engine
// ============================================================
// Copy .env.example → .env.local and fill in your Firebase values.
// Firebase Console → Project Settings → Your apps → Web app config
// Also enable Email/Password + Google under Authentication → Sign-in method.
// ============================================================

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "",
};

const PLACEHOLDER_VALUES = new Set([
  "",
  "YOUR_API_KEY",
  "YOUR_PROJECT_ID",
  "YOUR_MESSAGING_SENDER_ID",
  "YOUR_APP_ID",
  "your_api_key_here",
  "your_project_id",
  "your_sender_id",
]);

export function isFirebaseConfigured() {
  const required = [
    firebaseConfig.apiKey,
    firebaseConfig.authDomain,
    firebaseConfig.projectId,
    firebaseConfig.appId,
  ];
  return required.every((value) => value && !PLACEHOLDER_VALUES.has(value));
}

export function getFirebaseProjectId() {
  return firebaseConfig.projectId || "";
}

export function getFirebaseAuthSetupUrl() {
  const projectId = getFirebaseProjectId();
  return projectId
    ? `https://console.firebase.google.com/project/${projectId}/authentication/users`
    : "https://console.firebase.google.com/";
}

// Only initialize Firebase when configured — empty keys crash at import time.
let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured()) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db };
export default app;
