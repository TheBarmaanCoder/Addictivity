import React, { useEffect, useState } from 'react';

interface RewardToastProps {
  xp: number;
  gems: number;
  onDone: () => void;
}

const RewardToast: React.FC<RewardToastProps> = ({ xp, gems, onDone }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 300);
    }, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  if (!visible) return null;

  return (
    <div className="fixed left-0 right-0 top-[20%] z-[200] flex justify-center pointer-events-none px-6">
      <div className="animate-reward-float flex flex-col items-center gap-1.5 bg-forest-green/95 backdrop-blur-md text-white rounded-2xl shadow-soft px-6 py-4 min-w-[160px]">
        <div className="flex items-center gap-2 text-body font-bold">
          <span className="text-warm-orange">+{xp}</span>
          <span>XP</span>
        </div>
        <div className="flex items-center gap-2 text-subhead font-semibold text-white/90">
          <span className="material-symbols-outlined text-lg">diamond</span>
          <span>+{gems} gems</span>
        </div>
      </div>
    </div>
  );
};

export default RewardToast;
