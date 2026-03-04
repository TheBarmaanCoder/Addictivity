import React, { useState } from 'react';
import { AppState, Skill } from '../types';
import { AVAILABLE_ICONS } from '../constants';
import Logo from '../components/Logo';
import { impactLight, selectionChanged } from '../lib/haptics';

interface EditProfileScreenProps {
  state: AppState;
  onUpdateSkill: (id: string, updates: Partial<Skill>) => void;
  onResetSkill: (id: string) => void;
  onBack: () => void;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ state, onUpdateSkill, onResetSkill, onBack }) => {
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');
  const [iconPickerForId, setIconPickerForId] = useState<string | null>(null);
  const [resetConfirmForId, setResetConfirmForId] = useState<string | null>(null);

  const skills = state.skills;

  const handleStartEditName = (skill: Skill) => {
    setEditingNameId(skill.id);
    setEditNameValue(skill.name);
  };

  const handleSaveName = () => {
    if (editingNameId && editNameValue.trim()) {
      onUpdateSkill(editingNameId, { name: editNameValue.trim() });
      selectionChanged();
    }
    setEditingNameId(null);
  };

  const handleIconSelect = (skillId: string, icon: string) => {
    onUpdateSkill(skillId, { icon });
    selectionChanged();
    setIconPickerForId(null);
  };

  const handleResetClick = (skill: Skill) => {
    impactLight();
    setResetConfirmForId(skill.id);
  };

  const handleResetConfirm = () => {
    if (resetConfirmForId) {
      onResetSkill(resetConfirmForId);
      setResetConfirmForId(null);
    }
  };

  const getSkillLevel = (xp: number) => Math.floor(Math.sqrt(xp / 120)) + 1;

  return (
    <div className="flex flex-col w-full h-full bg-background pb-24">
      <header className="relative w-full px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-4 pr-14 flex items-center gap-3">
        <button onClick={onBack} className="size-11 flex items-center justify-center text-main rounded-full active:bg-border transition-colors shrink-0" aria-label="Back">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h1 className="text-2xl font-bold text-title flex-1 min-w-0 text-center">Edit profile</h1>
        <div className="absolute top-[max(1rem,env(safe-area-inset-top))] right-6 w-10 h-10 flex items-center justify-center">
          <Logo className="w-10 h-10 opacity-80" />
        </div>
      </header>

      <main className="flex-1 px-6 overflow-y-auto">
        <p className="text-sm text-subtitle mb-6">Edit names and icons for your 6 skills. You can reset a skill to zero (all progress for that skill will be lost).</p>
        <div className="space-y-4">
          {skills.map(skill => {
            const level = getSkillLevel(skill.totalPoints);
            const isEditingName = editingNameId === skill.id;
            return (
              <div key={skill.id} className="bg-surface border-2 border-border rounded-xl p-4 shadow-card">
                <div className="flex items-center gap-4 mb-3">
                  <button
                    onClick={() => setIconPickerForId(skill.id)}
                    className="size-14 rounded-xl flex items-center justify-center shrink-0 active:scale-95 transition-transform"
                    style={{ backgroundColor: `${skill.color}18`, color: skill.color }}
                    aria-label="Change icon"
                  >
                    <span className="material-symbols-outlined text-3xl">{skill.icon}</span>
                  </button>
                  <div className="flex-1 min-w-0">
                    {isEditingName ? (
                      <div className="flex gap-2 items-center flex-wrap">
                        <input
                          value={editNameValue}
                          onChange={(e) => setEditNameValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                          className="flex-1 min-w-0 px-3 py-2 min-h-[44px] border-2 border-border rounded-xl text-textPrimary font-semibold focus:outline-none focus:border-main focus:ring-2 focus:ring-main/10"
                          autoFocus
                        />
                        <button onClick={handleSaveName} className="px-4 py-2 min-h-[44px] bg-main text-textOnMain font-semibold rounded-xl active:opacity-80">Save</button>
                        <button onClick={() => { setEditingNameId(null); }} className="px-4 py-2 min-h-[44px] bg-background text-subtitle font-semibold rounded-xl">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-[17px] font-bold text-textPrimary truncate">{skill.name}</h3>
                        <button onClick={() => handleStartEditName(skill)} className="text-sm font-semibold text-main shrink-0 active:opacity-70">Edit name</button>
                      </div>
                    )}
                    <p className="text-xs text-subtitle mt-0.5">Level {level} · {(skill.totalMinutes / 60).toFixed(1)}h · {skill.streak || 0} day streak</p>
                  </div>
                </div>
                <button
                  onClick={() => handleResetClick(skill)}
                  className="w-full mt-2 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold active:bg-red-50 transition-colors"
                >
                  Reset skill to 0
                </button>
              </div>
            );
          })}
        </div>
      </main>

      {/* Icon picker modal */}
      {iconPickerForId && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIconPickerForId(null)} />
          <div className="relative bg-surface w-full max-w-sm max-h-[80vh] rounded-t-3xl sm:rounded-3xl shadow-soft flex flex-col animate-in slide-in-from-bottom-10 duration-300">
            <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-2" />
            <h3 className="text-lg font-semibold text-main px-6 pb-4">Choose icon</h3>
            <div className="flex-1 overflow-y-auto px-6 pb-6 grid grid-cols-5 gap-3">
              {AVAILABLE_ICONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => handleIconSelect(iconPickerForId, icon)}
                  className="aspect-square min-w-[44px] min-h-[44px] rounded-xl bg-background flex items-center justify-center text-subtitle active:bg-main active:text-textOnMain transition-all"
                >
                  <span className="material-symbols-outlined text-2xl">{icon}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reset confirmation modal */}
      {resetConfirmForId && (() => {
        const skill = skills.find(s => s.id === resetConfirmForId);
        if (!skill) return null;
        return (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setResetConfirmForId(null)} />
            <div className="relative bg-surface w-full max-w-sm rounded-2xl shadow-soft p-6 animate-in zoom-in duration-200">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
                <span className="material-symbols-outlined text-3xl">warning</span>
              </div>
              <h3 className="text-xl font-bold text-textPrimary text-center mb-2">Reset &quot;{skill.name}&quot;?</h3>
              <p className="text-sm text-subtitle text-center mb-6">
                This will set this skill&apos;s level, minutes, XP, and streak to zero. <strong className="text-red-600">All progress for this skill will be permanently lost.</strong> This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setResetConfirmForId(null)}
                  className="flex-1 py-3 rounded-xl border-2 border-border text-textPrimary font-semibold active:bg-background"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetConfirm}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold active:opacity-80"
                >
                  Reset skill
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default EditProfileScreen;
