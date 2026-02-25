import React, { useState, useEffect } from 'react';
import { AppState, Task } from '../types';
import Logo from '../components/Logo';
import { impactMedium } from '../lib/haptics';

interface AddTaskScreenProps {
  skills: AppState['skills'];
  initialTask?: Task | null;
  onAddTask: (task: any) => void;
  onUpdateTask?: (taskId: string, taskData: Omit<Task, 'id' | 'completed'>) => void;
  onCancel: () => void;
}

const todayYYYYMMDD = () => {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};

const isoToYYYYMMDD = (iso: string | null): string => {
  if (!iso) return todayYYYYMMDD();
  const d = new Date(iso);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};

const AddTaskScreen: React.FC<AddTaskScreenProps> = ({ skills, initialTask, onAddTask, onUpdateTask, onCancel }) => {
  const [title, setTitle] = useState(initialTask?.title ?? '');
  const [dueDate, setDueDate] = useState(initialTask ? isoToYYYYMMDD(initialTask.dueDate) : todayYYYYMMDD());
  const [skillId, setSkillId] = useState(initialTask?.skillId ?? skills[0]?.id ?? '');
  const [recurrenceNum, setRecurrenceNum] = useState(initialTask?.recurrence?.value ?? 1);
  const [recurrenceUnit, setRecurrenceUnit] = useState<'Days' | 'Weeks' | 'Months'>(initialTask?.recurrence?.unit ?? 'Days');
  const [enableRecurrence, setEnableRecurrence] = useState(!!initialTask?.recurrence);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDueDate(isoToYYYYMMDD(initialTask.dueDate));
      setSkillId(initialTask.skillId);
      setRecurrenceNum(initialTask.recurrence?.value ?? 1);
      setRecurrenceUnit(initialTask.recurrence?.unit ?? 'Days');
      setEnableRecurrence(!!initialTask.recurrence);
    }
  }, [initialTask]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    impactMedium();
    let isoDate = null;
    if (dueDate) {
      const [year, month, day] = dueDate.split('-').map(Number);
      const localDate = new Date(year, month - 1, day);
      isoDate = localDate.toISOString();
    }
    const taskData = {
      title: title.trim(),
      dueDate: isoDate,
      skillId,
      recurrence: enableRecurrence ? { value: recurrenceNum, unit: recurrenceUnit } : null,
    };
    if (initialTask && onUpdateTask) {
      onUpdateTask(initialTask.id, taskData);
    } else {
      onAddTask(taskData);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-off-white pb-32">
       <header className="relative w-full max-w-4xl mx-auto px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-4 pr-14 flex items-center gap-3">
        <button onClick={onCancel} className="size-11 flex items-center justify-center text-forest-green rounded-full active:bg-slate-100 transition-colors shrink-0">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h1 className="text-display font-bold text-forest-green flex-1 min-w-0">{initialTask ? 'Edit Task' : 'Add New Task'}</h1>
        <div className="absolute top-[max(1rem,env(safe-area-inset-top))] right-6 w-10 h-10 flex items-center justify-center">
          <Logo className="w-10 h-10 text-forest-green opacity-80" />
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full px-6 max-w-4xl mx-auto gap-8 mt-4">
        <div className="w-full">
          <label className="block text-overline font-semibold text-txt-secondary uppercase tracking-wide mb-2 ml-1" htmlFor="task-title">Task title</label>
          <div className="w-full h-16 relative">
            <input 
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-full bg-surface border border-txt-secondary/20 rounded-xl px-5 text-[17px] placeholder:text-txt-secondary focus:outline-none focus:border-forest-green focus:ring-2 focus:ring-forest-green/10 transition-all"
              placeholder="What do you need to do?"
              type="text"
            />
          </div>
        </div>

        <div className="w-full">
          <label className="block text-xs font-semibold text-txt-secondary uppercase tracking-wide mb-2 ml-1" htmlFor="due-date">Due date</label>
          <div className="w-full h-16 relative bg-surface border border-txt-secondary/20 rounded-xl flex items-center px-5 group focus-within:border-forest-green focus-within:ring-2 focus-within:ring-forest-green/10 transition-all">
            <input 
              id="due-date" 
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full h-full bg-transparent border-none focus:ring-0 text-lg text-txt-secondary placeholder-transparent outline-none"
            />
             <span className="material-symbols-outlined text-warm-orange text-2xl absolute right-4 pointer-events-none">calendar_today</span>
          </div>
        </div>

        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-txt-secondary uppercase tracking-wide ml-1">Recurrence</label>
            <div 
              onClick={() => setEnableRecurrence(!enableRecurrence)}
              className={`w-[51px] h-[31px] rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${enableRecurrence ? 'bg-forest-green' : 'bg-slate-300'}`}
            >
              <div className={`w-[27px] h-[27px] bg-surface rounded-full shadow-sm transition-transform ${enableRecurrence ? 'translate-x-5' : ''}`}></div>
            </div>
          </div>
          
          <div className={`flex gap-4 transition-opacity duration-200 ${enableRecurrence ? 'opacity-100 pointer-events-auto' : 'opacity-40 pointer-events-none'}`}>
            <div className="w-1/3 h-16 relative">
              <input 
                type="number" 
                min="1" 
                value={recurrenceNum}
                onChange={(e) => setRecurrenceNum(parseInt(e.target.value))}
                className="w-full h-full bg-surface border border-txt-secondary/20 rounded-xl px-5 text-lg text-center font-semibold focus:outline-none focus:border-forest-green focus:ring-2 focus:ring-forest-green/10 transition-all"
              />
            </div>
            <div className="w-2/3 h-16 relative">
              <div className="relative w-full h-full">
                <select 
                  value={recurrenceUnit}
                  onChange={(e) => setRecurrenceUnit(e.target.value as any)}
                  className="w-full h-full bg-surface border border-txt-secondary/20 rounded-xl px-5 text-lg appearance-none focus:outline-none focus:border-forest-green focus:ring-2 focus:ring-forest-green/10 transition-all cursor-pointer pr-12"
                >
                  <option value="Days">Days</option>
                  <option value="Weeks">Weeks</option>
                  <option value="Months">Months</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <span className="material-symbols-outlined text-forest-green">expand_more</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full">
          <label className="block text-xs font-semibold text-txt-secondary uppercase tracking-wide mb-2 ml-1">Skill attribute</label>
          <div className="grid grid-cols-3 gap-3">
            {skills.map(skill => (
              <button 
                key={skill.id}
                onClick={() => setSkillId(skill.id)}
                className={`aspect-[2/1] min-h-[50px] border rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-[0.97] ${
                  skillId === skill.id 
                    ? 'bg-forest-green border-forest-green text-white shadow-soft' 
                    : 'bg-surface border-txt-secondary/20 text-txt-secondary active:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-xl">{skill.icon}</span>
                <span className="text-xs font-bold truncate px-1">{skill.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <button 
            onClick={handleSubmit}
            className="w-full bg-forest-green text-white text-lg font-semibold py-4 rounded-xl active:opacity-80 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined font-bold">{initialTask ? 'save' : 'add'}</span>
            {initialTask ? 'SAVE CHANGES' : 'ADD TASK'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default AddTaskScreen;