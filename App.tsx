import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ViewType, AppState, Task, Skill, ShopItem, Achievement, BoosterShopItem } from './types';
import { impactMedium, notificationSuccess } from './lib/haptics';
import { INITIAL_STATE, THEMES, SHOP_ITEMS, ACHIEVEMENTS, BOOSTER_SHOP_ITEMS, WEEKLY_GOALS } from './constants';
import { applyTheme } from './lib/theme';
import { onAuthStateChanged, logOut as firebaseLogOut, getRedirectResultIfAny, type User } from './lib/firebaseAuth';
import { loadUserData, saveUserData, createNewUserDoc } from './lib/firebaseData';
import { isFirebaseConfigured } from './lib/firebase';
import BottomNav from './components/BottomNav';
import HomeScreen from './screens/HomeScreen';
import AddTaskScreen from './screens/AddTaskScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import ThemeSelectionScreen from './screens/ThemeSelectionScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import ContactScreen from './screens/ContactScreen';
import AuthScreen from './screens/AuthScreen';
import ShopScreen from './screens/ShopScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import MilestoneCelebration from './components/MilestoneCelebration';
import RewardToast from './components/RewardToast';
import UndoToast from './components/UndoToast';
import { ErrorBoundary } from './components/ErrorBoundary';

