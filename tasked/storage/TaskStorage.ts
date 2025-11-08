import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types/Task';

const TASKS_STORAGE_KEY = '@tasked_tasks';

/**
 * Storage abstraction for task persistence
 * Handles all AsyncStorage operations
 */
export class TaskStorage {
  /**
   * Load all tasks from storage
   */
  async loadTasks(): Promise<Task[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (jsonValue != null) {
        return JSON.parse(jsonValue) as Task[];
      }
      return [];
    } catch (e) {
      console.error('Failed to load tasks from storage', e);
      throw new Error('Failed to load tasks from storage');
    }
  }

  /**
   * Save all tasks to storage
   */
  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(tasks);
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error('Failed to save tasks to storage', e);
      throw new Error('Failed to save tasks to storage');
    }
  }
}

