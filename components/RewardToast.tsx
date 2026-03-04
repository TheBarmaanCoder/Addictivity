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
    }, 4500);
    return () => clearTimeout(t);
  }, [onDone]);

  if (!visible) return null;

  return (
    <div className="fixed left-0 right-0 top-[20%] z-[200] flex justify-center pointer-events-none px-6">
      <div className="animate-reward-float flex flex-col items-center gap-1.5 bg-main/95 backdrop-blur-md text-textOnMain rounded-2xl shadow-soft px-6 py-4 min-w-[160px] border-2 border-main/30">
        <div className="flex items-center gap-2 text-body font-bold">
          <span className="text-interactive">+{xp}</span>
          <span>XP</span>
        </div>
        <div className="flex items-center gap-2 text-subhead font-semibold text-textOnMain/90">
          <span className="material-symbols-outlined text-lg">diamond</span>
          <span>+{gems} gems</span>
        </div>
      </div>
    </div>
  );
};

export default RewardToast;
