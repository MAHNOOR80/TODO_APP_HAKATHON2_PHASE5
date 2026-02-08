import { api } from './api';

/**
 * Tasks API Client
 * Functions for task CRUD operations
 */

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  category: string | null;
  dueDate: string | null;
  recurrencePattern: string | null;
  reminderEnabled: boolean;
  reminderOffsetMinutes: number | null;
  createdAt: string;
  updatedAt: string;
  isOverdue?: boolean;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  category?: string;
  dueDate?: string | null;
  recurrencePattern?: string | null;
  reminderEnabled?: boolean;
  reminderOffsetMinutes?: number | null;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string | null;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  category?: string | null;
  dueDate?: string | null;
  recurrencePattern?: string | null;
  reminderEnabled?: boolean;
  reminderOffsetMinutes?: number | null;
}

export interface TaskFilters {
  search?: string;
  completed?: boolean;
  priority?: string;
  tag?: string;
  sort?: string;
  order?: string;
}

/**
 * Get all tasks with optional filters
 */
export async function getAllTasks(filters?: TaskFilters): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.completed !== undefined) params.append('completed', String(filters.completed));
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.tag) params.append('tag', filters.tag);
  if (filters?.sort) params.append('sort', filters.sort);
  if (filters?.order) params.append('order', filters.order);

  const query = params.toString();
  return api.get<Task[]>(`/tasks${query ? `?${query}` : ''}`);
}

/**
 * Create a new task
 */
export async function createTask(data: CreateTaskRequest): Promise<Task> {
  return api.post<Task>('/tasks', data);
}

/**
 * Get task by ID
 */
export async function getTask(id: string): Promise<Task> {
  return api.get<Task>(`/tasks/${id}`);
}

/**
 * Update task
 */
export async function updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
  return api.put<Task>(`/tasks/${id}`, data);
}

/**
 * Delete task
 */
export async function deleteTask(id: string): Promise<void> {
  await api.delete<void>(`/tasks/${id}`);
}

/**
 * Mark task as complete
 */
export async function markComplete(id: string): Promise<Task> {
  return api.patch<Task>(`/tasks/${id}/complete`);
}

/**
 * Mark task as incomplete
 */
export async function markIncomplete(id: string): Promise<Task> {
  return api.patch<Task>(`/tasks/${id}/incomplete`);
}
