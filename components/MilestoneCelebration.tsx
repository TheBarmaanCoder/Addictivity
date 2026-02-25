import React, { useEffect, useState } from 'react';
import { Achievement } from '../types';
import { impactHeavy, impactMedium } from '../lib/haptics';

interface MilestoneCelebrationProps {
  achievement: Achievement | null;
  onClose: () => void;
}

const MilestoneCelebration: React.FC<MilestoneCelebrationProps> = ({ achievement, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (achievement) {
      impactHeavy();
      setShow(true);
      const timer = setTimeout(() => {
        // Automatically close after 5 seconds if not closed manually
        // setShow(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievement]);

  if (!achievement || !show) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-forest-green/90 backdrop-blur-xl animate-in fade-in duration-500"></div>
      
      {/* Confetti simulation (CSS only) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute bg-white/40 w-2 h-2 rounded-full animate-confetti"
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `-10%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-sm bg-surface rounded-[2.5rem] p-8 flex flex-col items-center shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] animate-in zoom-in slide-in-from-bottom-12 duration-500">
        <div className="w-24 h-24 rounded-3xl bg-forest-green flex items-center justify-center text-white mb-6 shadow-xl rotate-3">
          <span className="material-symbols-outlined text-6xl">{achievement.icon}</span>
        </div>

        <h3 className="text-xs font-black text-warm-orange uppercase tracking-[0.2em] mb-2">Achievement Unlocked</h3>
        <h2 className="text-3xl font-black text-forest-green text-center leading-tight mb-4">{achievement.title}</h2>
        <p className="text-txt-secondary text-center font-medium mb-8">{achievement.description}</p>

        <div className="w-full flex flex-col gap-3 mb-8">
            <div className="bg-off-white p-4 rounded-2xl flex items-center justify-between border border-txt-secondary/20">
                <span className="text-xs font-bold text-txt-secondary uppercase">Reward</span>
                <div className="flex items-center gap-1.5 text-warm-orange font-black">
                    <span className="material-symbols-outlined text-xl">diamond</span>
                    {achievement.gemReward} Gems
                </div>
            </div>
            {achievement.titleReward && (
              <div className="bg-off-white p-4 rounded-2xl flex items-center justify-between border border-txt-secondary/20">
                  <span className="text-xs font-bold text-txt-secondary uppercase">New Title</span>
                  <div className="bg-warm-orange text-white text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-wider">
                      {achievement.titleReward}
                  </div>
              </div>
            )}
        </div>

        <button 
          onClick={() => {
            impactMedium();
            setShow(false);
            onClose();
          }}
          className="w-full bg-forest-green text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          Collect Rewards
        </button>
      </div>

      <style>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti linear infinite;
        }
      `}</style>
    </div>
  );
};

export default MilestoneCelebration;