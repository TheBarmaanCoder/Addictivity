import React, { useEffect } from 'react';

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  durationMs?: number;
}

const UndoToast: React.FC<UndoToastProps> = ({ message, onUndo, onDismiss, durationMs = 5000 }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(t);
  }, [onDismiss, durationMs]);

  return (
    <div className="fixed left-4 right-4 bottom-[max(5rem,calc(env(safe-area-inset-bottom)+5rem))] z-[200] flex justify-center pointer-events-auto">
      <div className="flex items-center gap-3 bg-txt text-white rounded-xl shadow-soft px-4 py-3 animate-in slide-in-from-bottom-4 duration-300">
        <span className="text-sm font-medium flex-1">{message}</span>
        <button
          onClick={onUndo}
          className="text-warm-orange font-bold text-sm shrink-0 active:opacity-80"
        >
          Undo
        </button>
      </div>
    </div>
  );
};

export default UndoToast;
