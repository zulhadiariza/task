import { useState, useEffect } from 'react';
import styles from './Timer.module.css';
import { Play, Pause, Square, Timer as TimerIcon } from 'lucide-react';

export default function Timer({ tasks, refreshTasks }) {
  const [activeTaskId, setActiveTaskId] = useState('');
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => setTime(t => t + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStop = async () => {
    setIsRunning(false);
    if (activeTaskId && time > 0) {
      const task = tasks.find(t => t._id === activeTaskId);
      if (task) {
        await fetch(`/api/tasks/${activeTaskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timeSpent: (task.timeSpent || 0) + time })
        });
        refreshTasks();
      }
    }
    setTime(0);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`${styles.timerCard} glass-panel`}>
      <div className={styles.header}>
        <TimerIcon size={20} /> Focus Timer
      </div>
      
      <select 
        className={styles.taskSelect} 
        value={activeTaskId} 
        onChange={(e) => setActiveTaskId(e.target.value)}
        disabled={isRunning}
      >
        <option value="">Select a task to track</option>
        {tasks.filter(t => t.status !== 'Done').map(task => (
          <option key={task._id} value={task._id}>{task.title}</option>
        ))}
      </select>

      <div className={styles.display}>
        {formatTime(time)}
      </div>

      <div className={styles.controls}>
        <button 
          className={`${styles.controlBtn} ${isRunning ? '' : styles.playBtn}`} 
          onClick={() => setIsRunning(!isRunning)}
          disabled={!activeTaskId && !isRunning}
        >
          {isRunning ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button 
          className={styles.controlBtn} 
          onClick={handleStop}
          disabled={time === 0}
        >
          <Square size={18} fill="currentColor" />
        </button>
      </div>
    </div>
  );
}
