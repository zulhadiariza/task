import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './CalendarWidget.module.css';
import { CalendarDays } from 'lucide-react';
import { isSameDay } from 'date-fns';

export default function CalendarWidget({ tasks }) {
  const [date, setDate] = useState(new Date());

  const hasDeadline = (date) => {
    return tasks.some(task => {
      if (!task.deadline || task.status === 'Done') return false;
      return isSameDay(new Date(task.deadline), date);
    });
  };

  return (
    <div className={`${styles.calendarCard} glass-panel`}>
      <div className={styles.header}>
        <CalendarDays size={20} /> Deadlines
      </div>
      <div className={styles.calendarWrapper}>
        <Calendar 
          onChange={setDate} 
          value={date} 
          tileContent={({ date, view }) => 
            view === 'month' && hasDeadline(date) ? <div className={styles.deadlineDot} /> : null
          }
        />
      </div>
    </div>
  );
}
