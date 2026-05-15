import { useState } from 'react';
import styles from './TaskList.module.css';
import { Plus, Edit2, Trash2, Clock, Tag } from 'lucide-react';
import { format } from 'date-fns';

export default function TaskList({ tasks, refreshTasks, loading }) {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      refreshTasks();
    }
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Your Tasks</h2>
        <button className={styles.addButton} onClick={() => { setEditingTask(null); setShowForm(true); }}>
          <Plus size={18} /> New Task
        </button>
      </div>

      <div className={styles.taskList}>
        {loading ? (
          <div className={styles.emptyState}>Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className={styles.emptyState}>No tasks yet. Create one to get started!</div>
        ) : (
          tasks.map(task => (
            <div key={task._id} className={`${styles.taskItem} glass-panel`}>
              <div className={styles.taskHeader}>
                <div>
                  <div className={styles.taskTitle}>{task.title}</div>
                  {task.description && <div className={styles.taskDesc}>{task.description}</div>}
                </div>
                <div className={styles.taskActions}>
                  <button className={styles.iconButton} onClick={() => openEdit(task)}><Edit2 size={16} /></button>
                  <button className={`${styles.iconButton} ${styles.delete}`} onClick={() => handleDelete(task._id)}><Trash2 size={16} /></button>
                </div>
              </div>
              <div className={styles.taskMeta}>
                <span className={`${styles.badge} ${styles['status' + task.status.replace(' ', '')]}`}>
                  {task.status}
                </span>
                <span className={`${styles.badge} ${styles['priority' + task.priority]}`}>
                  {task.priority} Priority
                </span>
                <span className={styles.badge} style={{ background: 'rgba(255,255,255,0.1)' }}>
                  {task.category}
                </span>
                {task.deadline && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                    <Clock size={14} /> {format(new Date(task.deadline), 'MMM d, yyyy')}
                  </span>
                )}
                {task.timeSpent > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                    ⏱️ {Math.floor(task.timeSpent / 60)}m {task.timeSpent % 60}s
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <TaskForm 
          task={editingTask} 
          onClose={() => setShowForm(false)} 
          refreshTasks={refreshTasks} 
        />
      )}
    </div>
  );
}

function TaskForm({ task, onClose, refreshTasks }) {
  const [formData, setFormData] = useState(task || {
    title: '', description: '', category: 'Work', priority: 'Medium', status: 'Todo', deadline: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = task ? 'PUT' : 'POST';
    const url = task ? `/api/tasks/${task._id}` : '/api/tasks';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    refreshTasks();
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <form className={`${styles.modal} glass-panel`} onSubmit={handleSubmit}>
        <h3>{task ? 'Edit Task' : 'New Task'}</h3>
        
        <div className={styles.formGroup}>
          <label>Title</label>
          <input required className={styles.input} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
        </div>
        
        <div className={styles.formGroup}>
          <label>Description</label>
          <textarea className={styles.input} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className={styles.formGroup}>
            <label>Category</label>
            <input className={styles.input} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
          </div>
          <div className={styles.formGroup}>
            <label>Priority</label>
            <select className={styles.input} value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className={styles.formGroup}>
            <label>Status</label>
            <select className={styles.input} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Deadline</label>
            <input type="date" className={styles.input} value={formData.deadline ? formData.deadline.substring(0,10) : ''} onChange={e => setFormData({...formData, deadline: e.target.value})} />
          </div>
        </div>

        <div className={styles.modalActions}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>Cancel</button>
          <button type="submit" className={styles.addButton}>{task ? 'Save Changes' : 'Create Task'}</button>
        </div>
      </form>
    </div>
  );
}
