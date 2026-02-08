/**
 * Task TypeScript Types
 */

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: Priority;
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

export interface TaskFormData {
  title: string;
  description: string;
  priority: Priority;
  tags: string[];
  category: string;
  dueDate: string;
  recurrencePattern: string;
  reminderEnabled: boolean;
  reminderOffsetMinutes: number | null;
}
