import React, { useState, useRef } from 'react';
import { Task, Skill } from '../types';
import { impactLight, impactMedium } from '../lib/haptics';

interface SwipeableTaskItemProps {
  task: Task;
  skill?: Skill;
  /** Shown when this row is an overdue task rolled into Today */
  isOverdueRollup?: boolean;
  onComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onHide?: (task: Task) => void;
}

/** Movement past this in any direction cancels “tap to edit” (avoids opening edit while scrolling). */
const TAP_THRESHOLD_PX = 12;

const SwipeableTaskItem: React.FC<SwipeableTaskItemProps> = ({
  task,
  skill,
  isOverdueRollup = false,
  onComplete,
  onDelete,
  onEdit,
}) => {
  const [offset, setOffset] = useState(0);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const startOffset = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const didDrag = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    startOffset.current = offset;
    isDragging.current = true;
    didDrag.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX.current == null || startY.current == null || !isDragging.current) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    if (
      Math.abs(currentX - startX.current) > TAP_THRESHOLD_PX ||
      Math.abs(currentY - startY.current) > TAP_THRESHOLD_PX
    ) {
      didDrag.current = true;
    }
    const diff = currentX - startX.current;
    let newOffset = startOffset.current + diff;
    if (newOffset > 0) newOffset = 0;
    if (newOffset < -160) newOffset = -160;
    setOffset(newOffset);
  };

  const handleTouchEnd = () => {
    if (startX.current == null) {
      isDragging.current = false;
      startY.current = null;
      return;
    }
    if (!didDrag.current && Math.abs(offset) < TAP_THRESHOLD_PX) {
      isDragging.current = false;
      startX.current = null;
      startY.current = null;
      if (onEdit) {
        impactLight();
        onEdit(task);
      }
      return;
    }
    isDragging.current = false;
    startX.current = null;
    startY.current = null;
    impactLight();
    if (offset < -70) setOffset(-140);
    else setOffset(0);
  };

  const handleTouchCancel = () => {
    isDragging.current = false;
    startX.current = null;
    startY.current = null;
    setOffset(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    startY.current = e.clientY;
    startOffset.current = offset;
    isDragging.current = true;
    didDrag.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (startX.current == null || startY.current == null || !isDragging.current) return;
    const currentX = e.clientX;
    const currentY = e.clientY;
    if (
      Math.abs(currentX - startX.current) > TAP_THRESHOLD_PX ||
      Math.abs(currentY - startY.current) > TAP_THRESHOLD_PX
    ) {
      didDrag.current = true;
    }
    const diff = currentX - startX.current;
    let newOffset = startOffset.current + diff;
    if (newOffset > 0) newOffset = 0;
    if (newOffset < -160) newOffset = -160;
    setOffset(newOffset);
  };

  const handleMouseUp = () => {
    if (startX.current == null) {
      isDragging.current = false;
      startY.current = null;
      return;
    }
    if (!didDrag.current && Math.abs(offset) < TAP_THRESHOLD_PX) {
      isDragging.current = false;
      startX.current = null;
      startY.current = null;
      if (onEdit) {
        impactLight();
        onEdit(task);
      }
      return;
    }
    isDragging.current = false;
    startX.current = null;
    startY.current = null;
    impactLight();
    if (offset < -70) setOffset(-140);
    else setOffset(0);
  };

  const isTodayDue =
    task.dueDate &&
    isDateToday(new Date(task.dueDate)) &&
    !isOverdueRollup;

  const displayDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
    : 'No Date';

  const cardClass = isOverdueRollup
    ? 'bg-overdueSurface border-overdueBorder text-overdueText'
    : 'bg-main border-main text-background';

  const titleClass = isOverdueRollup ? 'text-overdueText' : 'text-background';
  const sublineClass = isOverdueRollup ? 'text-overdueMuted' : 'text-background/70';
  const dateClass = isOverdueRollup
    ? 'text-overdueMuted'
    : isTodayDue
      ? 'text-interactive'
      : 'text-background/60';
  const repeatClass = isOverdueRollup ? 'text-overdueMuted' : 'text-background/60';
  const iconWrapClass = isOverdueRollup ? 'border border-overdueBorder' : 'bg-background/20';

  return (
    <div className="relative w-full h-[72px] rounded-xl overflow-hidden mb-2.5 select-none transition-all duration-300 opacity-100">
      <div className="absolute inset-0 flex flex-row-reverse bg-off-white rounded-xl">
        <button
          type="button"
          onClick={() => {
            impactMedium();
            setOffset(0);
            onDelete(task);
          }}
          className="h-full w-[70px] bg-red-500 flex items-center justify-center text-white transition-opacity duration-200"
          style={{ opacity: offset < -20 ? 1 : 0 }}
        >
          <span className="material-symbols-outlined">delete</span>
        </button>
        <button
          type="button"
          onClick={() => {
            impactLight();
            setOffset(0);
            onComplete(task);
          }}
          className="h-full w-[70px] bg-green-500 flex items-center justify-center text-white transition-opacity duration-200"
          style={{ opacity: offset < -20 ? 1 : 0 }}
        >
          <span className="material-symbols-outlined">check</span>
        </button>
      </div>

      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`absolute inset-0 px-4 py-3 flex items-center justify-between shadow-card rounded-xl cursor-grab active:cursor-grabbing z-10 border-2 ${cardClass}`}
        style={{
          transform: `translateX(${offset}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {skill && (
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconWrapClass}`}
              style={isOverdueRollup ? { backgroundColor: 'var(--overdueBadgeBg)' } : undefined}
            >
              <span
                className={`material-symbols-outlined text-[20px] ${isOverdueRollup ? 'text-overdueText' : 'text-background'}`}
                title={skill.name}
              >
                {skill.icon}
              </span>
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`font-bold text-[15px] truncate ${titleClass}`}>{task.title}</span>
              {isOverdueRollup && (
                <span
                  className="shrink-0 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md"
                  style={{
                    backgroundColor: 'var(--overdueBadgeBg)',
                    color: 'var(--overdueBadgeText)',
                  }}
                >
                  Overdue
                </span>
              )}
            </div>
            <span className={`text-[11px] font-medium uppercase tracking-wide ${sublineClass}`}>
              {skill?.name || 'General'}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0 pl-2">
          <div className={`text-xs font-bold ${dateClass}`}>{displayDate}</div>
          {task.recurrence && (
            <span className={`text-[10px] mt-1 flex items-center gap-0.5 ${repeatClass}`}>
              <span className="material-symbols-outlined text-[12px]">repeat</span>
              {task.recurrence.value}
              {task.recurrence.unit[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

function isDateToday(date: Date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export default SwipeableTaskItem;
