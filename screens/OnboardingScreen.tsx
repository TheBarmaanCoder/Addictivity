import React, { useState } from 'react';
import { Skill } from '../types';
import { AVAILABLE_ICONS } from '../constants';
import { impactLight, impactMedium, selectionChanged } from '../lib/haptics';
import Logo from '../components/Logo';

interface OnboardingScreenProps {
  userName: string;
  onComplete: (updatedSkills: Skill[]) => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ userName, onComplete }) => {
  const [step, setStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Icon Picker State
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [editingSkillIndex, setEditingSkillIndex] = useState<number | null>(null);

  // State for step 4
  const [customSkills, setCustomSkills] = useState<{name: string, icon: string}[]>([
    { name: '', icon: 'palette' },
    { name: '', icon: 'book' },
    { name: '', icon: 'terminal' },
  ]);

  const nextStep = () => {
    impactLight();
    setStep(prev => prev + 1);
  };
  const prevStep = () => { selectionChanged(); setStep(prev => Math.max(1, prev - 1)); };
  const showBackButton = step >= 2 && step <= 5;

  const handleFinish = () => {
    impactMedium();
    setIsTransitioning(true);
    
    // Construct final skill array
    const fixed: Skill[] = [
      { id: 's1', name: 'Wisdom', totalMinutes: 0, totalPoints: 0, pointsPerMinute: 10, isCustom: false, color: '#3a6b46', icon: 'school', streak: 0 },
      { id: 's2', name: 'Discipline', totalMinutes: 0, totalPoints: 0, pointsPerMinute: 10, isCustom: false, color: '#e89635', icon: 'self_improvement', streak: 0 },
      { id: 's3', name: 'Body', totalMinutes: 0, totalPoints: 0, pointsPerMinute: 10, isCustom: false, color: '#f58c63', icon: 'fitness_center', streak: 0 },
    ];

    const custom: Skill[] = customSkills.map((cs, idx) => ({
      id: `custom-${idx}`,
      name: cs.name || `Skill ${idx + 1}`,
      totalMinutes: 0,
      totalPoints: 0,
      pointsPerMinute: 10,
      isCustom: true,
      color: idx === 0 ? '#f4a261' : idx === 1 ? '#365c48' : '#1a3b2b',
      icon: cs.icon,
      streak: 0
    }));

    setTimeout(() => {
      onComplete([...fixed, ...custom]);
    }, 2000);
  };

  const handleIconSelect = (icon: string) => {
    if (editingSkillIndex !== null) {
      selectionChanged();
      const newSkills = [...customSkills];
      newSkills[editingSkillIndex].icon = icon;
      setCustomSkills(newSkills);
      setIsIconPickerOpen(false);
      setEditingSkillIndex(null);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="flex flex-col items-center justify-center flex-1 text-center px-8 animate-in fade-in duration-1000">
            <h1 className="text-4xl font-black text-forest-green mb-6 leading-tight">Your time is<br/>shaping you</h1>
            <p className="text-txt-secondary font-medium mb-12 leading-relaxed">
              Addictivity turns time into growth. Every minute spent on meaningful effort counts toward the person you are becoming.
            </p>
            <button 
              onClick={nextStep}
              className="w-full py-4 bg-forest-green text-white font-semibold rounded-xl active:opacity-80 active:scale-[0.98] transition-all"
            >
              Start building
            </button>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col items-center justify-center flex-1 px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-2xl font-bold text-txt mb-8 text-center">
              If you were consistent for 30 minutes a day, what would you want to grow?
            </h2>
            <div className="flex flex-col gap-3 mb-12 w-full">
              {['Learning Japanese', 'Piano practice', 'Deep coding sessions', 'Reading philosophy'].map((example, i) => (
                <div key={i} className="bg-off-white border border-txt-secondary/20 p-4 rounded-xl text-txt-secondary font-medium italic text-sm">
                  “{example}”
                </div>
              ))}
            </div>
            <button 
              onClick={nextStep}
              className="w-full py-4 bg-forest-green text-white font-semibold rounded-xl active:opacity-80 active:scale-[0.98] transition-all"
            >
              Define my skills
            </button>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col items-center justify-center flex-1 px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-2xl font-bold text-txt mb-2 text-center">Core Foundations</h2>
            <p className="text-txt-secondary text-sm mb-8 text-center">These always exist and cannot be removed.</p>
            
            <div className="flex flex-col gap-4 w-full mb-12">
              {[
                { name: 'Wisdom', icon: 'school', desc: 'Intellectual growth & learning' },
                { name: 'Discipline', icon: 'self_improvement', desc: 'Mental strength & habits' },
                { name: 'Body', icon: 'fitness_center', desc: 'Physical health & vitality' }
              ].map(skill => (
                <div key={skill.name} className="flex items-center gap-4 bg-surface p-5 rounded-xl border border-txt-secondary/20 shadow-card">
                  <div className="size-12 rounded-xl bg-forest-green/10 flex items-center justify-center text-forest-green">
                    <span className="material-symbols-outlined text-3xl">{skill.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-txt">{skill.name}</h3>
                    <p className="text-xs text-txt-secondary font-medium">{skill.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={nextStep}
              className="w-full py-4 bg-forest-green text-white font-semibold rounded-xl active:opacity-80 active:scale-[0.98] transition-all"
            >
              Add my personal skills
            </button>
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col flex-1 px-6 pt-4 animate-in fade-in slide-in-from-right-4 duration-500 overflow-y-auto no-scrollbar pb-10">
            <h2 className="text-2xl font-bold text-txt mb-2">Personal Pursuits</h2>
            <p className="text-txt-secondary text-sm mb-8">What else defines your journey? Choose 3 unique paths.</p>
            
            <div className="space-y-8 mb-12">
              {customSkills.map((cs, idx) => (
                <div key={idx} className="space-y-3">
                  <label className="text-[10px] font-black text-forest-green uppercase tracking-widest ml-1">Skill #{idx + 1}</label>
                  <div className="flex gap-3">
                    <div className="flex-1 h-14 relative bg-surface border border-txt-secondary/20 rounded-xl px-4 flex items-center shadow-card focus-within:border-forest-green focus-within:ring-2 focus-within:ring-forest-green/10 transition-all">
                      <input 
                        value={cs.name}
                        onChange={(e) => {
                          const newSkills = [...customSkills];
                          newSkills[idx].name = e.target.value;
                          setCustomSkills(newSkills);
                        }}
                        className="w-full bg-transparent border-none focus:ring-0 text-txt font-bold outline-none placeholder:font-normal"
                        placeholder="e.g. Piano, Coding, Japanese..."
                      />
                    </div>
                    <button 
                       onClick={() => {
                         setEditingSkillIndex(idx);
                         setIsIconPickerOpen(true);
                       }}
                       className="size-14 bg-surface border border-txt-secondary/20 rounded-xl flex items-center justify-center text-forest-green active:bg-slate-50 transition-all shadow-card active:scale-[0.97]"
                    >
                       <span className="material-symbols-outlined text-2xl">{cs.icon}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {customSkills.some(s => !s.name.trim()) && (
              <p className="text-txt-secondary text-sm mb-3 text-center">Give each pursuit a name to continue.</p>
            )}
            <button 
              disabled={customSkills.some(s => !s.name.trim())}
              onClick={nextStep}
              className={`w-full py-4 font-semibold rounded-xl transition-all ${
                customSkills.some(s => !s.name.trim()) 
                ? 'bg-off-white text-txt-secondary' 
                : 'bg-forest-green text-white active:opacity-80 active:scale-[0.98]'
              }`}
            >
              Continue
            </button>
          </div>
        );
      case 5:
        return (
          <div className="flex flex-col items-center justify-center flex-1 px-8 animate-in zoom-in duration-500">
            <h2 className="text-3xl font-black text-txt mb-4 text-center">The Commitment</h2>
            <p className="text-txt-secondary text-center font-medium mb-10">
              You’re not setting goals. You’re choosing what to grow.
            </p>
            
            <div className="w-full bg-off-white rounded-xl p-6 border border-txt-secondary/20 grid grid-cols-2 gap-3 mb-12">
               {['Wisdom', 'Body', 'Discipline', ...customSkills.map(s => s.name)].map((name, i) => (
                 <div key={i} className="flex items-center gap-2">
                   <div className="size-2 bg-forest-green rounded-full"></div>
                   <span className="text-sm font-bold text-txt truncate">{name}</span>
                 </div>
               ))}
            </div>

            <button 
              onClick={handleFinish}
              className="w-full py-5 bg-forest-green text-white text-lg font-semibold rounded-xl active:opacity-80 active:scale-[0.98] transition-all"
            >
              Begin
            </button>
          </div>
        );
    }
  };

  if (isTransitioning) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-emerald-950 text-white p-12 animate-in fade-in duration-1000">
         <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-8"></div>
         <h2 className="text-2xl font-bold text-center animate-pulse">Setting up your journey...</h2>
         <p className="mt-4 text-white/50 text-sm text-center">Preparing your focus space</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-off-white overflow-hidden flex flex-col">
      {showBackButton && (
        <button
          onClick={prevStep}
          className="absolute top-[max(0.75rem,env(safe-area-inset-top))] left-4 z-10 size-11 rounded-full bg-white/80 border border-txt-secondary/20 shadow-card flex items-center justify-center text-forest-green active:bg-slate-100 transition-colors"
          aria-label="Go back"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
      )}
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
        <div className="h-full bg-forest-green transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }}></div>
      </div>

      {/* Brand logo */}
      <div className="pt-[max(0.75rem,env(safe-area-inset-top))] flex justify-center w-full">
        <Logo className="w-10 h-10 text-forest-green" />
      </div>

      {renderStep()}

      {/* Icon Picker Modal */}
      {isIconPickerOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsIconPickerOpen(false)}></div>
          <div className="relative bg-surface w-full max-w-sm h-[70vh] sm:h-auto sm:max-h-[80vh] rounded-t-3xl sm:rounded-3xl shadow-soft flex flex-col animate-in slide-in-from-bottom-10 duration-300">
             <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-1" />
             <div className="px-6 py-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-forest-green">Select Icon</h3>
                <button onClick={() => setIsIconPickerOpen(false)} className="size-9 rounded-full flex items-center justify-center text-txt-secondary active:bg-slate-100 transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
             </div>
             <div className="flex-1 overflow-y-auto p-4 grid grid-cols-5 gap-3">
               {AVAILABLE_ICONS.map(icon => (
                 <button
                   key={icon}
                   onClick={() => handleIconSelect(icon)}
                   className="aspect-square min-w-[44px] min-h-[44px] rounded-xl bg-off-white flex items-center justify-center text-txt-secondary active:bg-forest-green active:text-white transition-all"
                 >
                   <span className="material-symbols-outlined text-2xl">{icon}</span>
                 </button>
               ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingScreen;