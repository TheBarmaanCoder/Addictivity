import React, { useState, useMemo } from 'react';
import { AppState, Skill, Task } from '../types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
}

type TimeScale = 'Day' | 'Month' | 'Year';

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, state }) => {
  const [scale, setScale] = useState<TimeScale>('Day');

  const chartData = useMemo(() => {
    const completedTasks = state.tasks
      .filter(t => t.completed && t.completedAt)
      .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime());

    if (completedTasks.length === 0) return [];

    const firstTaskDate = new Date(completedTasks[0].completedAt!);
    const lastTaskDate = new Date();
    const data: any[] = [];

    // Map skill IDs to current running totals
    const runningTotals: Record<string, number> = {};
    state.skills.forEach(s => { runningTotals[s.id] = 0; });

    if (scale === 'Day') {
      // Last 30 days or since beginning
      const start = new Date();
      start.setDate(start.getDate() - 30);
      const effectiveStart = firstTaskDate > start ? firstTaskDate : start;
      
      for (let d = new Date(effectiveStart); d <= lastTaskDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toDateString();
        const dayTasks = completedTasks.filter(t => new Date(t.completedAt!).toDateString() === dateStr);
        
        dayTasks.forEach(t => {
          runningTotals[t.skillId] += (t.minutesSpent || 0);
        });

        const entry: any = { name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
        state.skills.forEach(s => {
          entry[s.name] = parseFloat((runningTotals[s.id] / 60).toFixed(2));
        });
        data.push(entry);
      }
    } else if (scale === 'Month') {
      // Current year month by month
      const currentYear = new Date().getFullYear();
      for (let m = 0; m < 12; m++) {
        const monthTasks = completedTasks.filter(t => {
          const d = new Date(t.completedAt!);
          return d.getFullYear() === currentYear && d.getMonth() === m;
        });

        monthTasks.forEach(t => {
          runningTotals[t.skillId] += (t.minutesSpent || 0);
        });

        const entry: any = { name: new Date(currentYear, m).toLocaleDateString('en-US', { month: 'short' }) };
        state.skills.forEach(s => {
          entry[s.name] = parseFloat((runningTotals[s.id] / 60).toFixed(2));
        });
        data.push(entry);
      }
    } else {
      // Last 5 years
      const currentYear = new Date().getFullYear();
      for (let y = currentYear - 4; y <= currentYear; y++) {
        const yearTasks = completedTasks.filter(t => new Date(t.completedAt!).getFullYear() === y);
        
        yearTasks.forEach(t => {
          runningTotals[t.skillId] += (t.minutesSpent || 0);
        });

        const entry: any = { name: y.toString() };
        state.skills.forEach(s => {
          entry[s.name] = parseFloat((runningTotals[s.id] / 60).toFixed(2));
        });
        data.push(entry);
      }
    }

    return data;
  }, [state.tasks, state.skills, scale]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-surface w-full max-w-4xl h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-soft overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-300">
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-1 sm:hidden" />
        {/* Header */}
        <div className="px-6 py-5 border-b-2 border-border flex items-center justify-between bg-surface sticky top-0 z-10">
          <div>
            <h3 className="text-lg font-semibold text-main">Growth Journey</h3>
            <p className="text-[11px] font-medium text-subtitle uppercase tracking-wider mt-0.5">Cumulative Hours per Skill</p>
          </div>
          
          <div className="flex bg-border p-1 rounded-xl">
            {(['Day', 'Month', 'Year'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScale(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  scale === s ? 'bg-surface text-main shadow-card' : 'text-subtitle'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button onClick={onClose} className="size-10 rounded-full active:bg-border flex items-center justify-center text-subtitle transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Chart Content */}
        <div className="flex-1 p-4 md:p-8">
          {chartData.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-subtitle gap-4">
              <span className="material-symbols-outlined text-5xl">trending_up</span>
              <p className="text-sm font-medium text-center">Complete tasks to see your growth over time.</p>
            </div>
          ) : (
            <div className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: 'var(--subtitle)', fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: 'var(--subtitle)', fontWeight: 600 }}
                    tickFormatter={(val) => `${val}h`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      padding: '12px'
                    }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  {state.skills.map(skill => (
                    <Line
                      key={skill.id}
                      type="monotone"
                      dataKey={skill.name}
                      stroke={skill.color}
                      strokeWidth={3}
                      dot={{ r: 0 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      animationDuration={1500}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-8 py-4 bg-background border-t-2 border-border">
           <p className="text-[10px] text-center text-subtitle font-bold uppercase tracking-widest">
             Visualize your consistency and see how far you've come.
           </p>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;