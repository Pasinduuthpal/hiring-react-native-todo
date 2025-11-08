import { useState, useEffect, useCallback } from 'react';
import { Task } from '../types/Task';
import { TaskService } from '../services/TaskService';

/**
 * Custom hook for managing tasks
 * Encapsulates all task-related state and operations
 */
export function useTasks(taskService: TaskService) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load tasks on mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setIsLoading(true);
        const loadedTasks = await taskService.getAllTasks();
        setTasks(loadedTasks);
        setError(null);
      } catch (e) {
        const error = e instanceof Error ? e : new Error('Failed to load tasks');
        setError(error);
        console.error('Error loading tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [taskService]);

  const addTask = useCallback(
    async (title: string) => {
      try {
        const newTask = await taskService.addTask(title);
        setTasks(prevTasks => [newTask, ...prevTasks]);
        setError(null);
        return newTask;
      } catch (e) {
        const error = e instanceof Error ? e : new Error('Failed to add task');
        setError(error);
        throw error;
      }
    },
    [taskService]
  );

  const toggleTask = useCallback(
    async (id: string) => {
      try {
        const updatedTasks = await taskService.toggleTask(id);
        setTasks(updatedTasks);
        setError(null);
      } catch (e) {
        const error = e instanceof Error ? e : new Error('Failed to toggle task');
        setError(error);
        throw error;
      }
    },
    [taskService]
  );

  const editTask = useCallback(
    async (id: string, newTitle: string) => {
      try {
        await taskService.editTask(id, newTitle);
        setTasks(prevTasks =>
          prevTasks.map(task => (task.id === id ? { ...task, title: newTitle.trim() } : task))
        );
        setError(null);
      } catch (e) {
        const error = e instanceof Error ? e : new Error('Failed to edit task');
        setError(error);
        throw error;
      }
    },
    [taskService]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      try {
        await taskService.deleteTask(id);
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
        setError(null);
      } catch (e) {
        const error = e instanceof Error ? e : new Error('Failed to delete task');
        setError(error);
        throw error;
      }
    },
    [taskService]
  );

  return {
    tasks,
    isLoading,
    error,
    addTask,
    toggleTask,
    editTask,
    deleteTask,
  };
}