const MODAL_VIEWS: ViewType[] = ['addTask', 'themeSelection', 'editProfile', 'contact'];

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const currentUserEmail = currentUser?.email ?? null;

  // App State
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [appState, setAppState] = useState<AppState>(INITIAL_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Celebration / reward state
  const [newlyUnlockedAchievement, setNewlyUnlockedAchievement] = useState<Achievement | null>(null);
  const [rewardToast, setRewardToast] = useState<{ xp: number; gems: number } | null>(null);
  const pendingRewardRef = useRef<{ xp: number; gems: number } | null>(null);
  const boosterPurchasedRef = useRef(false);

  const mainScrollRef = useRef<HTMLDivElement>(null);

  const changeView = useCallback((view: ViewType) => {
    if (view === 'addTask') setEditingTask(null);
    setCurrentView(view);
  }, []);

  useEffect(() => {
    mainScrollRef.current && (mainScrollRef.current.scrollTop = 0);
  }, [currentView]);

  // Debounced Firestore save
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveRef = useRef<{ uid: string; state: AppState } | null>(null);
  const saveToFirestore = useCallback((uid: string, state: AppState) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    pendingSaveRef.current = { uid, state };
    saveTimeoutRef.current = setTimeout(() => {
      saveUserData(uid, state).catch((e) => console.error('Firestore save failed:', e));
      saveTimeoutRef.current = null;
      pendingSaveRef.current = null;
    }, 1000);
  }, []);

  // Flush pending save on page unload or tab hide to prevent data loss
  useEffect(() => {
    const flushPendingSave = () => {
      if (saveTimeoutRef.current && pendingSaveRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
        const { uid, state } = pendingSaveRef.current;
        saveUserData(uid, state).catch((e) => console.error('Firestore save failed:', e));
        pendingSaveRef.current = null;
      }
    };
    window.addEventListener('beforeunload', flushPendingSave);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flushPendingSave();
    });
    return () => {
      window.removeEventListener('beforeunload', flushPendingSave);
    };
  }, []);

  // 1. Firebase Auth State (redirect result first so native Google sign-in completes)
  const authUnsubRef = useRef<ReturnType<typeof onAuthStateChanged> | null>(null);
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setIsLoaded(true);
      return;
    }

    getRedirectResultIfAny()
      .catch(() => {})
      .then(() => {
        authUnsubRef.current = onAuthStateChanged((user) => {
          if (!user) {
            setCurrentUser(null);
            setIsAuthenticated(false);
            setAppState(INITIAL_STATE);
            setIsLoaded(true);
            return;
          }

          // Only allow @gmail.com accounts
          if (!user.email?.toLowerCase().endsWith('@gmail.com')) {
            firebaseLogOut();
            setCurrentUser(null);
            setIsAuthenticated(false);
            setAppState(INITIAL_STATE);
            setIsLoaded(true);
            return;
          }

          setCurrentUser(user);
          loadUserData(user.uid)
            .then((data) => {
              if (data) {
                setAppState(data);
                setIsAuthenticated(true);
              } else {
                const userName = user.displayName || user.email?.split('@')[0] || 'Explorer';
                const newState: AppState = {
                  ...INITIAL_STATE,
                  userName,
                  onboardingCompleted: false,
                };
                return createNewUserDoc(user.uid, newState).then(() => {
                  setAppState(newState);
                  setIsAuthenticated(true);
                });
              }
            })
            .catch((e) => console.error('Auth load error:', e))
            .finally(() => setIsLoaded(true));
        });
      })
      .catch(() => setIsLoaded(true));

    return () => {
      authUnsubRef.current?.();
      authUnsubRef.current = null;
    };
  }, []);

  // 2. Persist appState to Firestore when authenticated
  useEffect(() => {
    if (isLoaded && isAuthenticated && currentUser && appState.onboardingCompleted) {
      saveToFirestore(currentUser.uid, appState);
    }
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [appState, isLoaded, isAuthenticated, currentUser, saveToFirestore]);

  useEffect(() => {
    applyTheme(appState.themeId);
  }, [appState.themeId]);

  const handleLogout = () => {
    impactMedium();
    firebaseLogOut();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAppState(INITIAL_STATE);
    setCurrentView('home');
  };

  const handleOnboardingComplete = (updatedSkills: Skill[]) => {
    setAppState((prev) => ({
      ...prev,
      skills: updatedSkills,
      onboardingCompleted: true,
    }));
  };

  const handleAddTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      completed: false,
    };
    setAppState(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));
    setCurrentView('home');
  };

  const handleUpdateTask = (taskId: string, taskData: Omit<Task, 'id' | 'completed'>) => {
    setAppState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t =>
        t.id === taskId
          ? { ...t, ...taskData }
          : t
      ),
    }));
    setEditingTask(null);
    setCurrentView('home');
  };

  const [undoDeleteTask, setUndoDeleteTask] = useState<Task | null>(null);

  const handleDeleteTask = (taskId: string) => {
    const task = appState.tasks.find(t => t.id === taskId);
    if (!task) return;
    setAppState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId)
    }));
    setUndoDeleteTask(task);
  };

  const handleUndoDelete = () => {
    if (undoDeleteTask) {
      setAppState(prev => ({
        ...prev,
        tasks: [...prev.tasks, undoDeleteTask]
      }));
      setUndoDeleteTask(null);
    }
  };

  const getStreakMultiplier = (streak: number) => {
    if (streak >= 15) return 1.15;
    if (streak >= 8) return 1.10;
    if (streak >= 4) return 1.05;
    return 1.0;
  };

  const getSkillLevel = (xp: number) => Math.floor(Math.sqrt(xp / 120)) + 1;
  const getParkLevelFromXP = (xp: number) => {
    let level = 1;
    while (xp >= Math.floor(100 * Math.pow(level + 1, 1.5))) {
      level++;
    }
    return level;
  };
  const getGlobalLevel = (totalXP: number) => Math.floor(Math.sqrt(totalXP / 40)) + 1;

  // --- COMPREHENSIVE ACHIEVEMENT CHECKER ---
  const checkAchievements = (state: AppState) => {
    const unlockedIds = [...state.unlockedAchievements];
    const unlockedTitles = [...state.unlockedTitles];
    let bonusGems = 0;
    const newlyUnlocked: Achievement[] = [];

    // Pre-calculate common stats for checking
    const totalMinutes = state.totalMinutesSpent;
    const completedTasks = state.tasks.filter(t => t.completed && t.completedAt);
    const totalTasks = completedTasks.length;
    const totalXP = state.skills.reduce((acc, s) => acc + s.totalPoints, 0);
    const globalLvl = getGlobalLevel(totalXP);
    const skillLevels = state.skills.map(s => getSkillLevel(s.totalPoints));
    
    // Unique Skills
    const skillsWithTime = state.skills.filter(s => s.totalMinutes > 0).length;

    // Date calculations
    const uniqueDays = new Set(completedTasks.map(t => new Date(t.completedAt!).toDateString())).size;
    
    // Calculate global streak (approximated by max dates sequence, simplifying to max skill streak for now or actual date calc)
    // For 'streak_days', let's use the actual dates.
    const sortedDates = Array.from(new Set(completedTasks.map(t => new Date(t.completedAt!).toDateString())))
        .map(s => new Date(s))
        .sort((a, b) => a.getTime() - b.getTime());
    
    let maxStreak = 0;
    let currentStreak = 0;
    for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0) {
            currentStreak = 1;
        } else {
            const diff = (sortedDates[i].getTime() - sortedDates[i-1].getTime()) / (1000 * 3600 * 24);
            if (Math.round(diff) === 1) {
                currentStreak++;
            } else {
                currentStreak = 1;
            }
        }
        if (currentStreak > maxStreak) maxStreak = currentStreak;
    }

    // Daily Stats (For 'today')
    const todayStr = new Date().toDateString();
    const tasksToday = completedTasks.filter(t => new Date(t.completedAt!).toDateString() === todayStr);
    const dailyTasksCount = tasksToday.length;
    const dailyMinutesCount = tasksToday.reduce((acc, t) => acc + (t.minutesSpent || 0), 0);

    // Inactivity Return Logic
    // Sort tasks by completedAt descending
    const sortedTasks = [...completedTasks].sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
    let maxInactivityGap = 0;
    if (sortedTasks.length >= 2) {
        // Only check the gap between the *latest* task and the *previous* one, 
        // because "Return ... after inactivity" implies the event just happened.
        // Or should we check history? The prompt implies "Return and log...", so it's a trigger on the latest action.
        const latest = new Date(sortedTasks[0].completedAt!);
        const previous = new Date(sortedTasks[1].completedAt!);
        const diffDays = (latest.getTime() - previous.getTime()) / (1000 * 3600 * 24);
        maxInactivityGap = diffDays;
    }

    ACHIEVEMENTS.forEach(ach => {
        if (unlockedIds.includes(ach.id)) return;

        let isMet = false;

        switch (ach.category) {
            case 'total_tasks':
                if (totalTasks >= ach.requirementValue) isMet = true;
                break;
            case 'total_minutes':
                if (totalMinutes >= ach.requirementValue) isMet = true;
                break;
            case 'skill_level_any':
                if (skillLevels.some(l => l >= ach.requirementValue)) isMet = true;
                break;
            case 'skill_level_count':
                const count = skillLevels.filter(l => l >= (ach.metaValue || 0)).length;
                if (count >= ach.requirementValue) isMet = true;
                break;
            case 'unique_skills':
                if (skillsWithTime >= ach.requirementValue) isMet = true;
                break;
            case 'global_level':
                if (globalLvl >= ach.requirementValue) isMet = true;
                break;
            case 'park_level':
                if (state.parkLevel >= ach.requirementValue) isMet = true;
                break;
            case 'items_unlocked':
                if (state.unlockedParkItems.length >= ach.requirementValue) isMet = true;
                break;
            case 'gems_spent':
                if (state.totalGemsSpent >= ach.requirementValue) isMet = true;
                break;
            case 'lifetime_gems':
                if (state.lifetimeGems >= ach.requirementValue) isMet = true;
                break;
            case 'unique_days':
                if (uniqueDays >= ach.requirementValue) isMet = true;
                break;
            case 'streak_days':
                if (maxStreak >= ach.requirementValue) isMet = true;
                break;
            case 'daily_tasks':
                if (dailyTasksCount >= ach.requirementValue) isMet = true;
                break;
            case 'daily_minutes':
                if (dailyMinutesCount >= ach.requirementValue) isMet = true;
                break;
            case 'inactivity_return':
                if (maxInactivityGap >= ach.requirementValue) isMet = true;
                break;
        }

        if (isMet) {
            unlockedIds.push(ach.id);
            bonusGems += ach.gemReward;
            if (ach.titleReward && !unlockedTitles.includes(ach.titleReward)) {
                unlockedTitles.push(ach.titleReward);
            }
            newlyUnlocked.push(ach);
        }
    });

    return { 
        unlockedIds, 
        unlockedTitles, 
        bonusGems, 
        newlyUnlocked,
        hasUpdates: newlyUnlocked.length > 0 
    };
  };


  const handleCompleteTask = (taskId: string, minutes: number, intensityMultiplier: number = 1.0) => {
    setAppState(prev => {
      const task = prev.tasks.find(t => t.id === taskId);
      if (!task) return prev;

      const skill = prev.skills.find(s => s.id === task.skillId);
      if (!skill) return prev;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayStr = today.toISOString().slice(0, 10);

      // Clean expired boosters
      let boosters = { ...prev.activeBoosters };
      if (boosters.xpMultiplier && new Date(boosters.xpMultiplier.expiresAt) <= now) {
        boosters = { ...boosters, xpMultiplier: null };
      }
      if (boosters.skillFocus && new Date(boosters.skillFocus.expiresAt) <= now) {
        boosters = { ...boosters, skillFocus: null };
      }
      if (boosters.weeklyChallenge && new Date(boosters.weeklyChallenge.expiresAt) <= now) {
        boosters = { ...boosters, weeklyChallenge: null };
      }

      // Streak (with Second Chance: if gap > 1 day and secondChanceAvailable, treat as 1 day)
      let currentStreak = skill.streak || 0;
      let lastCompletedDate: Date | null = skill.lastSkillCompletedAt ? new Date(skill.lastSkillCompletedAt) : null;
      let usedSecondChance = false;
      if (lastCompletedDate) {
        lastCompletedDate = new Date(lastCompletedDate.getFullYear(), lastCompletedDate.getMonth(), lastCompletedDate.getDate());
        const diffInMs = today.getTime() - lastCompletedDate.getTime();
        let diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        if (diffInDays > 1 && boosters.secondChanceAvailable) {
          diffInDays = 1;
          usedSecondChance = true;
          boosters = { ...boosters, secondChanceAvailable: false };
        }
        if (diffInDays === 1) currentStreak += 1;
        else if (diffInDays > 1) currentStreak = Math.max(0, currentStreak - (diffInDays - 1)) + 1;
      } else {
        currentStreak = 1;
      }

      const streakMultiplier = getStreakMultiplier(currentStreak);
      let totalMultiplier = intensityMultiplier * streakMultiplier;
      let xpEarned = Math.floor(minutes * totalMultiplier);

      // XP boosters: xpMultiplier, skillFocus 1.2x, deepWork +10%
      if (boosters.xpMultiplier) {
        xpEarned = Math.floor(xpEarned * boosters.xpMultiplier.multiplier);
      }
      if (boosters.skillFocus && task.skillId === boosters.skillFocus.skillId) {
        xpEarned = Math.floor(xpEarned * 1.2);
      }
      if (minutes >= 25 && boosters.deepWorkUsesRemaining > 0) {
        xpEarned = Math.floor(xpEarned * 1.1);
        boosters = { ...boosters, deepWorkUsesRemaining: boosters.deepWorkUsesRemaining - 1 };
      }

      // Base gems
      let gemsEarned = Math.floor(minutes);
      if (boosters.gemDoublerRemaining > 0) {
        gemsEarned *= 2;
        boosters = { ...boosters, gemDoublerRemaining: boosters.gemDoublerRemaining - 1 };
      }
      const tasksDoneTodayBefore = prev.tasks.filter(t => t.completed && t.completedAt && new Date(t.completedAt).toDateString() === today.toDateString()).length;
      const isFirstTaskToday = tasksDoneTodayBefore === 0;
      if (boosters.firstWinOwned && boosters.firstWinUsedForDate !== todayStr && isFirstTaskToday) {
        gemsEarned *= 2;
        boosters = { ...boosters, firstWinUsedForDate: todayStr };
      }
      if (boosters.gemRushRemaining > 0) {
        gemsEarned += 5;
        boosters = { ...boosters, gemRushRemaining: boosters.gemRushRemaining - 1 };
      }
      const tasksDoneTodayAfter = tasksDoneTodayBefore + 1;
      if (boosters.momentumOwned && tasksDoneTodayAfter === 2 && boosters.momentumLastClaimedDate !== todayStr) {
        gemsEarned += 15;
        boosters = { ...boosters, momentumLastClaimedDate: todayStr };
      }

      const oldLvl = getSkillLevel(skill.totalPoints);
      const newLvl = getSkillLevel(skill.totalPoints + xpEarned);
      const levelUpBonus = (newLvl > oldLvl) ? (newLvl - oldLvl) * 10 : 0;
      const timeXP = (minutes / 60) * 5;
      const addedParkXP = levelUpBonus + timeXP;

      const updatedSkills = prev.skills.map(s => {
        if (s.id === task.skillId) {
          return {
            ...s,
            streak: currentStreak,
            lastSkillCompletedAt: now.toISOString(),
            totalMinutes: s.totalMinutes + minutes,
            totalPoints: s.totalPoints + xpEarned
          };
        }
        return s;
      });

      let updatedTasks = prev.tasks.map(t =>
        t.id === taskId ? { ...t, completed: true, completedAt: now.toISOString(), minutesSpent: minutes } : t
      );

      if (task.recurrence && task.dueDate) {
        const nextDate = new Date(task.dueDate);
        const { value, unit } = task.recurrence;
        if (unit === 'Days') nextDate.setDate(nextDate.getDate() + value);
        if (unit === 'Weeks') nextDate.setDate(nextDate.getDate() + (value * 7));
        if (unit === 'Months') nextDate.setMonth(nextDate.getMonth() + value);
        const nextTask: Task = {
          ...task,
          id: crypto.randomUUID(),
          dueDate: nextDate.toISOString(),
          completed: false,
          completedAt: undefined,
          minutesSpent: undefined
        };
        updatedTasks = [...updatedTasks, nextTask];
      }

      const totalNewParkXP = prev.parkXP + addedParkXP;
      const newParkLvl = getParkLevelFromXP(totalNewParkXP);
      const newTotalMinutes = prev.totalMinutesSpent + minutes;

      // Weekly challenge progress
      let weeklyChallenge = boosters.weeklyChallenge;
      let weeklyBonusGems = 0;
      if (weeklyChallenge) {
        if (weeklyChallenge.type === 'tasks') {
          weeklyChallenge = { ...weeklyChallenge, progress: weeklyChallenge.progress + 1 };
        } else if (weeklyChallenge.type === 'minutes') {
          weeklyChallenge = { ...weeklyChallenge, progress: weeklyChallenge.progress + minutes };
        } else if (weeklyChallenge.type === 'skills' && !weeklyChallenge.skillsUsed.includes(task.skillId)) {
          const skillsUsed = [...weeklyChallenge.skillsUsed, task.skillId];
          weeklyChallenge = { ...weeklyChallenge, skillsUsed, progress: skillsUsed.length };
        }
        if (weeklyChallenge.progress >= weeklyChallenge.target) {
          weeklyBonusGems = weeklyChallenge.gemReward;
          weeklyChallenge = null;
        }
        boosters = { ...boosters, weeklyChallenge };
      }

      const intermediateState: AppState = {
        ...prev,
        skills: updatedSkills,
        tasks: updatedTasks,
        parkXP: totalNewParkXP,
        parkLevel: newParkLvl,
        totalMinutesSpent: newTotalMinutes,
        activeBoosters: boosters,
        lifetimeGems: prev.lifetimeGems + gemsEarned + weeklyBonusGems,
        totalGemsSpent: prev.totalGemsSpent
      };

      const achResult = checkAchievements(intermediateState);
      if (achResult.hasUpdates && achResult.newlyUnlocked.length > 0) {
        setNewlyUnlockedAchievement(achResult.newlyUnlocked[0]);
      }

      const totalGemsEarned = gemsEarned + weeklyBonusGems + achResult.bonusGems;
      pendingRewardRef.current = { xp: xpEarned, gems: totalGemsEarned };
      return {
        ...intermediateState,
        totalGems: prev.totalGems + totalGemsEarned,
        lifetimeGems: prev.lifetimeGems + totalGemsEarned,
        unlockedAchievements: achResult.unlockedIds,
        unlockedTitles: achResult.unlockedTitles
      };
    });
    requestAnimationFrame(() => {
      if (pendingRewardRef.current) {
        setRewardToast(pendingRewardRef.current);
        pendingRewardRef.current = null;
        notificationSuccess();
      }
    });
  };

  const handleUpdateSkill = (id: string, updates: Partial<Skill>) => {
    setAppState(prev => ({
      ...prev,
      skills: prev.skills.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const handleUpdateTheme = (themeId: string) => {
    setAppState(prev => ({ ...prev, themeId }));
  };

  const handlePurchase = (item: ShopItem) => {
    setAppState(prev => {
      if (prev.totalGems < item.cost) return prev;
      if (prev.unlockedParkItems.includes(item.id)) return prev;
      
      const newSelected = [...prev.selectedParkItems];
      if (!newSelected.includes(item.id)) {
        if (item.type === 'tree') {
            const currentTrees = prev.selectedParkItems.filter(id => {
                const i = SHOP_ITEMS.find(si => si.id === id);
                return i?.type === 'tree';
            });
            if (currentTrees.length < 2) {
                newSelected.push(item.id);
            }
        } else {
            newSelected.push(item.id);
        }
      }

      const unlockedItems = [...prev.unlockedParkItems, item.id];
      const newGemsSpent = prev.totalGemsSpent + item.cost;

      const intermediateState: AppState = {
          ...prev,
          unlockedParkItems: unlockedItems,
          totalGemsSpent: newGemsSpent,
      };

      const achResult = checkAchievements(intermediateState);

      if (achResult.hasUpdates && achResult.newlyUnlocked.length > 0) {
        setNewlyUnlockedAchievement(achResult.newlyUnlocked[0]);
      }
      
      return {
        ...intermediateState,
        totalGems: prev.totalGems - item.cost + achResult.bonusGems,
        lifetimeGems: prev.lifetimeGems + achResult.bonusGems,
        selectedParkItems: newSelected,
        unlockedAchievements: achResult.unlockedIds,
        unlockedTitles: achResult.unlockedTitles
      };
    });
  };

  const handleToggleItem = (item: ShopItem) => {
      setAppState(prev => {
          const isSelected = prev.selectedParkItems.includes(item.id);
          let newSelected = [...prev.selectedParkItems];

          if (isSelected) {
              // Unequip
              newSelected = newSelected.filter(id => id !== item.id);
          } else {
              // Equip Logic
              if (item.type === 'tree') {
                  const currentTrees = prev.selectedParkItems.filter(id => {
                      const i = SHOP_ITEMS.find(si => si.id === id);
                      return i?.type === 'tree';
                  });
                  // Max 2 trees
                  if (currentTrees.length >= 2) {
                      const treeToRemove = currentTrees[0];
                      newSelected = newSelected.filter(id => id !== treeToRemove);
                  }
                  newSelected.push(item.id);
              } else {
                  newSelected.push(item.id);
              }
          }
          return {
              ...prev,
              selectedParkItems: newSelected
          };
      });
  };

  const handleUpdateProfile = (updates: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...updates }));
  };

  const handleResetSkill = (skillId: string) => {
    setAppState(prev => ({
      ...prev,
      skills: prev.skills.map(s =>
        s.id === skillId
          ? {
              ...s,
              totalMinutes: 0,
              totalPoints: 0,
              streak: 0,
              lastSkillCompletedAt: undefined
            }
          : s
      )
    }));
  };

  const handlePurchaseBooster = (item: BoosterShopItem, options?: { skillId?: string }) => {
    setAppState(prev => {
      if (prev.totalGems < item.cost) return prev;

      const b = prev.activeBoosters;
      const now = new Date();
      const xpActive = b.xpMultiplier && new Date(b.xpMultiplier.expiresAt) > now;
      const skillFocusActive = b.skillFocus && new Date(b.skillFocus.expiresAt) > now;
      const weeklyActive = b.weeklyChallenge && new Date(b.weeklyChallenge.expiresAt) > now;

      const alreadyActive =
        (['double_gems_1x', 'gem_doubler_3x'].includes(item.id) && b.gemDoublerRemaining > 0) ||
        (['focus_burst', 'xp_boost_1h', 'power_hour', 'xp_boost_24h'].includes(item.id) && xpActive) ||
        (item.id === 'deep_work' && b.deepWorkUsesRemaining > 0) ||
        (item.id === 'first_win' && b.firstWinOwned) ||
        (item.id === 'weekly_challenge' && weeklyActive) ||
        (item.id === 'momentum' && b.momentumOwned) ||
        (item.id === 'skill_focus_7d' && skillFocusActive) ||
        (item.id === 'gem_rush' && b.gemRushRemaining > 0) ||
        (item.id === 'second_chance' && b.secondChanceAvailable);

      if (alreadyActive) return prev;

      const boosters = { ...prev.activeBoosters };

      switch (item.id) {
        case 'double_gems_1x':
          boosters.gemDoublerRemaining = 1;
          break;
        case 'focus_burst':
          const focusExp = new Date(now.getTime() + 60 * 60 * 1000);
          boosters.xpMultiplier = { multiplier: 1.5, expiresAt: focusExp.toISOString() };
          break;
        case 'deep_work':
          boosters.deepWorkUsesRemaining = 1;
          break;
        case 'xp_boost_1h':
          const exp1h = new Date(now.getTime() + 60 * 60 * 1000);
          boosters.xpMultiplier = { multiplier: 1.5, expiresAt: exp1h.toISOString() };
          break;
        case 'first_win':
          boosters.firstWinOwned = true;
          break;
        case 'gem_doubler_3x':
          boosters.gemDoublerRemaining = 3;
          break;
        case 'power_hour':
          const powerExp = new Date(now.getTime() + 60 * 60 * 1000);
          boosters.xpMultiplier = { multiplier: 1.25, expiresAt: powerExp.toISOString() };
          break;
        case 'weekly_challenge': {
          const goal = WEEKLY_GOALS[Math.floor(Math.random() * WEEKLY_GOALS.length)];
          const startAt = now.toISOString();
          const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
          boosters.weeklyChallenge = {
            goalId: goal.id,
            description: goal.description,
            type: goal.type,
            target: goal.target,
            progress: 0,
            skillsUsed: [],
            startAt,
            expiresAt,
            gemReward: goal.gemReward
          };
          break;
        }
        case 'momentum':
          boosters.momentumOwned = true;
          break;
        case 'xp_boost_24h':
          const exp24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          boosters.xpMultiplier = { multiplier: 1.5, expiresAt: exp24h.toISOString() };
          break;
        case 'skill_focus_7d':
          if (!options?.skillId) return prev;
          const exp7d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          boosters.skillFocus = { skillId: options.skillId, expiresAt: exp7d.toISOString() };
          break;
        case 'gem_rush':
          boosters.gemRushRemaining = 5;
          break;
        case 'second_chance':
          boosters.secondChanceAvailable = true;
          break;
        default:
          return prev;
      }

      boosterPurchasedRef.current = true;
      return {
        ...prev,
        totalGems: prev.totalGems - item.cost,
        totalGemsSpent: prev.totalGemsSpent + item.cost,
        activeBoosters: boosters
      };
    });
    requestAnimationFrame(() => {
      if (boosterPurchasedRef.current) {
        boosterPurchasedRef.current = false;
        impactMedium();
      }
    });
  };

  if (!isLoaded) return null;
  if (!isAuthenticated) return <AuthScreen />;
  
  // Show onboarding if not completed
  if (!appState.onboardingCompleted) {
    return (
      <div className="max-w-md mx-auto h-screen bg-background shadow-2xl overflow-hidden relative">
        <OnboardingScreen userName={appState.userName} onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <ErrorBoundary>
            <HomeScreen
              state={appState}
              onNavigate={changeView}
              onDeleteTask={handleDeleteTask}
              onCompleteTask={handleCompleteTask}
              onEditTask={(task) => {
                setEditingTask(task);
                setCurrentView('addTask');
              }}
            />
          </ErrorBoundary>
        );
      case 'addTask':
        return (
          <ErrorBoundary>
            <AddTaskScreen
              skills={appState.skills}
              initialTask={editingTask}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onCancel={() => {
                setEditingTask(null);
                setCurrentView('home');
              }}
            />
          </ErrorBoundary>
        );
      case 'profile':
        return (
          <ErrorBoundary>
            <ProfileScreen state={appState} onUpdateProfile={handleUpdateProfile} />
          </ErrorBoundary>
        );
      case 'settings':
        return (
          <ErrorBoundary>
            <SettingsScreen state={appState} onUpdateSkill={handleUpdateSkill} onUpdateProfile={handleUpdateProfile} onNavigate={setCurrentView} onLogout={handleLogout} currentUserEmail={currentUserEmail} />
          </ErrorBoundary>
        );
      case 'themeSelection':
        return (
          <ErrorBoundary>
            <ThemeSelectionScreen currentThemeId={appState.themeId} onSelectTheme={handleUpdateTheme} onBack={() => setCurrentView('settings')} />
          </ErrorBoundary>
        );
      case 'editProfile':
        return (
          <ErrorBoundary>
            <EditProfileScreen state={appState} onUpdateSkill={handleUpdateSkill} onResetSkill={handleResetSkill} onBack={() => setCurrentView('settings')} />
          </ErrorBoundary>
        );
      case 'contact':
        return (
          <ErrorBoundary>
            <ContactScreen onBack={() => setCurrentView('settings')} />
          </ErrorBoundary>
        );
      case 'shop':
        return (
          <ErrorBoundary>
            <ShopScreen state={appState} onPurchaseBooster={handlePurchaseBooster} />
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary>
            <HomeScreen
              state={appState}
              onNavigate={changeView}
              onDeleteTask={handleDeleteTask}
              onCompleteTask={handleCompleteTask}
              onEditTask={(task) => { setEditingTask(task); setCurrentView('addTask'); }}
            />
          </ErrorBoundary>
        );
    }
  };

  const isModalView = MODAL_VIEWS.includes(currentView);
  const viewTransitionClass = isModalView ? 'animate-view-slide' : 'animate-view-fade';

  return (
    <div className="max-w-md mx-auto h-screen bg-background relative shadow-2xl overflow-hidden flex flex-col transition-colors duration-300">
      <div ref={mainScrollRef} className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
        <div key={currentView} className={viewTransitionClass}>
          {renderContent()}
        </div>
      </div>
      {currentView !== 'addTask' && currentView !== 'themeSelection' && currentView !== 'editProfile' && currentView !== 'contact' && (
        <div className="absolute bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <BottomNav currentView={currentView} onChangeView={changeView} />
        </div>
      )}

      {rewardToast && (
        <RewardToast
          xp={rewardToast.xp}
          gems={rewardToast.gems}
          onDone={() => setRewardToast(null)}
        />
      )}
      {undoDeleteTask && (
        <UndoToast
          message="Task deleted"
          onUndo={handleUndoDelete}
          onDismiss={() => setUndoDeleteTask(null)}
        />
      )}
      <MilestoneCelebration
        achievement={newlyUnlockedAchievement}
        onClose={() => setNewlyUnlockedAchievement(null)}
      />
    </div>
  );
};

export default App;
