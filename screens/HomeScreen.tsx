import React, { useState, useMemo, useRef } from 'react';
import { AppState, Task } from '../types';
import { selectionChanged, impactLight } from '../lib/haptics';
import SwipeableTaskItem from '../components/SwipeableTaskItem';
import CompleteTaskModal from '../components/CompleteTaskModal';
import MonthCalendarModal from '../components/MonthCalendarModal';
import FilterModal from '../components/FilterModal';
import Logo from '../components/Logo';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface HomeScreenProps {
  state: AppState;
  onNavigate: (view: any) => void;
  onDeleteTask: (taskId: string) => void;
  onCompleteTask: (taskId: string, minutes: number, multiplier: number) => void;
  onEditTask: (task: Task) => void;
}

const TASK_HINT_STORAGE_KEY = 'addictivity_task_hint_seen';

const HomeScreen: React.FC<HomeScreenProps> = ({ state, onNavigate, onDeleteTask, onCompleteTask, onEditTask }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [completingTask, setCompletingTask] = useState<Task | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'skill'>('recent');
  const [analysisView, setAnalysisView] = useState<'Week' | 'Month' | 'Year'>('Week');
  const [taskHintSeen, setTaskHintSeen] = useState(() => {
    try {
      return localStorage.getItem(TASK_HINT_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const markTaskHintSeen = () => {
    setTaskHintSeen(true);
    try {
      localStorage.setItem(TASK_HINT_STORAGE_KEY, 'true');
    } catch {}
  };

  // Drag Logic for Calendar
  const dragStartX = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  const handleDragStart = (clientX: number) => {
    dragStartX.current = clientX;
    isDraggingRef.current = false;
  };

  const handleDragMove = (clientX: number) => {
    if (dragStartX.current === null) return;
    const diff = clientX - dragStartX.current;
    
    // Sensitivity threshold (pixels to move 1 day)
    const threshold = 25; 

    if (Math.abs(diff) > threshold) {
        isDraggingRef.current = true;
        const direction = -Math.sign(diff); // Drag Left (-diff) -> Future (+1 day)
        impactLight();
        selectionChanged();
        setSelectedDate(prev => {
            const d = new Date(prev);
            d.setDate(d.getDate() + direction);
            return d;
        });
        dragStartX.current = clientX; // Reset anchor for continuous scrubbing
    }
  };

  const handleDragEnd = () => {
    dragStartX.current = null;
    // Delay resetting dragging flag so clicks don't fire immediately after a drag
    setTimeout(() => {
        isDraggingRef.current = false;
    }, 100);
  };

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date(selectedDate);
      d.setDate(selectedDate.getDate() + i);
      days.push(d);
    }
    return days;
  }, [selectedDate]);

  const filteredTasks = useMemo(() => {
    let tasks = state.tasks.filter(t => {
      if (t.completed) return false;
      if (!t.dueDate) return true;
      const taskDate = new Date(t.dueDate);
      return taskDate.toDateString() === selectedDate.toDateString();
    });

    if (sortBy === 'skill') {
        tasks = [...tasks].sort((a, b) => {
           const sA = state.skills.find(s => s.id === a.skillId);
           const sB = state.skills.find(s => s.id === b.skillId);
           return (sA?.name || '').localeCompare(sB?.name || '');
       });
    }
    // 'recent' uses default array order (insertion order)

    return tasks;
  }, [state.tasks, selectedDate, sortBy, state.skills]);

  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    if (analysisView === 'Week') {
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateString = d.toDateString();
            const dailyMinutes = state.tasks.filter(t => t.completed && t.completedAt && new Date(t.completedAt).toDateString() === dateString)
              .reduce((acc, t) => acc + (t.minutesSpent || 0), 0);
            data.push({ id: dateString, label: d.toLocaleDateString('en-US', { weekday: 'narrow' }), hours: parseFloat((dailyMinutes / 60).toFixed(1)) });
        }
    } else if (analysisView === 'Month') {
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(currentYear, currentMonth, i);
            const dateString = d.toDateString();
            const dailyMinutes = state.tasks.filter(t => t.completed && t.completedAt && new Date(t.completedAt).toDateString() === dateString)
              .reduce((acc, t) => acc + (t.minutesSpent || 0), 0);
            data.push({ id: `day-${i}`, label: i.toString(), hours: parseFloat((dailyMinutes / 60).toFixed(1)) });
        }
    } else {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        for (let i = 0; i < 12; i++) {
            const monthlyMinutes = state.tasks.filter(t => t.completed && t.completedAt && new Date(t.completedAt).getFullYear() === currentYear && new Date(t.completedAt).getMonth() === i)
              .reduce((acc, t) => acc + (t.minutesSpent || 0), 0);
            data.push({ id: `month-${i}`, label: monthNames[i][0], fullName: monthNames[i], hours: parseFloat((monthlyMinutes / 60).toFixed(1)) });
        }
    }
    return data;
  }, [state.tasks, analysisView]);

  const totalHours = chartData.reduce((acc, item) => acc + item.hours, 0).toFixed(1);

  const maxStreak = useMemo(() => Math.max(0, ...state.skills.map(s => s.streak || 0)), [state.skills]);
  const todayStr = new Date().toDateString();
  const completedToday = state.skills.some(s => s.lastSkillCompletedAt && new Date(s.lastSkillCompletedAt).toDateString() === todayStr);
  const showStreakBanner = maxStreak > 0;

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Refined Header */}
      <header className="relative px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-4 pr-14">
        <h2 className="text-display font-bold text-title truncate">{state.userName}</h2>
        <div className="absolute top-[max(1rem,env(safe-area-inset-top))] right-6 w-10 h-10 flex items-center justify-center">
          <Logo className="w-10 h-10 opacity-80" />
        </div>
      </header>

      {showStreakBanner && (
        <div className="px-6 mb-2">
          <div className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 ${completedToday ? 'bg-main/10 border-main/20' : 'bg-interactive/15 border-interactive/30'}`}>
            <span className="material-symbols-outlined text-interactive text-xl">local_fire_department</span>
            <span className="text-body font-semibold text-textPrimary">
              {maxStreak} day{maxStreak !== 1 ? 's' : ''} streak
            </span>
            {!completedToday && (
              <span className="text-caption text-subtitle font-medium">— Don&apos;t break it!</span>
            )}
          </div>
        </div>
      )}

      <div className="px-6 flex flex-col gap-6">
        {/* Toolbar */}
        <div className="w-full flex flex-col gap-4">
          <div className="h-[1px] bg-border w-full" />
          <div className="flex justify-between px-4">
            <button onClick={() => { impactLight(); selectionChanged(); setIsCalendarOpen(true); }} className="size-11 rounded-full bg-interactive flex items-center justify-center text-background active:opacity-80 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-[24px]">calendar_today</span>
            </button>
            <button onClick={() => { impactLight(); onNavigate('addTask'); }} className="size-11 rounded-full bg-interactive flex items-center justify-center text-background active:opacity-80 active:scale-95 transition-all shadow-soft">
              <span className="material-symbols-outlined text-[28px]">add</span>
            </button>
            <button onClick={() => { impactLight(); selectionChanged(); setIsFilterOpen(true); }} className="size-11 rounded-full bg-interactive flex items-center justify-center text-background active:opacity-80 active:scale-95 transition-all" aria-label="Sort" title="Sort">
              <span className="material-symbols-outlined text-[24px]">filter_alt</span>
            </button>
          </div>
        </div>

        {/* Draggable Calendar Strip */}
        <div 
          className="flex justify-between items-center bg-surface p-2 rounded-xl shadow-sm border-2 border-border touch-none select-none cursor-grab active:cursor-grabbing overflow-hidden"
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onMouseMove={(e) => handleDragMove(e.clientX)}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
          onTouchEnd={handleDragEnd}
        >
          {calendarDays.map((date, i) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === new Date().toDateString();
            const hasTask = state.tasks.some(t => t.dueDate && new Date(t.dueDate).toDateString() === date.toDateString() && !t.completed);
            return (
              <button 
                key={i} 
                onClick={() => {
                   if (!isDraggingRef.current) {
                     selectionChanged();
                     setSelectedDate(date);
                   }
                }}
                className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] h-14 rounded-xl transition-all border-2 ${isSelected ? 'bg-main text-background shadow-soft border-main' : 'text-textPrimary active:bg-border border-transparent'}`}
              >
                <span className="text-overline font-bold uppercase pointer-events-none">{date.toLocaleDateString('en-US', { weekday: 'narrow' })}</span>
                <span className={`text-body font-bold pointer-events-none ${isToday && !isSelected ? 'text-interactive' : ''}`}>{date.getDate()}</span>
                {hasTask && !isSelected && <div className="w-1 h-1 bg-interactive rounded-full mt-0.5 pointer-events-none"></div>}
              </button>
            );
          })}
        </div>
        <p className="text-overline text-textPrimary text-center mt-1">Swipe to change day</p>

        {/* One-time task completion hint */}
        {filteredTasks.length > 0 && !taskHintSeen && (
          <div className="flex items-center justify-between gap-3 p-3 bg-interactive/15 border-2 border-interactive/30 rounded-xl mb-2">
            <p className="text-sm font-medium text-textPrimary flex-1">
              Swipe left on a task to complete it.
            </p>
            <button
              onClick={() => { impactLight(); markTaskHintSeen(); }}
              className="text-sm font-semibold text-main shrink-0 px-3 py-1.5 rounded-lg active:bg-interactive/20 transition-colors"
            >
              Got it
            </button>
          </div>
        )}

        {/* Task List */}
        <div className="w-full flex flex-col min-h-[200px]">
          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-subtitle gap-4">
              <span className="material-symbols-outlined text-4xl">task_alt</span>
              <p>No tasks for this day.</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <SwipeableTaskItem key={task.id} task={task} skill={state.skills.find(s => s.id === task.skillId)} onDelete={() => onDeleteTask(task.id)} onComplete={() => setCompletingTask(task)} onEdit={onEditTask} />
            ))
          )}
        </div>

        {/* Chart Section */}
        <div className="w-full flex flex-col gap-4 mt-2">
          <div className="h-[1px] bg-border w-full" />
          <div className="flex items-center justify-between w-full">
            <h3 className="text-subtitle font-bold">Time Spent</h3>
            <div className="flex bg-surface p-1 rounded-xl">
               {(['Week', 'Month', 'Year'] as const).map(view => (
                  <button key={view} onClick={() => { impactLight(); selectionChanged(); setAnalysisView(view); }} className={`px-3 py-1.5 rounded-lg text-caption font-semibold transition-all ${analysisView === view ? 'bg-surface shadow-card text-main' : 'text-textPrimary active:text-textPrimary'}`}>
                    {view}
                  </button>
               ))}
            </div>
          </div>
          <div className="w-full bg-surface border-2 border-border rounded-xl p-6 shadow-soft">
            <div className="mb-4">
              <p className="text-caption font-semibold text-textPrimary mb-1">Total {analysisView === 'Week' ? 'Last 7 Days' : analysisView === 'Month' ? 'This Month' : 'This Year'}</p>
              <h2 className="text-display font-bold text-textPrimary">{totalHours}<span className="text-body text-textPrimary font-medium ml-1">hrs</span></h2>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                   <XAxis dataKey="id" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'var(--textPrimary)'}} dy={10} interval={analysisView === 'Month' ? 2 : 0} tickFormatter={(val) => { const item = chartData.find(d => d.id === val); return item ? item.label : val; }} />
                   <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'var(--textPrimary)'}} width={25} />
                   <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} formatter={(value: number) => [`${value} hrs`, 'Time Spent']} />
                   <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={` cell-${index}`} fill={index % 2 === 0 ? 'var(--main)' : 'var(--interactive)'} />
                      ))}
                   </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <CompleteTaskModal isOpen={!!completingTask} taskTitle={completingTask?.title || ''} onClose={() => setCompletingTask(null)} onConfirm={(minutes, multiplier) => { if (completingTask) { onCompleteTask(completingTask.id, minutes, multiplier); markTaskHintSeen(); setCompletingTask(null); } }} />
      <MonthCalendarModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} selectedDate={selectedDate} onSelectDate={(d) => { selectionChanged(); setSelectedDate(d); }} tasks={state.tasks} skills={state.skills} />
      <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} currentSort={sortBy} onSelectSort={(s) => { impactLight(); setSortBy(s); }} />
    </div>
  );
};

export default HomeScreen;