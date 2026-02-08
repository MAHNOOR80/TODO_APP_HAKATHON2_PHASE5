export enum TaskEventType {
  CREATED = 'tasks.created',
  UPDATED = 'tasks.updated',
  DELETED = 'tasks.deleted',
  COMPLETED = 'tasks.completed',
  INCOMPLETE = 'tasks.incomplete',
  OVERDUE = 'tasks.overdue',
  REMINDER = 'tasks.reminder',
}

export interface TaskEvent {
  eventType: TaskEventType;
  taskId: string;
  userId: string;
  correlationId: string;
  timestamp: string;
}

export interface TaskCreatedEvent extends TaskEvent {
  eventType: TaskEventType.CREATED;
  title: string;
  priority: string;
  dueDate: string | null;
  recurring: boolean;
}

export interface TaskUpdatedEvent extends TaskEvent {
  eventType: TaskEventType.UPDATED;
  changes: Record<string, unknown>;
}

export interface TaskDeletedEvent extends TaskEvent {
  eventType: TaskEventType.DELETED;
}

export interface TaskCompletedEvent extends TaskEvent {
  eventType: TaskEventType.COMPLETED;
}

export interface TaskIncompleteEvent extends TaskEvent {
  eventType: TaskEventType.INCOMPLETE;
}
