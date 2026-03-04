import React from 'react';
import { THEMES } from '../constants';
import { selectionChanged, impactLight } from '../lib/haptics';

interface ThemeSelectionScreenProps {
  currentThemeId: string;
  onSelectTheme: (id: string) => void;
  onBack: () => void;
}

const ThemeSelectionScreen: React.FC<ThemeSelectionScreenProps> = ({ currentThemeId, onSelectTheme, onBack }) => {
  return (
    <div className="flex flex-col w-full h-full bg-background pb-12">
      <header className="w-full bg-main pt-[max(1rem,env(safe-area-inset-top))] pb-4 px-6 transition-colors duration-300">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={onBack} className="size-11 flex items-center justify-center text-textOnMain rounded-full active:bg-white/20 transition-colors">
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <h1 className="text-2xl font-semibold text-textOnMain">Choose Palette</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full px-6 max-w-4xl mx-auto mt-6 overflow-y-auto">
        <p className="text-subtitle mb-6 font-medium">Select a color palette to customize the look of the app.</p>
        
        <div className="grid grid-cols-1 gap-4">
          {THEMES.map((theme) => {
            const isSelected = currentThemeId === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => { impactLight(); selectionChanged(); onSelectTheme(theme.id); }}
                className={`w-full p-4 rounded-xl flex items-center justify-between transition-all duration-200 border-2 ${
                  isSelected 
                    ? 'border-main bg-surface shadow-soft' 
                    : 'border-border bg-surface shadow-card active:bg-border'
                }`}
              >
                <div className="flex items-center gap-4">
                   {/* Palette Preview - uses theme tokens for preview */}
                   <div className="flex items-center">
                      <div className="w-10 h-10 rounded-l-lg" style={{ backgroundColor: theme.tokens.main }}></div>
                      <div className="w-10 h-10" style={{ backgroundColor: theme.tokens.interactive }}></div>
                      <div className="w-10 h-10 rounded-r-lg border-2 border-border" style={{ backgroundColor: theme.tokens.background }}></div>
                   </div>
                   
                   <div className="text-left">
                     <h3 className="text-[17px] font-semibold text-textPrimary">{theme.name}</h3>
                     {isSelected && <span className="text-xs font-semibold text-main uppercase tracking-wide">Active</span>}
                   </div>
                </div>

                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected ? 'border-main bg-main text-textOnMain' : 'border-border bg-transparent text-transparent'
                }`}>
                  <span className="material-symbols-outlined text-lg">check</span>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default ThemeSelectionScreen;