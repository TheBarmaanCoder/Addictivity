# App Store 1.0 Checklist — What's Left to Fix

**Branch tested:** `general-fixes`  
**Date:** Feb 25, 2026

---

## What I Tested

- **Backend:** All API endpoints (auth, profile, skills, tasks, shop, app-state, milestones) — ✅ working
- **XSS sanitization:** Names and task titles strip HTML — ✅ working
- **Frontend build:** ✅ succeeds
- **Frontend dev server:** ✅ starts

---

## Important: Two Separate Systems

The app has **two data layers** that don't talk to each other:

1. **Firebase** (Auth + Firestore) — What the frontend actually uses. This is what runs in production.
2. **Backend** (Fastify + PostgreSQL) — Fully built and tested, but the frontend never calls it.

For App Store 1.0, the app will run on **Firebase only**. The backend is ready for a future migration or API-first rebuild.

---

## Must Fix Before 1.0 (Critical)

### 1. Data loss when closing quickly
**Problem:** Changes are saved to Firestore with a 1-second debounce. If the user closes the tab/app within 1 second of editing, changes are lost.

**Fix:** Add a `beforeunload` listener to flush pending saves immediately when the user tries to leave.

---

### 2. No error boundaries
**Problem:** Any React error (e.g. bad data, null reference) crashes the whole app with a blank screen. No recovery.

**Fix:** Wrap major sections (Home, Profile, Shop, Settings) in `<ErrorBoundary>` components so one broken screen doesn't kill the app.

---

### 3. Task completion not obvious
**Problem:** Users complete tasks by swiping left. First-time users don't know this. No visible checkmark or hint.

**Fix:** Add a visible checkmark button on each task, or a one-time hint ("Swipe left to complete").

---

## Should Fix Before 1.0 (High Priority)

### 4. Remove or hide the Post tab
**Problem:** `ViewType` includes `'post'` and `App.tsx` renders a placeholder ("Community posts are under construction"). If it's reachable, it looks unfinished.

**Fix:** Remove `post` from navigation and routing, or hide it until the feature exists.

---

### 5. Task ID collision risk
**Problem:** Task IDs use `Date.now().toString()`. Two tasks created in the same millisecond (or recurring tasks with `-rec` suffix) can collide.

**Fix:** Use `crypto.randomUUID()` for task IDs.

---

### 6. Undo delete for tasks
**Problem:** Deleting a task is immediate and irreversible. Accidental deletes are frustrating.

**Fix:** Show a toast with "Undo" for 5 seconds before actually removing the task.

---

## Nice to Have (Lower Priority)

### 7. Onboarding: allow 0–N custom skills
**Problem:** Users must create exactly 3 custom skills. Some may want fewer or more.

**Fix:** Add "Add another" and "Remove" so users can have 0–N skills.

---

### 8. Chart performance
**Problem:** `chartData` in HomeScreen is recomputed on every render. Could slow down on large task lists.

**Fix:** Wrap in `useMemo` with proper dependencies.

---

### 9. Dark mode
**Problem:** Only light themes exist. Many users prefer dark mode.

**Fix:** Add dark theme variants (future enhancement).

---

## App Store Submission Notes

- **Privacy:** Ensure you have a Privacy Policy URL and that Firebase/Auth data handling is disclosed.
- **Firebase:** Confirm your Firebase project is configured for production (not just dev).
- **Capacitor/iOS:** Test on a real device before submission. Haptics and safe areas behave differently.
- **Bundle size:** The frontend build warned about chunks > 500 kB. Consider code-splitting for faster load.

---

## Fix Plan (Order of Work)

| Order | Fix | Status |
|-------|-----|--------|
| 1 | beforeunload flush | ✅ Done |
| 2 | Error boundaries | ✅ Done |
| 3 | Checkmark / swipe hint | ⏭️ User will implement |
| 4 | Remove Post tab | ✅ Done |
| 5 | UUID for task IDs | ✅ Done |
| 6 | Undo delete toast | ✅ Done |
