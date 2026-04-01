import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AppState, Skill } from '../types';
import { AVAILABLE_ICONS } from '../constants';
import Logo from '../components/Logo';
import { impactLight, impactMedium, selectionChanged } from '../lib/haptics';
import { getActiveSkills, MAX_TRACKED_SKILLS, MIN_TRACKED_SKILLS } from '../lib/skills';

interface EditProfileScreenProps {
  state: AppState;
  onUpdateSkill: (id: string, updates: Partial<Skill>) => void;
  onDeleteSkill: (id: string) => void;
  onAddSkill: () => void;
  onBack: () => void;
}

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ state, onUpdateSkill, onDeleteSkill, onAddSkill, onBack }) => {
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');
  const [iconPickerForId, setIconPickerForId] = useState<string | null>(null);
  const [deleteConfirmForId, setDeleteConfirmForId] = useState<string | null>(null);

  const activeSkills = useMemo(() => getActiveSkills(state.skills), [state.skills]);
  const archivedSkills = useMemo(
    () => state.skills.filter(s => s.tracking === 'archived'),
    [state.skills]
  );
  const canArchiveAny = activeSkills.length > MIN_TRACKED_SKILLS;
  const canRestoreAny = activeSkills.length < MAX_TRACKED_SKILLS;

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

  const handleDeleteClick = (skill: Skill) => {
    impactLight();
    setDeleteConfirmForId(skill.id);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmForId) {
      onDeleteSkill(deleteConfirmForId);
      setDeleteConfirmForId(null);
    }
  };

  const getSkillLevel = (xp: number) => Math.floor(Math.sqrt(xp / 120)) + 1;

  const renderSkillCard = (skill: Skill, variant: 'active' | 'archived') => {
    const level = getSkillLevel(skill.totalPoints);
    const isEditingName = editingNameId === skill.id;
    const isArchivedRow = variant === 'archived';

    return (
      <div
        key={skill.id}
        className={`bg-background border-2 border-title rounded-xl p-4 shadow-card ${isArchivedRow ? 'opacity-95' : ''}`}
      >
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={() => setIconPickerForId(skill.id)}
            className="size-14 rounded-xl flex items-center justify-center shrink-0 active:scale-95 transition-transform"
            style={{ backgroundColor: `${skill.color}18`, color: skill.color }}
            aria-label="Change icon"
          >
            <span className={`material-symbols-outlined text-3xl ${isArchivedRow ? 'grayscale' : ''}`}>{skill.icon}</span>
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
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="text-[17px] font-bold text-title truncate">{skill.name}</h3>
                  {variant === 'active' && (
                    <span className="text-[9px] font-bold uppercase tracking-wide text-main shrink-0 px-1.5 py-0.5 rounded-md bg-main/10">Tracked</span>
                  )}
                  {variant === 'archived' && (
                    <span className="text-[9px] font-bold uppercase tracking-wide text-subtitle shrink-0 px-1.5 py-0.5 rounded-md bg-border">Archived</span>
                  )}
                </div>
                <button onClick={() => handleStartEditName(skill)} className="text-sm font-semibold text-subtitle shrink-0 active:opacity-70">Edit name</button>
              </div>
            )}
            <p className="text-xs text-title mt-0.5">Level {level} · {(skill.totalMinutes / 60).toFixed(1)}h · {skill.streak || 0} day streak</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {variant === 'active' && (
            <button
              type="button"
              disabled={!canArchiveAny}
              onClick={() => {
                if (!canArchiveAny) return;
                impactLight();
                onUpdateSkill(skill.id, { tracking: 'archived' });
              }}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                canArchiveAny
                  ? 'border-border text-subtitle active:bg-border'
                  : 'border-transparent text-subtitle/40 cursor-not-allowed'
              }`}
            >
              Archive
            </button>
          )}
          {variant === 'archived' && (
            <button
              type="button"
              disabled={!canRestoreAny}
              onClick={() => {
                if (!canRestoreAny) return;
                impactLight();
                onUpdateSkill(skill.id, { tracking: 'active' });
              }}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                canRestoreAny
                  ? 'border-main/40 text-main active:bg-main/10'
                  : 'border-transparent text-subtitle/40 cursor-not-allowed'
              }`}
            >
              Restore to tracked
            </button>
          )}
          <button
            type="button"
            disabled={variant === 'active' && activeSkills.length <= MIN_TRACKED_SKILLS}
            onClick={() => handleDeleteClick(skill)}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
              variant !== 'active' || activeSkills.length > MIN_TRACKED_SKILLS
                ? 'border-red-200 text-red-600 active:bg-red-50'
                : 'border-transparent text-subtitle/40 cursor-not-allowed'
            }`}
          >
            Delete forever
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full h-full bg-background pb-24">
      <header className="relative w-full px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-4 pr-14 flex items-center gap-3">
        <button onClick={onBack} className="size-11 flex items-center justify-center text-main rounded-full active:bg-border transition-colors shrink-0" aria-label="Back">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h1 className="text-2xl font-bold text-title flex-1 min-w-0 text-center">Edit Profile</h1>
        <div className="absolute top-[max(1rem,env(safe-area-inset-top))] right-6 w-10 h-10 flex items-center justify-center">
          <Logo className="w-10 h-10 opacity-80" />
        </div>
      </header>

      <main className="flex-1 px-6 overflow-y-auto">
        <button
          type="button"
          onClick={() => {
            impactMedium();
            onAddSkill();
          }}
          className="w-full min-h-[52px] mb-4 flex items-center justify-center gap-2 rounded-xl bg-main text-textOnMain font-semibold active:opacity-90 active:scale-[0.99] transition-all"
        >
          <span className="material-symbols-outlined text-2xl">add</span>
          Add skill
        </button>
        <p className="text-sm text-textPrimary mb-6 leading-relaxed">
          New skills join <strong>tracked</strong> if you have fewer than {MAX_TRACKED_SKILLS} there; otherwise they start <strong>archived</strong>. You can have any number of archived skills. Edit icons and names anytime; delete removes a skill permanently.
        </p>

        <div className="space-y-2 mb-3">
          <h2 className="text-[10px] font-black text-main uppercase tracking-widest">
            Tracked ({activeSkills.length}/{MAX_TRACKED_SKILLS})
          </h2>
        </div>
        <div className="space-y-4 mb-8">
          {activeSkills.map(skill => renderSkillCard(skill, 'active'))}
        </div>

        {archivedSkills.length > 0 && (
          <>
            <div className="space-y-2 mb-3">
              <h2 className="text-[10px] font-black text-subtitle uppercase tracking-widest">
                Archived ({archivedSkills.length})
              </h2>
            </div>
            <div className="space-y-4">
              {archivedSkills.map(skill => renderSkillCard(skill, 'archived'))}
            </div>
          </>
        )}
      </main>

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

      {deleteConfirmForId &&
        (() => {
          const skill = state.skills.find(s => s.id === deleteConfirmForId);
          if (!skill) return null;
          return createPortal(
            <div
              className="fixed inset-0 z-[300] flex items-center justify-center p-4"
              style={{ top: 0, left: 0, right: 0, bottom: 0 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-skill-title"
            >
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirmForId(null)} />
              <div className="relative bg-surface w-full max-w-sm rounded-2xl shadow-soft p-6 animate-in zoom-in duration-200 max-h-[min(90dvh,calc(100vh-2rem))] overflow-y-auto">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
                  <span className="material-symbols-outlined text-3xl">warning</span>
                </div>
                <h3 id="delete-skill-title" className="text-xl font-bold text-textPrimary text-center mb-2">
                  Delete &quot;{skill.name}&quot; forever?
                </h3>
                <p className="text-sm text-subtitle text-center mb-6">
                  This will permanently remove this skill. <strong className="text-red-600">This cannot be undone.</strong> Any unfinished tasks that used this skill will be reassigned.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmForId(null)}
                    className="flex-1 py-3 rounded-xl border-2 border-border text-textPrimary font-semibold active:bg-background"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteConfirm}
                    className="flex-1 py-3 rounded-xl bg-red-600 text-white font-semibold active:opacity-80"
                  >
                    Delete forever
                  </button>
                </div>
              </div>
            </div>,
            document.body
          );
        })()}
    </div>
  );
};

export default EditProfileScreen;
