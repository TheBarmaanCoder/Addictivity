import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { AppState, Task } from '../types';
import { selectionChanged, impactLight } from '../lib/haptics';
import SwipeableTaskItem from '../components/SwipeableTaskItem';
import CompleteTaskModal from '../components/CompleteTaskModal';
import RepeatTaskChoiceModal from '../components/RepeatTaskChoiceModal';
import { startOfDay, isSameCalendarDay } from '../lib/taskDates';
import MonthCalendarModal from '../components/MonthCalendarModal';
import FilterModal from '../components/FilterModal';
import Logo from '../components/Logo';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getActiveSkills } from '../lib/skills';

interface HomeScreenProps {
  state: AppState;
  onNavigate: (view: any) => void;
  onDeleteTask: (taskId: string) => void;
  onSkipRepeatOccurrence: (taskId: string) => void;
  onCompleteTask: (taskId: string, minutes: number, multiplier: number, options?: { endRecurrence?: boolean }) => void;
  onEditTask: (task: Task) => void;
  onModalStateChange?: (isOpen: boolean) => void;
}

const DAY_STRIP_RANGE = 60;
const VISIBLE_DAYS = 7;

const TASK_HINT_STORAGE_KEY = 'addictivity_task_hint_seen';
const DAY_STRIP_HINT_STORAGE_KEY = 'addictivity_day_strip_hint_seen';

