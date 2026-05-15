'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import TaskList from '@/components/TaskList';
import CalendarWidget from '@/components/CalendarWidget';
import Timer from '@/components/Timer';
import Analytics from '@/components/Analytics';

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [errorMsg, setErrorMsg] = useState(null);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const json = await res.json();
      if (json.success) {
        setTasks(json.data);
        setErrorMsg(null);
      } else {
        setErrorMsg(json.error || 'Failed to load tasks.');
      }
    } catch (error) {
      console.error('Failed to fetch tasks', error);
      setErrorMsg('Network error or API is down.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <main className={`${styles.dashboard} animate-fade-in`}>
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>TaskMaster Pro</h1>
            <p className={styles.subtitle}>Organize your day, achieve your goals.</p>
          </div>
        </header>

        <Analytics tasks={tasks} />
        
        {errorMsg ? (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)', padding: '1rem', borderRadius: '8px', color: 'var(--danger-color)' }}>
            <strong>Database Error:</strong> {errorMsg}
            <br/><br/>
            Sepertinya koneksi MongoDB Anda belum berhasil. Silakan cek file .env Anda!
          </div>
        ) : (
          <TaskList tasks={tasks} refreshTasks={fetchTasks} loading={loading} />
        )}
      </div>

      <aside className={styles.sidebar}>
        <Timer tasks={tasks} refreshTasks={fetchTasks} />
        <CalendarWidget tasks={tasks} />
      </aside>
    </main>
  );
}
