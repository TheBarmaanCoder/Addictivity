import React from 'react';
import { selectionChanged } from '../lib/haptics';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSort: 'recent' | 'skill';
  onSelectSort: (sort: 'recent' | 'skill') => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, currentSort, onSelectSort }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-surface w-full rounded-t-3xl shadow-soft p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex flex-col animate-in slide-in-from-bottom-10 duration-200">
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
        <h3 className="text-lg font-semibold text-main mb-5">Sort Tasks</h3>
        
        <div className="flex flex-col gap-2.5">
            <button 
                onClick={() => { selectionChanged(); onSelectSort('recent'); onClose(); }}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all min-h-[56px] active:scale-[0.98] ${
                    currentSort === 'recent' 
                    ? 'bg-main/8' 
                    : 'bg-background active:bg-border'
                }`}
            >
                <div className={`size-10 rounded-full flex items-center justify-center ${currentSort === 'recent' ? 'bg-main text-textOnMain' : 'bg-background text-subtitle'}`}>
                    <span className="material-symbols-outlined">schedule</span>
                </div>
                <div className="flex flex-col items-start">
                    <span className={`font-semibold text-[15px] ${currentSort === 'recent' ? 'text-main' : 'text-textPrimary'}`}>Order Added</span>
                    <span className="text-xs text-subtitle">Chronological order</span>
                </div>
                {currentSort === 'recent' && <span className="material-symbols-outlined text-main ml-auto text-xl">check_circle</span>}
            </button>

            <button 
                onClick={() => { selectionChanged(); onSelectSort('skill'); onClose(); }}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all min-h-[56px] active:scale-[0.98] ${
                    currentSort === 'skill' 
                    ? 'bg-main/8' 
                    : 'bg-background active:bg-border'
                }`}
            >
                <div className={`size-10 rounded-full flex items-center justify-center ${currentSort === 'skill' ? 'bg-main text-textOnMain' : 'bg-background text-subtitle'}`}>
                    <span className="material-symbols-outlined">category</span>
                </div>
                <div className="flex flex-col items-start">
                    <span className={`font-semibold text-[15px] ${currentSort === 'skill' ? 'text-main' : 'text-textPrimary'}`}>Skill Category</span>
                    <span className="text-xs text-subtitle">Group by skill type</span>
                </div>
                {currentSort === 'skill' && <span className="material-symbols-outlined text-main ml-auto text-xl">check_circle</span>}
            </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;