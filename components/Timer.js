'use client';

import { useState, useEffect } from 'react';
import styles from './Timer.module.css';
import { Play, Pause, Square, Timer as TimerIcon } from 'lucide-react';

const POMODORO_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

export default function Timer({ tasks, refreshTasks }) {
  const [activeTaskId, setActiveTaskId] = useState('');
  const [mode, setMode] = useState('stopwatch'); // 'stopwatch', 'pomodoro', 'break'
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prev => {
          if (mode === 'stopwatch') {
            return prev + 1;
          } else {
            if (prev <= 1) {
              clearInterval(interval);
              setIsRunning(false);
              playBeep();
              handleSessionComplete();
              return 0;
            }
            return prev - 1;
          }
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, mode]);

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      setTimeout(() => {
        osc.stop();
        ctx.close();
      }, 500);
    } catch (e) {
      console.log('Audio not supported', e);
    }
  };

  const handleSessionComplete = async () => {
    if (mode === 'pomodoro' && activeTaskId) {
      await saveTime(POMODORO_TIME);
    }
  };

  const saveTime = async (timeToSave) => {
    if (!activeTaskId || timeToSave <= 0) return;
    const task = tasks.find(t => t._id === activeTaskId);
    if (task) {
      try {
        await fetch(`/api/tasks/${activeTaskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timeSpent: (task.timeSpent || 0) + timeToSave })
        });
        refreshTasks();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleStop = async () => {
    setIsRunning(false);
    
    let elapsed = 0;
    if (mode === 'stopwatch') {
      elapsed = seconds;
    } else if (mode === 'pomodoro') {
      elapsed = POMODORO_TIME - seconds;
    }

    if (elapsed > 0 && activeTaskId) {
      await saveTime(elapsed);
    }

    resetTimer(mode);
  };

  const resetTimer = (newMode) => {
    setMode(newMode);
    setIsRunning(false);
    if (newMode === 'stopwatch') setSeconds(0);
    else if (newMode === 'pomodoro') setSeconds(POMODORO_TIME);
    else if (newMode === 'break') setSeconds(BREAK_TIME);
  };

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`${styles.timerCard} glass-panel`}>
      <div className={styles.header}>
        <TimerIcon size={20} /> Focus Timer
      </div>
      
      <div className={styles.modeTabs}>
        <button 
          onClick={() => resetTimer('stopwatch')} 
          className={`${styles.modeTab} ${mode === 'stopwatch' ? styles.active : ''}`}
        >
          Stopwatch
        </button>
        <button 
          onClick={() => resetTimer('pomodoro')} 
          className={`${styles.modeTab} ${mode === 'pomodoro' ? styles.active : ''}`}
        >
          Pomodoro
        </button>
        <button 
          onClick={() => resetTimer('break')} 
          className={`${styles.modeTab} ${mode === 'break' ? styles.active : ''}`}
        >
          Break
        </button>
      </div>

      <select 
        className={styles.taskSelect} 
        value={activeTaskId} 
        onChange={(e) => setActiveTaskId(e.target.value)}
        disabled={isRunning || mode === 'break'}
      >
        <option value="">Select a task to track</option>
        {tasks.filter(t => t.status !== 'Done').map(task => (
          <option key={task._id} value={task._id}>{task.title}</option>
        ))}
      </select>

      <div className={styles.display}>
        {formatTime(seconds)}
      </div>

      <div className={styles.controls}>
        <button 
          className={`${styles.controlBtn} ${isRunning ? '' : styles.playBtn}`} 
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button 
          className={styles.controlBtn} 
          onClick={handleStop}
          disabled={
            (mode === 'stopwatch' && seconds === 0) || 
            (mode === 'pomodoro' && seconds === POMODORO_TIME) || 
            (mode === 'break' && seconds === BREAK_TIME)
          }
        >
          <Square size={18} fill="currentColor" />
        </button>
      </div>
    </div>
  );
}
