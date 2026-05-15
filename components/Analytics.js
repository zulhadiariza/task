import { useMemo } from 'react';
import styles from './Analytics.module.css';
import { BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { subDays, format, isSameDay } from 'date-fns';

export default function Analytics({ tasks }) {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Done').length;
    const timeSpentTotal = tasks.reduce((acc, t) => acc + (t.timeSpent || 0), 0);
    const timeFormatted = `${Math.floor(timeSpentTotal / 3600)}h ${Math.floor((timeSpentTotal % 3600) / 60)}m`;

    return { total, completed, timeFormatted };
  }, [tasks]);

  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayTasks = tasks.filter(t => t.status === 'Done' && isSameDay(new Date(t.createdAt), date));
      data.push({
        name: format(date, 'EEE'),
        completed: dayTasks.length
      });
    }
    return data;
  }, [tasks]);

  return (
    <div className={`${styles.analyticsCard} glass-panel`}>
      <div className={styles.header}>
        <BarChart2 size={20} /> Activity & Insights
      </div>
      
      <div className={styles.statsGrid}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Total Tasks</span>
          <span className={styles.statValue}>{stats.total}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Completed</span>
          <span className={styles.statValue} style={{ color: 'var(--success-color)' }}>{stats.completed}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>Time Spent</span>
          <span className={styles.statValue} style={{ color: 'var(--warning-color)' }}>{stats.timeFormatted}</span>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis hide />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ background: 'var(--bg-color-secondary)', border: 'none', borderRadius: '8px', color: 'white' }} 
            />
            <Bar dataKey="completed" radius={[4, 4, 4, 4]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.completed > 0 ? 'var(--primary-color)' : 'var(--border-color)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
