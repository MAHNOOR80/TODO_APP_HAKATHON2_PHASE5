import { Task } from '../types/task.types';
import { Button } from './Button';
import { formatDate, getRelativeTime } from '../utils/dateFormatter';

/**
 * TaskItem Component
 * Displays a single task with actions
 */

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggleComplete, onEdit, onDelete }: TaskItemProps) {
  return (
    <div className="glass-card-hover p-5 mb-3 transition-all duration-300">
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggleComplete(task.id)}
          className="mt-1 w-5 h-5 text-primary-500 bg-dark-700/50 border-dark-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-900 cursor-pointer transition-all hover:scale-110"
        />

        {/* Content */}
        <div className="flex-1">
          <h3
            className={`text-lg font-semibold ${
              task.completed ? 'line-through text-dark-500' : 'text-dark-100'
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className={`text-sm mt-2 leading-relaxed ${
              task.completed ? 'text-dark-500' : 'text-dark-300'
            }`}>{task.description}</p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-2 mt-4">
            {/* Priority Badge */}
            {task.priority === 'high' && (
              <span className="badge-high font-semibold">High</span>
            )}
            {task.priority === 'medium' && (
              <span className="badge-medium font-semibold">Medium</span>
            )}
            {task.priority === 'low' && (
              <span className="badge-low font-semibold">Low</span>
            )}

            {/* Tags */}
            {task.tags.map((tag) => (
              <span key={tag} className="badge-tag font-medium">
                #{tag}
              </span>
            ))}

            {/* Category */}
            {task.category && (
              <span className="badge-base bg-dark-700/70 text-dark-200 border border-dark-600/50 font-medium">
                📁 {task.category}
              </span>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <span
                className={`badge-base font-medium ${
                  task.isOverdue && !task.completed
                    ? 'bg-red-500/25 text-red-300 border border-red-500/40 shadow-sm shadow-red-500/20'
                    : 'bg-purple-500/25 text-purple-300 border border-purple-500/40'
                }`}
                title={formatDate(task.dueDate)}
              >
                📅 {getRelativeTime(task.dueDate)}
              </span>
            )}

            {/* Recurrence indicator */}
            {task.recurrencePattern && (
              <span className="badge-base bg-green-500/25 text-green-300 border border-green-500/40 font-medium">
                🔁 {task.recurrencePattern.charAt(0).toUpperCase() + task.recurrencePattern.slice(1)}
              </span>
            )}

            {/* Overdue indicator */}
            {task.isOverdue && !task.completed && (
              <span className="badge-base bg-red-500/30 text-red-200 border border-red-500/50 animate-pulse font-bold shadow-sm shadow-red-500/30">
                ⚠️ Overdue
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => onEdit(task)}
            variant="ghost"
            className="text-sm px-3 py-2 text-primary-400 hover:text-primary-300 hover:bg-primary-500/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button
            onClick={() => onDelete(task.id)}
            variant="ghost"
            className="text-sm px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