const HomeScreen: React.FC<HomeScreenProps> = ({
  state,
  onNavigate,
  onDeleteTask,
  onSkipRepeatOccurrence,
  onCompleteTask,
  onEditTask,
  onModalStateChange,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [completingTask, setCompletingTask] = useState<Task | null>(null);
  const [pendingRecurrenceEnd, setPendingRecurrenceEnd] = useState(false);
  const [repeatChoice, setRepeatChoice] = useState<{ action: 'complete' | 'delete'; task: Task } | null>(null);
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
  const [dayStripHintSeen, setDayStripHintSeen] = useState(() => {
    try {
      return localStorage.getItem(DAY_STRIP_HINT_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const anyModalOpen = !!completingTask || isCalendarOpen || isFilterOpen || !!repeatChoice;
  useEffect(() => {
    onModalStateChange?.(anyModalOpen);
  }, [anyModalOpen, onModalStateChange]);

  const markTaskHintSeen = () => {
    setTaskHintSeen(true);
    try {
      localStorage.setItem(TASK_HINT_STORAGE_KEY, 'true');
    } catch {}
  };
  const markDayStripHintSeen = () => {
    setDayStripHintSeen(true);
    try {
      localStorage.setItem(DAY_STRIP_HINT_STORAGE_KEY, 'true');
    } catch {}
  };

  // Smooth horizontal day strip
  const todayAnchor = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  }, []);

  const stripDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = -DAY_STRIP_RANGE; i <= DAY_STRIP_RANGE; i++) {
      const d = new Date(todayAnchor);
      d.setDate(todayAnchor.getDate() + i);
      days.push(d);
    }
    return days;
  }, [todayAnchor]);

  const stripRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);
  const selectedDateRef = useRef(selectedDate);
  selectedDateRef.current = selectedDate;
  const hasScrolledInit = useRef(false);
  const lastTickedIndexRef = useRef<number | null>(null);

  const scrollToDateIndex = useCallback((index: number, smooth: boolean) => {
    const el = stripRef.current;
    if (!el || stripDays.length === 0) return;
    const cellW = el.scrollWidth / stripDays.length;
    const left = Math.max(0, Math.min(index * cellW + cellW / 2 - el.clientWidth / 2, el.scrollWidth - el.clientWidth));
    isProgrammaticScroll.current = true;
    lastTickedIndexRef.current = index;
    el.scrollTo({ left, behavior: smooth ? 'smooth' : 'instant' as ScrollBehavior });
    setTimeout(() => { isProgrammaticScroll.current = false; }, smooth ? 500 : 100);
  }, [stripDays.length]);

  useEffect(() => {
    if (hasScrolledInit.current) return;
    const idx = stripDays.findIndex(d => d.toDateString() === selectedDate.toDateString());
    if (idx >= 0 && stripRef.current) {
      hasScrolledInit.current = true;
      lastTickedIndexRef.current = idx;
      requestAnimationFrame(() => scrollToDateIndex(idx, false));
    }
  }, [stripDays, selectedDate, scrollToDateIndex]);

  const handleStripScroll = useCallback(() => {
    if (isProgrammaticScroll.current) return;
    const el = stripRef.current;
    if (!el || stripDays.length === 0) return;
    const cellW = el.scrollWidth / stripDays.length;
    const centerX = el.scrollLeft + el.clientWidth / 2;
    const idx = Math.round(centerX / cellW - 0.5);
    const clamped = Math.max(0, Math.min(idx, stripDays.length - 1));
    if (clamped !== lastTickedIndexRef.current) {
      lastTickedIndexRef.current = clamped;
      impactLight();
      setSelectedDate(stripDays[clamped]);
    }
  }, [stripDays]);

  const handleCalendarDateSelect = useCallback((d: Date) => {
    selectionChanged();
    setSelectedDate(d);
    const idx = stripDays.findIndex(sd => sd.toDateString() === d.toDateString());
    if (idx >= 0) scrollToDateIndex(idx, true);
  }, [stripDays, scrollToDateIndex]);

  const filteredTasks = useMemo(() => {
    const selectedDayStart = startOfDay(selectedDate);
    const viewingToday = isSameCalendarDay(selectedDate, new Date());

    let tasks = state.tasks.filter(t => {
      if (t.completed) return false;
      if (!t.dueDate) return true;
      const taskDay = startOfDay(new Date(t.dueDate));
      if (taskDay.getTime() === selectedDayStart.getTime()) return true;
      if (viewingToday && taskDay.getTime() < selectedDayStart.getTime()) return true;
      return false;
    });

    const isOverdueOnTodayList = (t: Task) =>
      !!t.dueDate && viewingToday && startOfDay(new Date(t.dueDate)) < selectedDayStart;

    const bucket = (t: Task) => {
      if (!t.dueDate) return 2;
      if (isOverdueOnTodayList(t)) return 0;
      return 1;
    };

    tasks = [...tasks].sort((a, b) => {
      const ba = bucket(a);
      const bb = bucket(b);
      if (ba !== bb) return ba - bb;
      if (ba === 0 && a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'skill') {
        const sA = state.skills.find(s => s.id === a.skillId);
        const sB = state.skills.find(s => s.id === b.skillId);
        return (sA?.name || '').localeCompare(sB?.name || '');
      }
      return 0;
    });

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

  const selectedDayStartForList = startOfDay(selectedDate);
  const viewingTodayForList = isSameCalendarDay(selectedDate, new Date());

  const activeSkills = useMemo(() => getActiveSkills(state.skills), [state.skills]);
  const maxStreak = useMemo(() => Math.max(0, ...activeSkills.map(s => s.streak || 0)), [activeSkills]);
  const todayStr = new Date().toDateString();
  const completedToday = activeSkills.some(s => s.lastSkillCompletedAt && new Date(s.lastSkillCompletedAt).toDateString() === todayStr);
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

        {/* Smooth Scrollable Day Strip — fixed center window, strip scrolls underneath */}
        <div className="relative rounded-xl shadow-sm border-2 border-border bg-surface p-1 min-h-[60px]">
          <div
            ref={stripRef}
            className="flex overflow-x-auto no-scrollbar"
            style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' as any }}
            onScroll={handleStripScroll}
          >
            {stripDays.map((date, i) => {
              const isToday = date.toDateString() === todayAnchor.toDateString();
              const dayStart = startOfDay(date);
              const todayStart = startOfDay(todayAnchor);
              const hasTask = state.tasks.some(t => {
                if (t.completed || !t.dueDate) return false;
                const td = startOfDay(new Date(t.dueDate));
                if (td.getTime() === dayStart.getTime()) return true;
                if (isToday && td.getTime() < todayStart.getTime()) return true;
                return false;
              });
              return (
                <div key={i} className="shrink-0" style={{ width: `${100 / VISIBLE_DAYS}%`, scrollSnapAlign: 'center' }}>
                  <button
                    onClick={() => {
                      selectionChanged();
                      setSelectedDate(date);
                      scrollToDateIndex(i, true);
                    }}
                    className="flex flex-col items-center justify-center w-full min-h-[56px] rounded-xl transition-colors border-2 border-transparent text-textPrimary touch-manipulation"
                  >
                    <span className="text-overline font-bold uppercase">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className={`text-body font-bold ${isToday ? 'text-interactive' : ''}`}>{date.getDate()}</span>
                    {hasTask && <div className="w-1 h-1 bg-interactive rounded-full mt-0.5"></div>}
                  </button>
                </div>
              );
            })}
          </div>
          {/* Fixed center window — only this is highlighted; strip scrolls underneath */}
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center p-1"
            aria-hidden
          >
            <div
              className="min-h-[56px] rounded-xl border-2 border-main bg-main/15 shadow-soft"
              style={{ width: `${100 / VISIBLE_DAYS}%` }}
            />
          </div>
        </div>
        {!dayStripHintSeen && (
          <div className="flex items-center justify-between gap-3 p-3 bg-interactive/15 border-2 border-interactive/30 rounded-xl mt-2">
            <p className="text-sm font-medium text-textPrimary flex-1">Swipe to change day</p>
            <button
              onClick={() => { impactLight(); markDayStripHintSeen(); }}
              className="text-sm font-semibold text-main shrink-0 px-3 py-1.5 rounded-lg active:bg-interactive/20 transition-colors"
            >
              Got it
            </button>
          </div>
        )}

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
            filteredTasks.map(task => {
              const isOverdueRollup =
                !!task.dueDate &&
                viewingTodayForList &&
                startOfDay(new Date(task.dueDate)) < selectedDayStartForList;
              return (
                <SwipeableTaskItem
                  key={task.id}
                  task={task}
                  skill={state.skills.find(s => s.id === task.skillId)}
                  isOverdueRollup={isOverdueRollup}
                  onDelete={() => {
                    if (task.recurrence) setRepeatChoice({ action: 'delete', task });
                    else onDeleteTask(task.id);
                  }}
                  onComplete={() => {
                    if (task.recurrence) setRepeatChoice({ action: 'complete', task });
                    else {
                      setPendingRecurrenceEnd(false);
                      setCompletingTask(task);
                    }
                  }}
                  onEdit={onEditTask}
                />
              );
            })
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

      <CompleteTaskModal
        isOpen={!!completingTask}
        taskTitle={completingTask?.title || ''}
        onClose={() => {
          setCompletingTask(null);
          setPendingRecurrenceEnd(false);
        }}
        onConfirm={(minutes, multiplier) => {
          if (completingTask) {
            onCompleteTask(completingTask.id, minutes, multiplier, {
              endRecurrence: pendingRecurrenceEnd,
            });
            markTaskHintSeen();
            setCompletingTask(null);
            setPendingRecurrenceEnd(false);
          }
        }}
      />
      <RepeatTaskChoiceModal
        isOpen={!!repeatChoice}
        taskTitle={repeatChoice?.task.title || ''}
        action={repeatChoice?.action || 'complete'}
        onClose={() => setRepeatChoice(null)}
        onChooseThisOccurrence={() => {
          const t = repeatChoice?.task;
          const act = repeatChoice?.action;
          if (!t || !act) return;
          setRepeatChoice(null);
          if (act === 'delete') {
            onSkipRepeatOccurrence(t.id);
            return;
          }
          setPendingRecurrenceEnd(false);
          setCompletingTask(t);
        }}
        onChooseForever={() => {
          const t = repeatChoice?.task;
          const act = repeatChoice?.action;
          if (!t || !act) return;
          setRepeatChoice(null);
          if (act === 'delete') {
            onDeleteTask(t.id);
            return;
          }
          setPendingRecurrenceEnd(true);
          setCompletingTask(t);
        }}
      />
      <MonthCalendarModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} selectedDate={selectedDate} onSelectDate={handleCalendarDateSelect} tasks={state.tasks} skills={state.skills} />
      <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} currentSort={sortBy} onSelectSort={(s) => { impactLight(); setSortBy(s); }} />
    </div>
  );
};

export default HomeScreen;