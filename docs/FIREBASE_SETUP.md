# Firebase Setup Guide for Addictivity

This guide walks you through setting up Firebase (Authentication + Firestore) for Addictivity and enabling Google Sign-In.

---

## Step 1: Create a Firebase Project

1. Go to **[Firebase Console](https://console.firebase.google.com/)** and sign in with your Google account.
2. Click **Create a project** (or select an existing one).
3. Enter a project name (e.g. `addictivity`) and click **Continue**.
4. Disable Google Analytics if you don't need it, then click **Create project**.
5. When the project is ready, click **Continue**.

---

## Step 2: Register Your Web App

1. On the Project Overview page, click the **Web** icon (`</>`) to add a web app.
2. Enter an app nickname (e.g. `Addictivity Web`).
3. Do **not** check "Firebase Hosting" unless you plan to deploy.
4. Click **Register app**.
5. Copy the `firebaseConfig` object shown. You'll need these values:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

---

## Step 3: Enable Authentication (Google + Email/Password)

1. In the left sidebar, go to **Build** → **Authentication**.
2. Click **Get started**.
3. Under **Sign-in method**, click **Google**:
   - Toggle **Enable**.
   - Choose a **Project support email** (your email).
   - Click **Save**.
4. Under **Sign-in method**, click **Email/Password**:
   - Toggle **Enable** for both "Email/Password" and (optional) "Email link".
   - Click **Save**.
5. Under **Settings** → **Authorized domains**, ensure `localhost` and your production domain are listed.

---

## Step 4: Create Firestore Database

1. In the left sidebar, go to **Build** → **Firestore Database**.
2. Click **Create database**.
3. Choose **Start in test mode** (for development) or **Production mode** (with rules) and click **Next**.
4. Pick a location (e.g. `us-central1`) and click **Enable**.
5. Go to the **Rules** tab and replace the rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

6. Click **Publish**.

---

## Step 5: Add Environment Variables

1. In your project root, copy the example env file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your Firebase values:

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

3. Save the file. **Never commit `.env.local`** to version control (it should already be in `.gitignore`).

---

## Step 6: Run the App

```bash
npm install
npm run dev
```

1. Open `http://localhost:3000` in your browser.
2. You should see the Auth screen with "Continue with Google" and email/password fields.
3. Sign in with Google or create an account with email/password.

---

## Summary Checklist

- [ ] Firebase project created
- [ ] Web app registered and config copied
- [ ] Google sign-in enabled in Authentication
- [ ] Email/Password sign-in enabled in Authentication
- [ ] Firestore database created
- [ ] Firestore security rules published
- [ ] `.env.local` created with all `VITE_FIREBASE_*` variables
- [ ] App runs and sign-in works

---

## Troubleshooting

- **"Firebase Setup Required"** – Your `.env.local` is missing or values are wrong. Restart the dev server after changing env vars.
- **"auth/popup-blocked"** – Allow popups for localhost.
- **Firestore permission denied** – Ensure your Firestore rules allow `request.auth.uid == userId` for `/users/{userId}`.
- **CORS / auth domain** – Add your domain under Authentication → Settings → Authorized domains.
