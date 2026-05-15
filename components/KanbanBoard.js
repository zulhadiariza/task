'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import styles from './KanbanBoard.module.css';
import { Clock, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';

const COLUMNS = ['Todo', 'In Progress', 'Done'];

export default function KanbanBoard({ tasks, refreshTasks, loading }) {
  const [boardData, setBoardData] = useState({
    'Todo': [],
    'In Progress': [],
    'Done': []
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Keep local state in sync with props
  useEffect(() => {
    if (tasks) {
      const newBoard = { 'Todo': [], 'In Progress': [], 'Done': [] };
      tasks.forEach(task => {
        if (newBoard[task.status]) {
          newBoard[task.status].push(task);
        } else {
          // Fallback if status is weird
          newBoard['Todo'].push(task);
        }
      });
      setBoardData(newBoard);
    }
  }, [tasks]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside the list
    if (!destination) return;

    // Dropped in the same place
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColumn = source.droppableId;
    const destColumn = destination.droppableId;

    // Optimistically update local state
    const newBoardData = { ...boardData };
    const sourceTasks = Array.from(newBoardData[sourceColumn]);
    const destTasks = sourceColumn === destColumn ? sourceTasks : Array.from(newBoardData[destColumn]);
    
    const [movedTask] = sourceTasks.splice(source.index, 1);
    // Update the task's status for optimistic UI render
    movedTask.status = destColumn;
    destTasks.splice(destination.index, 0, movedTask);

    newBoardData[sourceColumn] = sourceTasks;
    if (sourceColumn !== destColumn) {
      newBoardData[destColumn] = destTasks;
    }

    setBoardData(newBoardData);

    // Call API to update the task status if the column changed
    if (sourceColumn !== destColumn) {
      try {
        await fetch(`/api/tasks/${draggableId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: destColumn })
        });
        refreshTasks();
      } catch (error) {
        console.error("Failed to update task status", error);
        // If it fails, refreshTasks will reset it to correct state eventually
        refreshTasks(); 
      }
    }
  };

  if (!isMounted) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading board...</div>;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={styles.kanbanBoard} style={{ opacity: loading ? 0.5 : 1, pointerEvents: loading ? 'none' : 'auto', transition: 'opacity 0.2s' }}>
        {COLUMNS.map(columnId => (
          <div key={columnId} className={`${styles.column} glass-panel`}>
            <div className={styles.columnHeader}>
              <span>{columnId}</span>
              <span className={styles.taskCount}>{boardData[columnId].length}</span>
            </div>
            
            <Droppable droppableId={columnId}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={styles.droppableArea}
                  style={{
                    backgroundColor: snapshot.isDraggingOver ? 'rgba(255,255,255,0.05)' : 'transparent',
                    borderRadius: '8px'
                  }}
                >
                  {boardData[columnId].map((task, index) => (
                    <Draggable key={task._id} draggableId={task._id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`${styles.taskCard} ${snapshot.isDragging ? styles.isDragging : ''}`}
                          style={{
                            ...provided.draggableProps.style
                          }}
                        >
                          <div className={styles.taskTitle}>{task.title}</div>
                          {task.description && (
                            <div className={styles.taskDesc}>{task.description}</div>
                          )}
                          <div className={styles.taskFooter}>
                            <div className={styles.badges}>
                              <span className={`${styles.badge} ${styles['priority' + task.priority]}`}>
                                {task.priority}
                              </span>
                              {task.category && (
                                <span className={`${styles.badge} ${styles.categoryBadge}`}>
                                  {task.category}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {(task.deadline || (task.subtasks && task.subtasks.length > 0)) && (
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {task.deadline && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Clock size={12} /> {format(new Date(task.deadline), 'MMM d')}
                                </span>
                              )}
                              {task.subtasks && task.subtasks.length > 0 && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <CheckSquare size={12} /> 
                                  {task.subtasks.filter(st => st.isCompleted).length}/{task.subtasks.length}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
