import React, { useMemo, useState } from 'react';
import { AppState, Skill, Task, Achievement } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import { ACHIEVEMENTS } from '../constants';
import HistoryModal from '../components/HistoryModal';
import Logo from '../components/Logo';

interface ProfileScreenProps {
  state: AppState;
  onUpdateProfile?: (updates: Partial<AppState>) => void;
}

const AchievementCard: React.FC<{ achievement: Achievement; isUnlocked: boolean }> = ({ achievement, isUnlocked }) => (
  <div className={`flex items-center gap-4 p-4 rounded-xl transition-all border-2 ${isUnlocked ? 'bg-surface border-border shadow-card' : 'bg-surface opacity-60 border-transparent'}`}>
    <div className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${isUnlocked ? 'bg-main/10 text-main' : 'bg-border text-subtitle'}`}>
      <span className="material-symbols-outlined text-2xl">{achievement.icon}</span>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <h4 className="text-subhead font-semibold text-textPrimary truncate pr-2">{achievement.title}</h4>
        {isUnlocked && <span className="material-symbols-outlined text-interactive text-sm shrink-0">verified</span>}
      </div>
      <p className="text-overline text-subtitle font-medium line-clamp-2">{achievement.description}</p>
    </div>
    <div className={`flex flex-col items-end shrink-0 ${!isUnlocked ? 'opacity-50' : ''}`}>
        <div className={`flex items-center gap-1 text-xs font-bold ${isUnlocked ? 'text-interactive' : 'text-subtitle'}`}>
            <span className="material-symbols-outlined text-[12px]">diamond</span>
            {achievement.gemReward}
        </div>
    </div>
  </div>
);

const ProfileScreen: React.FC<ProfileScreenProps> = ({ state }) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showLocked, setShowLocked] = useState(false);

  // --- XP & LEVEL LOGIC ---
  const totalGlobalXP = state.skills.reduce((acc, s) => acc + s.totalPoints, 0);
  const globalLevel = Math.floor(Math.sqrt(totalGlobalXP / 40)) + 1;
  
  const xpStartOfLevel = 40 * Math.pow(globalLevel - 1, 2);
  const xpForNextGlobalLevel = 40 * Math.pow(globalLevel, 2);
  const xpRequiredForCurrentLevel = xpForNextGlobalLevel - xpStartOfLevel;
  const xpProgressInLevel = totalGlobalXP - xpStartOfLevel;
  const levelProgressPercent = Math.min(100, Math.max(0, (xpProgressInLevel / xpRequiredForCurrentLevel) * 100));

  const getSkillLevel = (xp: number) => Math.floor(Math.sqrt(xp / 120)) + 1;
  const getSkillNextLevelXP = (level: number) => 120 * Math.pow(level, 2);

  const getRankName = (level: number) => {
    if (level <= 5) return 'Beginner';
    if (level <= 10) return 'Apprentice';
    if (level <= 15) return 'Initiate';
    if (level <= 20) return 'Adept';
    if (level <= 25) return 'Practitioner';
    if (level <= 30) return 'Skilled';
    if (level <= 35) return 'Expert';
    if (level <= 40) return 'Specialist';
    if (level <= 45) return 'Veteran';
    if (level <= 48) return 'Elite';
    if (level <= 50) return 'Master';
    return 'Grandmaster';
  };

  const rankName = getRankName(globalLevel);

  const getStreakMultiplierText = (streak: number) => {
    if (streak >= 15) return '+15%';
    if (streak >= 8) return '+10%';
    if (streak >= 4) return '+5%';
    return null;
  };

  // --- TIME TRACKING ANALYTICS ---
  const timeStats = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const lifetimeMinutes = state.skills.reduce((acc, s) => acc + (s.totalMinutes || 0), 0);
    
    const currentWeekMinutes = state.tasks
      .filter(t => t.completed && t.completedAt && new Date(t.completedAt) > oneWeekAgo)
      .reduce((acc, t) => acc + (t.minutesSpent || 0), 0);

    const prevWeekMinutes = state.tasks
      .filter(t => t.completed && t.completedAt && new Date(t.completedAt) > twoWeeksAgo && new Date(t.completedAt) <= oneWeekAgo)
      .reduce((acc, t) => acc + (t.minutesSpent || 0), 0);

    const weeklyDiff = currentWeekMinutes - prevWeekMinutes;
    const hasPrevData = prevWeekMinutes > 0;
    const weeklyTrend = hasPrevData ? Math.round((weeklyDiff / prevWeekMinutes) * 100) : null;

    return {
      lifetimeHours: (lifetimeMinutes / 60).toFixed(1),
      currentWeekHours: (currentWeekMinutes / 60).toFixed(1),
      prevWeekHours: (prevWeekMinutes / 60).toFixed(1),
      weeklyDiffHours: (Math.abs(weeklyDiff) / 60).toFixed(1),
      weeklyTrend,
      hasPrevData,
      isPositiveTrend: weeklyDiff >= 0
    };
  }, [state.tasks, state.skills]);

  // --- RADAR DATA ---
  const maxSkillXP = state.skills.length ? Math.max(...state.skills.map(s => s.totalPoints), 1) : 1;
  const maxSkillLevel = getSkillLevel(maxSkillXP);
  const chartMax = 120 * Math.pow(maxSkillLevel + 1, 2);
  const allSkillsZero = state.skills.every(s => (s.totalPoints ?? 0) === 0);

  const radarData = state.skills.map(skill => ({
    subject: skill.name,
    A: skill.totalPoints,
    fullMark: chartMax, 
  }));

  const unlockedList = ACHIEVEMENTS.filter(ach => state.unlockedAchievements.includes(ach.id));
  const lockedList = ACHIEVEMENTS.filter(ach => !state.unlockedAchievements.includes(ach.id));

  return (
    <div className="flex flex-col w-full pb-24">
      <header className="relative w-full max-w-4xl mx-auto px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-2 pr-14">
        <h1 className="text-3xl font-bold text-title">Stats</h1>
        <div className="absolute top-[max(1rem,env(safe-area-inset-top))] right-6 w-10 h-10 flex items-center justify-center">
          <Logo className="w-10 h-10 opacity-80" />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center w-full px-6 max-w-4xl mx-auto gap-6 mt-4">
        
        {/* Time Insights Section */}
        <div className="w-full grid grid-cols-2 gap-3">
          <div className="bg-main rounded-xl p-4 text-background shadow-soft border-2 border-main">
            <span className="text-[10px] font-semibold uppercase tracking-widest opacity-90">Total Invested</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold">{timeStats.lifetimeHours}</span>
              <span className="text-sm font-medium opacity-80">hrs</span>
            </div>
          </div>
          <div className="bg-main border-2 border-main rounded-xl p-4 shadow-card">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-background">Weekly Momentum</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-background">{timeStats.currentWeekHours}h</span>
              {timeStats.hasPrevData ? (
                <div className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full ${timeStats.isPositiveTrend ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  <span className="material-symbols-outlined text-xs">{timeStats.isPositiveTrend ? 'trending_up' : 'trending_down'}</span>
                  {Math.abs(timeStats.weeklyTrend ?? 0)}%
                </div>
              ) : (
                <span className="text-[10px] font-bold text-background/90 px-1.5 py-0.5">No data</span>
              )}
            </div>
            <p className="text-[9px] text-background/90 mt-1 font-medium">Vs. {timeStats.prevWeekHours}h last week</p>
          </div>
        </div>

        {/* Radar Chart Card */}
        <div className="w-full bg-surface rounded-xl shadow-card p-4 flex flex-col items-center relative border-2 border-border h-[360px]">
          <div className="absolute top-4 left-6 flex flex-col z-10">
            <span className="text-xs font-semibold text-subtitle uppercase tracking-wider">Global Level</span>
            <div className="flex items-end gap-2 mt-0.5">
                <span className="text-4xl font-bold text-subtitle leading-none">{globalLevel}</span>
                <div 
                    className="relative w-3 h-8 bg-border rounded-full overflow-hidden mb-0.5" 
                    title={`${xpProgressInLevel} / ${xpRequiredForCurrentLevel} XP to next level`}
                >
                    <div 
                        className="absolute bottom-0 left-0 right-0 bg-interactive transition-all duration-500 rounded-full"
                        style={{ height: `${levelProgressPercent}%` }}
                    ></div>
                </div>
            </div>
          </div>
          <div className="absolute top-4 right-6 flex flex-col items-end text-right z-10">
            <span className="text-xs font-semibold text-textPrimary uppercase tracking-wider">Rank</span>
            <span className="text-sm font-bold text-subtitle">{rankName}</span>
          </div>
          
          <div className="w-full h-full mt-2">
            {allSkillsZero ? (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-sm text-subtitle font-medium text-center px-4">
                  Start tracking to see your skill radar
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--title)', fontSize: 10, fontWeight: 'bold' }} />
                  <PolarRadiusAxis angle={30} domain={[0, chartMax]} tick={false} axisLine={false} />
                  <Radar
                    name="Skills"
                    dataKey="A"
                    stroke="var(--interactive)"
                    strokeWidth={2}
                    fill="var(--interactive)"
                    fillOpacity={0.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Skill Breakdown */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-subtitle font-bold text-lg">Skill Breakdown</h3>
            <button 
              onClick={() => setIsHistoryOpen(true)}
              className="text-xs font-semibold text-interactive transition-colors"
            >
              View History
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {state.skills.map(skill => {
              const currentLvl = getSkillLevel(skill.totalPoints);
              const skillNextLvlXP = getSkillNextLevelXP(currentLvl);
              const skillStartLvlXP = getSkillNextLevelXP(currentLvl - 1);
              const skillLevelDuration = skillNextLvlXP - skillStartLvlXP;
              const skillProgress = skill.totalPoints - skillStartLvlXP;
              const skillPercent = Math.min(100, Math.max(0, (skillProgress / skillLevelDuration) * 100));
              const skillHours = (skill.totalMinutes / 60).toFixed(1);
              const bonusText = getStreakMultiplierText(skill.streak || 0);
              
              return (
                <div key={skill.id} className="bg-surface p-3 rounded-xl border-2 border-border shadow-card flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2">
                    <div className="size-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${skill.color}15`, color: skill.color }}>
                      <span className="material-symbols-outlined text-[18px]">{skill.icon}</span>
                    </div>
                    <div className="flex flex-col items-end">
                    <p className="text-[10px] font-black text-main uppercase">Lvl {currentLvl}</p>
                    <span className="text-[9px] font-bold text-subtitle">{skillHours}h</span>
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 mb-2">
                    <p className="text-[11px] font-bold text-subtitle uppercase truncate">{skill.name}</p>
                    <div className="flex gap-1">
                      {(skill.streak || 0) > 0 && (
                        <div className="flex items-center text-[9px] font-black text-orange-600 bg-orange-50 px-1 py-0.5 rounded-md leading-none">
                          <span className="material-symbols-outlined text-[10px]">local_fire_department</span>
                          {skill.streak}
                        </div>
                      )}
                      {bonusText && <span className="text-[9px] font-black text-green-600 bg-green-50 px-1 py-0.5 rounded-md leading-none">{bonusText}</span>}
                    </div>
                  </div>
                  <div className="mt-auto">
                    <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                       <div className="h-full rounded-full transition-all duration-700" style={{ width: `${skillPercent}%`, backgroundColor: skill.color }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestones & Achievements */}
        <div className="w-full">
          <h3 className="text-subtitle font-bold text-lg mb-4">Milestones</h3>
          <div className="grid grid-cols-1 gap-3">
             {/* Unlocked Section */}
             {unlockedList.length > 0 ? (
                unlockedList.map(ach => (
                    <AchievementCard key={ach.id} achievement={ach} isUnlocked={true} />
                ))
             ) : (
                <div className="p-6 rounded-xl bg-surface text-center flex flex-col items-center mb-2">
                    <span className="material-symbols-outlined text-subtitle text-3xl mb-2">emoji_events</span>
                    <p className="text-subtitle text-sm font-medium">No milestones unlocked yet.</p>
                </div>
             )}

             {/* Locked Section Toggle */}
             {lockedList.length > 0 && (
                <div className="w-full mt-2">
                    <button 
                        onClick={() => setShowLocked(!showLocked)}
                        className="w-full py-3 min-h-[44px] flex items-center justify-center gap-2 text-xs font-semibold text-subtitle bg-surface rounded-xl active:bg-border transition-colors"
                    >
                        <span>{showLocked ? 'Hide Locked Milestones' : `Show Locked Milestones (${lockedList.length})`}</span>
                        <span className={`material-symbols-outlined text-base transition-transform duration-200 ${showLocked ? 'rotate-180' : ''}`}>expand_more</span>
                    </button>

                    {showLocked && (
                        <div className="grid grid-cols-1 gap-3 mt-3 animate-in fade-in slide-in-from-top-2">
                            {lockedList.map(ach => (
                                <AchievementCard key={ach.id} achievement={ach} isUnlocked={false} />
                            ))}
                        </div>
                    )}
                </div>
             )}
          </div>
        </div>
      </main>

      <HistoryModal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        state={state} 
      />
    </div>
  );
};

export default ProfileScreen;