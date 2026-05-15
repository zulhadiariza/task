'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import TaskList from '@/components/TaskList';
import Timer from '@/components/Timer';
import CalendarWidget from '@/components/CalendarWidget';
import Analytics from '@/components/Analytics';
import KanbanBoard from '@/components/KanbanBoard';
import { LogOut, Search, Filter, LayoutList, LayoutGrid } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchTasks();
    }
  }, [status, router]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
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



  if (status === 'loading') {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Loading...</div>;
  }

  if (!session) {
    return null; // Will redirect
  }

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <main className={`${styles.dashboard} animate-fade-in`}>
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>TaskMaster Pro</h1>
            <p className={styles.subtitle}>Organize your day, achieve your goals.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Hi, <strong>{session.user?.name}</strong></span>
            <button onClick={() => signOut()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger-color)', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>

        <Analytics tasks={tasks} />
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '-1rem', marginTop: '1rem' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select 
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
            >
              <option value="All">All Status</option>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: '8px' }}>
            <button 
              onClick={() => setViewMode('list')}
              style={{ background: viewMode === 'list' ? 'var(--primary-color)' : 'transparent', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex' }}
              title="List View"
            >
              <LayoutList size={18} />
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              style={{ background: viewMode === 'kanban' ? 'var(--primary-color)' : 'transparent', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex' }}
              title="Kanban View"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>

        {errorMsg ? (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger-color)', padding: '1rem', borderRadius: '8px', color: 'var(--danger-color)' }}>
            <strong>Database Error:</strong> {errorMsg}
            <br/><br/>
            Sepertinya koneksi MongoDB Anda belum berhasil. Silakan cek file .env Anda!
          </div>
        ) : (
          viewMode === 'list' ? (
            <TaskList tasks={filteredTasks} refreshTasks={fetchTasks} loading={loading} />
          ) : (
            <KanbanBoard tasks={filteredTasks} refreshTasks={fetchTasks} loading={loading} />
          )
        )}
      </div>

      <aside className={styles.sidebar}>
        <Timer tasks={tasks} refreshTasks={fetchTasks} />
        <CalendarWidget tasks={tasks} />
      </aside>
    </main>
  );
}
