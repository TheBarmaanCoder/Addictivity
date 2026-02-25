import React, { useState, useRef } from 'react';
import { Task, Skill } from '../types';
import { impactLight, impactMedium } from '../lib/haptics';

interface SwipeableTaskItemProps {
  task: Task;
  skill?: Skill;
  onComplete: (task: Task) => void;
  onDelete: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onHide?: (task: Task) => void;
}

const TAP_THRESHOLD_PX = 10;

const SwipeableTaskItem: React.FC<SwipeableTaskItemProps> = ({ task, skill, onComplete, onDelete, onEdit }) => {
  const [offset, setOffset] = useState(0);
  const startX = useRef<number | null>(null);
  const startOffset = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const didDrag = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startOffset.current = offset;
    isDragging.current = true;
    didDrag.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startX.current || !isDragging.current) return;
    const currentX = e.touches[0].clientX;
    if (Math.abs(currentX - startX.current) > TAP_THRESHOLD_PX) didDrag.current = true;
    const diff = currentX - startX.current;
    let newOffset = startOffset.current + diff;
    if (newOffset > 0) newOffset = 0;
    if (newOffset < -160) newOffset = -160;
    setOffset(newOffset);
  };

  const handleTouchEnd = () => {
    if (startX.current == null) { isDragging.current = false; return; }
    if (!didDrag.current && Math.abs(offset) < TAP_THRESHOLD_PX) {
      isDragging.current = false;
      startX.current = null;
      if (onEdit) {
        impactLight();
        onEdit(task);
      }
      return;
    }
    isDragging.current = false;
    startX.current = null;
    impactLight();
    if (offset < -70) setOffset(-140);
    else setOffset(0);
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    startOffset.current = offset;
    isDragging.current = true;
    didDrag.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!startX.current || !isDragging.current) return;
    const currentX = e.clientX;
    if (Math.abs(currentX - startX.current) > TAP_THRESHOLD_PX) didDrag.current = true;
    const diff = currentX - startX.current;
    let newOffset = startOffset.current + diff;
    if (newOffset > 0) newOffset = 0;
    if (newOffset < -160) newOffset = -160;
    setOffset(newOffset);
  };

  const handleMouseUp = () => {
    if (startX.current == null) { isDragging.current = false; return; }
    if (!didDrag.current && Math.abs(offset) < TAP_THRESHOLD_PX) {
      isDragging.current = false;
      startX.current = null;
      if (onEdit) {
        impactLight();
        onEdit(task);
      }
      return;
    }
    isDragging.current = false;
    startX.current = null;
    impactLight();
    if (offset < -70) setOffset(-140);
    else setOffset(0);
  };

  // Overdue check
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isDateToday(new Date(task.dueDate));
  const isToday = task.dueDate && isDateToday(new Date(task.dueDate));
  
  const displayDate = task.dueDate 
    ? isToday ? 'Today' : new Date(task.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
    : 'No Date';

  return (
    <div className={`relative w-full h-[72px] rounded-xl overflow-hidden mb-2.5 select-none transition-all duration-300 opacity-100`}>
      {/* Background Actions (Swipe Left) */}
      <div className="absolute inset-0 flex flex-row-reverse bg-off-white rounded-xl">
        <button 
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

      {/* Foreground Task Card - Filled Primary Color */}
      <div 
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`absolute inset-0 px-4 py-3 flex items-center justify-between shadow-card rounded-xl cursor-grab active:cursor-grabbing z-10 bg-forest-green`}
        style={{ 
          transform: `translateX(${offset}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.2s ease-out'
        }}
      >
        <div className="flex items-center gap-3">
          {skill && (
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
               <span className="material-symbols-outlined text-[20px] text-white" title={skill.name}>
                {skill.icon}
              </span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-bold text-[15px] text-white truncate max-w-[150px]">{task.title}</span>
            <span className="text-[11px] font-medium text-white/70 uppercase tracking-wide">{skill?.name || 'General'}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
            <div className={`text-xs font-bold ${isOverdue ? 'text-warm-orange' : isToday ? 'text-warm-orange' : 'text-white/60'}`}>
              {displayDate}
            </div>
             {task.recurrence && (
              <span className="text-[10px] text-white/60 mt-1 flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[12px]">repeat</span>
                {task.recurrence.value}{task.recurrence.unit[0]}
              </span>
            )}
        </div>
      </div>
    </div>
  );
};

function isDateToday(date: Date) {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

export default SwipeableTaskItem;