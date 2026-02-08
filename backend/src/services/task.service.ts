import * as taskRepository from '../repositories/task.repository';
import { Task, CreateTaskInput, UpdateTaskInput } from '../models/task.model';
import {
  calculateNextDueDate,
  shouldCreateRecurringInstance,
  RecurrencePattern,
} from './recurrence.service';
import { publishEvent } from '../events/publisher';
import { TaskEventType, TaskCreatedEvent, TaskUpdatedEvent, TaskDeletedEvent, TaskCompletedEvent, TaskIncompleteEvent } from '../events/event-types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Task Service
 * Business logic layer for task operations
 */

/**
 * Create a new task
 */
export async function createTask(userId: string, input: CreateTaskInput): Promise<Task> {
  const task = await taskRepository.create(userId, input);

  // Publish event after successful creation
  await publishEvent({
    eventType: TaskEventType.CREATED,
    taskId: task.id,
    userId: userId,
    correlationId: uuidv4(),
    timestamp: new Date().toISOString(),
    title: task.title,
    priority: task.priority,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    recurring: !!task.recurrencePattern,
  } as TaskCreatedEvent);

  return task;
}

/**
 * Get all tasks for a user with optional filters
 */
export async function getTasks(
  userId: string,
  filters?: {
    search?: string;
    completed?: boolean;
    priority?: string;
    tag?: string;
    sort?: string;
    order?: string;
  }
): Promise<Task[]> {
  return taskRepository.findAll(userId, filters);
}

/**
 * Get task by ID
 */
export async function getTaskById(taskId: string, userId: string): Promise<Task | null> {
  return taskRepository.findById(taskId, userId);
}

/**
 * Update task
 */
export async function updateTask(
  taskId: string,
  userId: string,
  input: UpdateTaskInput
): Promise<Task | null> {
  const originalTask = await taskRepository.findById(taskId, userId);
  if (!originalTask) {
    return null;
  }

  const updatedTask = await taskRepository.update(taskId, userId, input);

  if (updatedTask) {
    // Determine what changed
    const changes: Record<string, unknown> = {};
    Object.keys(input).forEach(key => {
      const typedKey = key as keyof UpdateTaskInput;
      if (originalTask[key as keyof typeof originalTask] !== input[typedKey]) {
        changes[key] = input[typedKey];
      }
    });

    // Publish event after successful update
    await publishEvent({
      eventType: TaskEventType.UPDATED,
      taskId: updatedTask.id,
      userId: userId,
      correlationId: uuidv4(),
      timestamp: new Date().toISOString(),
      changes: changes,
    } as TaskUpdatedEvent);
  }

  return updatedTask;
}

/**
 * Delete task
 */
export async function deleteTask(taskId: string, userId: string): Promise<boolean> {
  const taskExists = await taskRepository.findById(taskId, userId);
  if (!taskExists) {
    return false;
  }

  const deleted = await taskRepository.deleteTask(taskId, userId);

  if (deleted) {
    // Publish event after successful deletion
    await publishEvent({
      eventType: TaskEventType.DELETED,
      taskId: taskId,
      userId: userId,
      correlationId: uuidv4(),
      timestamp: new Date().toISOString(),
    } as TaskDeletedEvent);
  }

  return deleted;
}

/**
 * Toggle task completion status
 * If task is recurring and has a due date, creates a new instance with next due date
 */
export async function markComplete(taskId: string, userId: string): Promise<Task | null> {
  // First, get the task to check if it's recurring
  const task = await taskRepository.findById(taskId, userId);

  if (!task) {
    console.log(`[markComplete] Task not found: ${taskId}`);
    return null;
  }

  console.log(`[markComplete] Marking task as complete: ${taskId}, title: "${task.title}", recurrence: ${task.recurrencePattern}, dueDate: ${task.dueDate}`);

  // Mark the current task as complete
  const completedTask = await taskRepository.markComplete(taskId, userId);

  if (!completedTask) {
    console.log(`[markComplete] Failed to mark task as complete: ${taskId}`);
    return null;
  }

  console.log(`[markComplete] Task marked as complete successfully: ${taskId}, completed: ${completedTask.completed}`);

  // Check if this is a recurring task that should create a new instance
  const shouldRecur = shouldCreateRecurringInstance(task.recurrencePattern, task.dueDate);
  console.log(`[markComplete] Should create recurring instance: ${shouldRecur}`);

  if (shouldRecur) {
    // Calculate the next due date
    const nextDueDate = calculateNextDueDate(
      task.dueDate!,
      task.recurrencePattern as RecurrencePattern
    );

    console.log(`[markComplete] Creating new recurring instance with due date: ${nextDueDate}`);

    // Create a new task instance with the same properties but new due date
    const newTask = await taskRepository.create(userId, {
      title: task.title,
      description: task.description || undefined,
      priority: task.priority,
      tags: task.tags,
      category: task.category || undefined,
      dueDate: nextDueDate,
      recurrencePattern: task.recurrencePattern,
      reminderEnabled: task.reminderEnabled,
      reminderOffsetMinutes: task.reminderOffsetMinutes || undefined,
    });

    console.log(`[markComplete] Created new recurring instance: ${newTask.id}, completed: ${newTask.completed}`);

    // Publish CREATED event for the new recurring task instance
    await publishEvent({
      eventType: TaskEventType.CREATED,
      taskId: newTask.id,
      userId: userId,
      correlationId: uuidv4(),
      timestamp: new Date().toISOString(),
      title: newTask.title,
      priority: newTask.priority,
      dueDate: newTask.dueDate ? newTask.dueDate.toISOString() : null,
      recurring: true,
    } as TaskCreatedEvent);
  }

  // Publish event after successful completion
  await publishEvent({
    eventType: TaskEventType.COMPLETED,
    taskId: completedTask.id,
    userId: userId,
    correlationId: uuidv4(),
    timestamp: new Date().toISOString(),
  } as TaskCompletedEvent);

  // IMPORTANT: Return the completed task, not the new recurring instance
  return completedTask;
}

/**
 * Mark task as incomplete
 */
export async function markIncomplete(taskId: string, userId: string): Promise<Task | null> {
  const task = await taskRepository.findById(taskId, userId);
  if (!task) {
    return null;
  }

  const incompleteTask = await taskRepository.markIncomplete(taskId, userId);

  if (incompleteTask) {
    // Publish event after successful marking as incomplete
    await publishEvent({
      eventType: TaskEventType.INCOMPLETE,
      taskId: incompleteTask.id,
      userId: userId,
      correlationId: uuidv4(),
      timestamp: new Date().toISOString(),
    } as TaskIncompleteEvent);
  }

  return incompleteTask;
}
