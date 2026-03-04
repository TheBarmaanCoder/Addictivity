import React, { useState, useEffect } from 'react';
import { Task, Skill } from '../types';
import { selectionChanged } from '../lib/haptics';

interface MonthCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  tasks: Task[];
  skills: Skill[];
}

const MonthCalendarModal: React.FC<MonthCalendarModalProps> = ({ isOpen, onClose, selectedDate, onSelectDate, tasks, skills }) => {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));

  // Reset view to selected date when opening
  useEffect(() => {
    if (isOpen) {
      setViewDate(new Date(selectedDate));
    }
  }, [isOpen, selectedDate]);

  if (!isOpen) return null;

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day: number) => {
    selectionChanged();
    const newDate = new Date(year, month, day);
    onSelectDate(newDate);
    onClose();
  };

  const daysArray = [];
  // Empty slots for days before start of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysArray.push(null);
  }
  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-surface w-full rounded-t-3xl shadow-soft p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex flex-col animate-in slide-in-from-bottom-10 duration-200">
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={handlePrevMonth} className="size-11 flex items-center justify-center rounded-full active:bg-background text-main transition-colors">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <div className="text-lg font-semibold text-main">
            {monthNames[month]} {year}
          </div>
          <button onClick={handleNextMonth} className="size-11 flex items-center justify-center rounded-full active:bg-background text-main transition-colors">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-center text-xs font-bold text-subtitle">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-y-2 gap-x-1">
          {daysArray.map((day, index) => {
            if (day === null) return <div key={`empty-${index}`} />;
            
            const isToday = 
              day === new Date().getDate() && 
              month === new Date().getMonth() && 
              year === new Date().getFullYear();
              
            const isSelected = 
              day === selectedDate.getDate() && 
              month === selectedDate.getMonth() && 
              year === selectedDate.getFullYear();

            // Find tasks for this specific day
            // Note: We only check Incomplete tasks with a valid due date
            const dayTasks = tasks.filter(t => {
                if (!t.dueDate || t.completed) return false;
                const d = new Date(t.dueDate);
                return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
            });

            // Get unique skills for these tasks
            const daySkillIds = Array.from(new Set(dayTasks.map(t => t.skillId)));

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`
                  h-10 w-10 mx-auto rounded-full flex flex-col items-center justify-center transition-all relative
                  ${isSelected ? 'bg-main text-textOnMain shadow-soft' : 
                    isToday ? 'bg-interactive text-textOnMain' : 'text-textPrimary active:bg-background'}
                `}
              >
                <span className={`text-sm font-semibold leading-none ${daySkillIds.length > 0 ? 'mt-1' : ''}`}>{day}</span>
                
                {/* Dots Indicator */}
                {!isSelected && daySkillIds.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                        {daySkillIds.slice(0, 3).map(sid => {
                            const skill = skills.find(s => s.id === sid);
                            return (
                                <div 
                                    key={sid} 
                                    className={`w-1 h-1 rounded-full ${isToday ? 'bg-surface' : ''}`}
                                    style={{ backgroundColor: isToday ? 'var(--surface)' : skill?.color || 'var(--border)' }} 
                                />
                            );
                        })}
                        {daySkillIds.length > 3 && (
                             <div className={`w-1 h-1 rounded-full ${isToday ? 'bg-surface' : 'bg-border'}`} />
                        )}
                    </div>
                )}
              </button>
            );
          })}
        </div>

        <button 
          onClick={onClose}
          className="mt-6 w-full py-3 min-h-[44px] rounded-xl bg-background text-subtitle font-semibold active:bg-border transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default MonthCalendarModal;