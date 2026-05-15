import { useState } from 'react';
import styles from './TaskList.module.css';
import { Plus, Edit2, Trash2, Clock, Tag, CheckSquare, X } from 'lucide-react';
import { format } from 'date-fns';

export default function TaskList({ tasks, refreshTasks, loading }) {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const confirmDelete = async () => {
    if (taskToDelete) {
      await fetch(`/api/tasks/${taskToDelete}`, { method: 'DELETE' });
      refreshTasks();
      setTaskToDelete(null);
    }
  };

  const handleDeleteClick = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setTaskToDelete(id);
  };

  const openEdit = (e, task) => {
    e.preventDefault();
    e.stopPropagation();
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
                  <button className={styles.iconButton} onClick={(e) => openEdit(e, task)}><Edit2 size={16} /></button>
                  <button className={`${styles.iconButton} ${styles.delete}`} onClick={(e) => handleDeleteClick(e, task._id)}><Trash2 size={16} /></button>
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
                {task.subtasks && task.subtasks.length > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                    <CheckSquare size={14} /> 
                    {task.subtasks.filter(st => st.isCompleted).length}/{task.subtasks.length}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {taskToDelete && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} glass-panel`} style={{ maxWidth: '350px', textAlign: 'center', padding: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Delete Task?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>This action cannot be undone.</p>
            <div className={styles.modalActions} style={{ justifyContent: 'center', gap: '1rem' }}>
              <button className={styles.cancelButton} onClick={() => setTaskToDelete(null)}>Cancel</button>
              <button className={styles.addButton} style={{ background: 'var(--danger-color)' }} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

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
    title: '', description: '', category: 'Work', priority: 'Medium', status: 'Todo', deadline: '', subtasks: []
  });
  const [newSubtask, setNewSubtask] = useState('');

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

  const addSubtask = () => {
    if (newSubtask.trim() === '') return;
    setFormData({
      ...formData,
      subtasks: [...(formData.subtasks || []), { title: newSubtask, isCompleted: false }]
    });
    setNewSubtask('');
  };

  const removeSubtask = (index) => {
    const updated = [...formData.subtasks];
    updated.splice(index, 1);
    setFormData({ ...formData, subtasks: updated });
  };

  const toggleSubtask = (index) => {
    const updated = [...formData.subtasks];
    updated[index].isCompleted = !updated[index].isCompleted;
    setFormData({ ...formData, subtasks: updated });
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

        <div className={styles.formGroup}>
          <label>Subtasks</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input 
              className={styles.input} 
              style={{ flex: 1 }}
              placeholder="Add a smaller step..." 
              value={newSubtask} 
              onChange={e => setNewSubtask(e.target.value)} 
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSubtask(); } }}
            />
            <button type="button" onClick={addSubtask} className={styles.addButton} style={{ padding: '0.5rem' }}><Plus size={18} /></button>
          </div>
          {formData.subtasks && formData.subtasks.map((st, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px', marginBottom: '0.25rem' }}>
              <input type="checkbox" checked={st.isCompleted} onChange={() => toggleSubtask(i)} />
              <span style={{ flex: 1, textDecoration: st.isCompleted ? 'line-through' : 'none', color: st.isCompleted ? 'var(--text-muted)' : 'inherit' }}>{st.title}</span>
              <button type="button" onClick={() => removeSubtask(i)} style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }}><X size={14} /></button>
            </div>
          ))}
        </div>

        <div className={styles.modalActions}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>Cancel</button>
          <button type="submit" className={styles.addButton}>{task ? 'Save Changes' : 'Create Task'}</button>
        </div>
      </form>
    </div>
  );
}
