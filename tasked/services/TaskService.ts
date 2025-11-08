import { Task } from '../types/Task';
import { TaskStorage } from '../storage/TaskStorage';

/**
 * Business logic service for task operations
 * Handles task manipulation, sorting, and validation
 */
export class TaskService {
  constructor(private storage: TaskStorage) {}

  /**
   * Get all tasks, sorted with incomplete tasks first
   */
  async getAllTasks(): Promise<Task[]> {
    const tasks = await this.storage.loadTasks();
    return this.sortTasks(tasks);
  }

  /**
   * Add a new task
   */
  async addTask(title: string): Promise<Task> {
    if (!title || title.trim() === '') {
      throw new Error('Task title cannot be empty');
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      completed: false,
    };

    const allTasks = await this.storage.loadTasks();
    const updatedTasks = [newTask, ...allTasks];
    await this.storage.saveTasks(updatedTasks);

    return newTask;
  }

  /**
   * Toggle task completion status
   * Automatically sorts tasks after toggle
   */
  async toggleTask(id: string): Promise<Task[]> {
    const allTasks = await this.storage.loadTasks();
    const updatedTasks = allTasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );

    const sortedTasks = this.sortTasks(updatedTasks);
    await this.storage.saveTasks(sortedTasks);

    return sortedTasks;
  }

  /**
   * Edit a task's title
   */
  async editTask(id: string, newTitle: string): Promise<Task> {
    if (!newTitle || newTitle.trim() === '') {
      throw new Error('Task title cannot be empty');
    }

    const allTasks = await this.storage.loadTasks();
    const task = allTasks.find(t => t.id === id);

    if (!task) {
      throw new Error(`Task with id ${id} not found`);
    }

    const updatedTask: Task = {
      ...task,
      title: newTitle.trim(),
    };

    const updatedTasks = allTasks.map(t => (t.id === id ? updatedTask : t));
    await this.storage.saveTasks(updatedTasks);

    return updatedTask;
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<void> {
    const allTasks = await this.storage.loadTasks();
    const updatedTasks = allTasks.filter(task => task.id !== id);
    await this.storage.saveTasks(updatedTasks);
  }

  /**
   * Sort tasks: incomplete first, then completed
   */
  private sortTasks(tasks: Task[]): Task[] {
    const incompleteTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);
    return [...incompleteTasks, ...completedTasks];
  }
}

