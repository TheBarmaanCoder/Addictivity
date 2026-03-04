import React, { useState } from 'react';
import { AppState, Skill, ViewType } from '../types';
import Logo from '../components/Logo';
import { impactLight } from '../lib/haptics';

interface SettingsScreenProps {
  state: AppState;
  onUpdateSkill: (id: string, updates: Partial<Skill>) => void;
  onUpdateProfile?: (updates: Partial<AppState>) => void;
  onNavigate: (view: ViewType) => void;
  onLogout?: () => void;
  currentUserEmail?: string | null;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ state, onUpdateProfile, onNavigate, onLogout, currentUserEmail }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState(state.userName);
  
  const handleBackup = () => {
    const backupPackage = {
      timestamp: new Date().toISOString(),
      exportVersion: 1,
      userEmail: currentUserEmail ?? 'unknown',
      data: state,
    };
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(backupPackage, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `addictivity_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSaveName = () => {
    const trimmed = editNameValue.trim();
    if (trimmed && trimmed !== state.userName) onUpdateProfile?.({ userName: trimmed });
    setIsEditingName(false);
  };

  return (
    <div className="flex flex-col w-full h-full bg-background pb-24">
      <div className="relative w-full bg-main pt-[max(1rem,env(safe-area-inset-top))] pb-8 px-6 pr-14 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-background">Settings</h1>
        </div>
        <div className="absolute top-[max(1rem,env(safe-area-inset-top))] right-6 w-10 h-10 flex items-center justify-center">
          <Logo className="w-10 h-10 text-background opacity-80" />
        </div>
      </div>

      <main className="flex-1 flex flex-col w-full px-6 max-w-4xl mx-auto gap-6 mt-8 overflow-y-auto">
        <section className="flex flex-col gap-3 pb-8">
            {onUpdateProfile && (
              <div className="w-full bg-surface border-2 border-border rounded-xl p-4 shadow-card flex flex-col gap-3">
                <span className="text-xs font-semibold text-subtitle uppercase tracking-wide">Display name</span>
                {isEditingName ? (
                  <div className="flex gap-2 flex-wrap items-center">
                    <input
                      value={editNameValue}
                      onChange={(e) => setEditNameValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                      className="flex-1 min-w-0 px-3 py-2.5 min-h-[44px] border-2 border-border rounded-xl text-textPrimary font-semibold focus:outline-none focus:border-main focus:ring-2 focus:ring-main/10 transition-all"
                      autoFocus
                    />
                    <button onClick={handleSaveName} className="px-4 py-2.5 min-h-[44px] bg-main text-textOnMain font-semibold rounded-xl active:opacity-80 transition-all">Save</button>
                    <button onClick={() => { setEditNameValue(state.userName); setIsEditingName(false); }} className="px-4 py-2.5 min-h-[44px] bg-background text-subtitle font-semibold rounded-xl active:bg-border transition-all">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[17px] font-semibold text-textPrimary truncate">{state.userName}</span>
                    <button onClick={() => { setEditNameValue(state.userName); setIsEditingName(true); }} className="text-sm font-semibold text-main active:opacity-70 shrink-0">Edit</button>
                  </div>
                )}
              </div>
            )}
            <div className="bg-surface border-2 border-border rounded-xl shadow-card overflow-hidden">
              <button 
                onClick={() => { impactLight(); onNavigate('editProfile'); }}
                className="w-full min-h-[52px] px-5 py-3 flex items-center justify-between active:bg-background transition-colors"
              >
                  <span className="text-[17px] font-semibold text-textPrimary">Edit profile</span>
                  <span className="material-symbols-outlined text-xl text-subtitle">chevron_right</span>
              </button>
              <div className="h-[0.5px] bg-border ml-5" />
              <button 
                onClick={() => { impactLight(); onNavigate('themeSelection'); }}
                className="w-full min-h-[52px] px-5 py-3 flex items-center justify-between active:bg-background transition-colors"
              >
                  <span className="text-[17px] font-semibold text-textPrimary">UI Customization</span>
                  <span className="material-symbols-outlined text-xl text-subtitle">chevron_right</span>
              </button>
              <div className="h-[0.5px] bg-border ml-5" />
              <button 
                onClick={handleBackup}
                className="w-full min-h-[52px] px-5 py-3 flex items-center justify-between active:bg-background transition-colors"
              >
                  <span className="text-[17px] font-semibold text-textPrimary">Backup Data</span>
                  <span className="material-symbols-outlined text-xl text-subtitle">download</span>
              </button>
              <div className="h-[0.5px] bg-border ml-5" />
              <button
                onClick={() => { impactLight(); window.open('mailto:support@addictivity.app?subject=Addictivity%20Feedback', '_blank'); }}
                className="w-full min-h-[52px] px-5 py-3 flex items-center justify-between active:bg-background transition-colors"
              >
                  <span className="text-[17px] font-semibold text-textPrimary">Support / Feedback</span>
                  <span className="material-symbols-outlined text-xl text-subtitle">chevron_right</span>
              </button>
            </div>
            
            {onLogout && (
              <button 
                onClick={onLogout}
                className="w-full min-h-[52px] bg-surface border-[3px] border-border text-red-500 px-5 py-3 rounded-xl shadow-card flex items-center justify-between active:bg-red-50 transition-colors mt-2"
              >
                  <span className="text-[17px] font-semibold">Log Out</span>
                  <span className="material-symbols-outlined text-xl text-red-300">logout</span>
              </button>
            )}
        </section>
      </main>
    </div>
  );
};

export default SettingsScreen;