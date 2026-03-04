import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import MinutesWheelPicker from './MinutesWheelPicker';
import { impactMedium } from '../lib/haptics';

interface CompleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (minutes: number, multiplier: number) => void;
  taskTitle: string;
}

const CompleteTaskModal: React.FC<CompleteTaskModalProps> = ({ isOpen, onClose, onConfirm, taskTitle }) => {
  const [minutes, setMinutes] = useState<number>(30);
  const [multiplier, setMultiplier] = useState<number>(1.0);

  useEffect(() => {
    if (isOpen) {
      setMinutes(30);
      setMultiplier(1.0);
    }
  }, [isOpen, taskTitle]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-surface w-full rounded-t-3xl shadow-soft p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex flex-col items-center animate-in slide-in-from-bottom-10 duration-200">
        <div className="w-10 h-1 bg-background rounded-full mx-auto mb-5" />
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-14 h-14 rounded-full bg-main/10 flex items-center justify-center text-main">
            <span className="material-symbols-outlined text-3xl">check_circle</span>
          </div>
          <Logo className="w-10 h-10 opacity-80" />
        </div>
        <h3 className="text-lg font-semibold text-main mb-1 text-center">Complete Task</h3>
        <p className="text-subtitle text-sm mb-6 text-center max-w-[200px] truncate">{taskTitle}</p>

        {/* Time Input — iOS-style hours & minutes wheels */}
        <label className="text-xs font-semibold text-subtitle uppercase tracking-wide mb-2">Time Spent</label>
        <div className="w-full max-w-[200px] mx-auto mb-4">
          <MinutesWheelPicker value={minutes} onChange={setMinutes} />
        </div>
        <p className="text-sm text-subtitle mb-6">
          {minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60 ? `${minutes % 60}m` : ''}`.trim()}
        </p>

        {/* Intensity Slider */}
        <div className="w-full mb-8">
            <div className="flex justify-between items-end mb-2">
                <label className="text-xs font-semibold text-subtitle uppercase tracking-wide">Intensity / Demand</label>
            </div>
            <input 
                type="range" 
                min="0.6" 
                max="1.4" 
                step="0.1" 
                value={multiplier}
                onChange={(e) => setMultiplier(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-background rounded-full appearance-none cursor-pointer accent-main"
            />
            <div className="flex justify-between mt-1 text-[10px] text-subtitle font-medium">
                <span>Easy</span>
                <span>Normal</span>
                <span>Hard</span>
            </div>
        </div>

        <button 
          onClick={() => {
            impactMedium();
            onConfirm(minutes, multiplier);
          }}
          className="w-full bg-main text-textOnMain font-semibold py-3.5 rounded-xl active:opacity-80 active:scale-[0.98] transition-all"
        >
          Confirm & Collect Gems
        </button>
        <button 
          onClick={onClose}
          className="mt-3 min-h-[44px] text-sm font-medium text-subtitle active:text-main"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CompleteTaskModal;