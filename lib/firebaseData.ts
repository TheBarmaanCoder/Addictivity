import {
  doc,
  getDoc,
  setDoc,
  type DocumentReference,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import type { AppState, Skill } from '../types';
import { INITIAL_STATE, SHOP_ITEMS } from '../constants';
import { normalizeSkillTracking } from './skills';

export function getUserDocRef(uid: string): DocumentReference {
  const db = getFirebaseDb();
  return doc(db, 'users', uid);
}

export async function loadUserData(uid: string): Promise<AppState | null> {
  const docRef = getUserDocRef(uid);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  if (!data) return null;

  return migrateAppState(data as Record<string, unknown>) as AppState;
}

/** Apply migrations for older stored data */
function migrateAppState(data: Record<string, unknown>): AppState {
  const result = { ...data } as Record<string, unknown>;

  if (!result.themeId) result.themeId = 'p1';
  if (result.parkLevel === undefined) {
    result.parkLevel = 1;
    result.parkXP = 0;
    result.totalMinutesSpent = 0;
    result.unlockedParkItems = ['tree_basic'];
    result.selectedParkItems = ['tree_basic'];
  }
  if (result.selectedParkItems === undefined) {
    result.selectedParkItems = [...(result.unlockedParkItems as string[])];
  }
  if (result.unlockedAchievements === undefined) {
    result.unlockedAchievements = [];
    result.unlockedTitles = ['Explorer'];
    result.currentTitle = 'Explorer';
  }
  if (result.lifetimeGems === undefined) {
    result.lifetimeGems = result.totalGems ?? 50;
    result.totalGemsSpent = 0;
  }
  if (result.onboardingCompleted === undefined) {
    result.onboardingCompleted = true;
  }
  if (result.activeBoosters === undefined) {
    result.activeBoosters = {
      xpMultiplier: null,
      gemDoublerRemaining: 0,
      firstWinOwned: false,
      firstWinUsedForDate: null,
      momentumOwned: false,
      momentumLastClaimedDate: null,
      secondChanceAvailable: false,
      skillFocus: null,
      weeklyChallenge: null,
      gemRushRemaining: 0,
      deepWorkUsesRemaining: 0,
    };
  }

  if (Array.isArray(result.skills) && result.skills.length > 0) {
    const skills = (result.skills as Skill[]).map((s) => ({
      ...s,
      tracking: s.tracking === 'archived' ? ('archived' as const) : ('active' as const),
    }));
    result.skills = normalizeSkillTracking(skills);
  }

  const validShopIds = new Set(SHOP_ITEMS.map((i) => i.id));
  if (Array.isArray(result.unlockedParkItems)) {
    const u = (result.unlockedParkItems as string[]).filter((id) => validShopIds.has(id));
    result.unlockedParkItems = u.length > 0 ? u : ['tree_basic'];
  }
  if (Array.isArray(result.selectedParkItems)) {
    const sel = (result.selectedParkItems as string[]).filter((id) => validShopIds.has(id));
    result.selectedParkItems = sel.length > 0 ? sel : ['tree_basic'];
  }

  return result as AppState;
}

/** Firestore rejects `undefined` anywhere in a document; JSON round-trip drops those keys. */
function sanitizeForFirestore<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function saveUserData(uid: string, state: AppState): Promise<void> {
  const docRef = getUserDocRef(uid);
  const payload = sanitizeForFirestore({
    ...state,
    updatedAt: new Date().toISOString(),
  });
  await setDoc(docRef, payload, { merge: true });
}

export async function createNewUserDoc(
  uid: string,
  state: Partial<AppState> & { userName: string }
): Promise<void> {
  const docRef = getUserDocRef(uid);
  const fullState: AppState = {
    ...INITIAL_STATE,
    ...state,
    userName: state.userName,
    onboardingCompleted: state.onboardingCompleted ?? false,
  };
  const payload = sanitizeForFirestore({
    ...fullState,
    updatedAt: new Date().toISOString(),
  });
  await setDoc(docRef, payload);
}
