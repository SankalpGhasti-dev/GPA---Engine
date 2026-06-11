# GPA Engine - Installation & Setup Guide

## 📋 Prerequisites

Before starting, ensure you have:
- **Node.js** v16+ (check with `node -v`)
- **npm** v8+ (check with `npm -v`)
- **Git** (for cloning the repository)
- **A Firebase project** (for cloud features)
- **A GitHub account** (for deployment)

---

## 🚀 Quick Start (5 minutes)

### 1. Clone the Repository
```bash
git clone https://github.com/SankalpGhasti-dev/GPA---Engine.git
cd GPA---Engine
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm start
```
- Opens http://localhost:3000 automatically
- Hot-reload enabled (changes update instantly)

### 4. Try Local Mode First
- Click "Continue locally (no cloud sync)" on Auth page
- Test all features without Firebase setup

---

## 🔥 Firebase Setup (For Cloud Features)

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name: `gpa-engine-[your-name]`
4. Accept terms, skip analytics (optional)
5. Create project

### Step 2: Set Up Authentication

1. In Firebase Console → **Build** → **Authentication**
2. Click **Get started**
3. Enable **Email/Password**:
   - Click "Email/Password"
   - Toggle on "Email/password"
   - Save
4. Enable **Google**:
   - Click "Google"
   - Toggle on
   - Select your project support email
   - Save

### Step 3: Set Up Firestore Database

1. In Firebase Console → **Build** → **Firestore Database**
2. Click **Create database**
3. Choose location (closest to your region)
4. Select **Start in test mode** (for development)
5. Create

### Step 4: Configure OAuth Redirect URLs

1. In Firebase Console → **Build** → **Authentication** → **Settings**
2. Go to **Authorized JavaScript origins**
3. Add:
   - `http://localhost:3000` (development)
   - `https://SankalpGhasti-dev.github.io` (GitHub Pages)
4. Save

---

## 🔑 Environment Configuration

### Step 1: Get Firebase Config Keys

1. In Firebase Console → Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click the web app (should show `</>` icon)
4. Copy the config object:

```javascript
const config = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

### Step 2: Create .env.local File

1. In project root, create file named `.env.local`
2. Add your Firebase keys:

```env
REACT_APP_FIREBASE_API_KEY=YOUR_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

3. **DO NOT commit this file** (it's in .gitignore)

### Step 3: Restart Development Server

```bash
npm start
```

The app now loads your Firebase config!

---

## ✅ Verification Checklist

After setup, verify:

- [ ] `npm start` works without errors
- [ ] App opens at http://localhost:3000
- [ ] "Continue locally" button works
- [ ] Can enter marks and calculate SGPA
- [ ] If Firebase configured:
  - [ ] Google Sign-In button visible
  - [ ] Can sign up with email/password
  - [ ] Marks auto-save (look for "✓ Saved" badge)
  - [ ] Data persists after refresh

---

## 📝 Available Scripts

### Development
```bash
npm start      # Start dev server (http://localhost:3000)
npm test       # Run tests in watch mode
npm run test   # Same as above
```

### Production
```bash
npm run build  # Create optimized build in 'build/' folder
npm run eject  # Eject from Create React App (NOT reversible!)
```

### GitHub Pages Deployment
```bash
# First, install gh-pages package
npm install --save-dev gh-pages

# Then edit package.json homepage:
"homepage": "https://SankalpGhasti-dev.github.io/GPA---Engine"

# Deploy
npm run build
npm run deploy
```

---

## 🛠️ Configuration Files

### .env.local (Environment Variables)
```env
# Firebase Configuration (required for cloud features)
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...

# Optional: Debug logging
REACT_APP_DEBUG=true
```

### .gitignore (Version Control)
```
# Environment
.env.local
.env.*.local

# Dependencies
node_modules/

# Production
build/

# Testing
coverage/

# IDE
.vscode/
.idea/
*.swp
```

### package.json (Dependencies)
Key dependencies managed here:
- `react` - UI framework
- `firebase` - Backend services
- `@testing-library/react` - Testing utilities

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'firebase'"
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

### Issue: "Firebase is not configured"
**Solution:**
- Create `.env.local` with all Firebase keys
- Ensure keys are prefixed with `REACT_APP_`
- Restart dev server (`npm start`)

### Issue: "Port 3000 already in use"
**Solution:**
```bash
# Kill the process
# Mac/Linux:
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows (PowerShell):
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or use a different port:
PORT=3001 npm start
```

### Issue: "Firestore rules deny access"
**Solution:**
Firebase default rules in test mode allow read/write. If you've modified them, reset in Firestore Console → Rules tab:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write;
    }
  }
}
```
⚠️ **WARNING:** This is insecure for production. Use proper authentication rules.

### Issue: "Google Sign-In shows 'popup blocked' error"
**Solution:**
- Allow popups for localhost in browser settings
- Ensure `http://localhost:3000` is in Firebase authorized origins

---

## 📦 Deployment Options

### Option 1: GitHub Pages (Recommended)
```bash
# 1. Update package.json
"homepage": "https://[USERNAME].github.io/GPA---Engine"

# 2. Install gh-pages
npm install --save-dev gh-pages

# 3. Add scripts to package.json
"predeploy": "npm run build",
"deploy": "gh-pages -d build"

# 4. Deploy
npm run deploy

# Visit: https://[USERNAME].github.io/GPA---Engine
```

### Option 2: Firebase Hosting
```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Initialize Firebase
firebase init hosting

# 4. Deploy
firebase deploy

# Automatic HTTPS, custom domain support
```

### Option 3: Vercel
```bash
# 1. Push to GitHub
git push

# 2. Import to Vercel (vercel.com)
# 3. Add environment variables
# 4. Deploy (automatic)
```

---

## 🔒 Security Best Practices

### Development
- ✅ Use `.env.local` for secrets
- ✅ Never commit `.env.local`
- ✅ Use test Firebase project

### Production
- ✅ Enable **Firestore Security Rules**:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{userId} {
        allow create: if request.auth.uid == userId;
        allow read, update: if request.auth.uid == userId;
      }
      match /marks/{userId} {
        allow read, write: if request.auth.uid == userId;
      }
    }
  }
  ```
- ✅ Use **Firebase Authentication** (not custom auth)
- ✅ Review **API key restrictions** in Firebase Console
- ✅ Enable HTTPS for custom domains
- ✅ Regular backups of Firestore data

---

## 📚 Development Workflow

### Making Changes
```bash
# 1. Create a new branch
git checkout -b feature/my-feature

# 2. Make changes & test
npm start
# Test in browser: http://localhost:3000

# 3. Run tests
npm test

# 4. Commit
git add .
git commit -m "Add new feature"

# 5. Push
git push origin feature/my-feature

# 6. Create Pull Request on GitHub
```

### Typical Development Session
```bash
# Morning: Pull latest changes
git pull origin main

# Start dev server
npm start
# Make changes in code

# Afternoon: Stop server, rebuild for production
npm run build

# Evening: Commit and push
git add .
git commit -m "Update GPA calculation"
git push
```

---

## 🎓 Learning Resources

- [React Hooks Guide](https://react.dev/reference/react)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Create React App Guide](https://create-react-app.dev/)
- [JavaScript ES6+ Cheatsheet](https://es6.io/)

---

## 📞 Support

For issues:
1. Check troubleshooting section above
2. Review Firebase error messages in browser console
3. Check GitHub Issues
4. Ask on Stack Overflow with `firebase` + `react` tags

---

*Last Updated: June 2026*
