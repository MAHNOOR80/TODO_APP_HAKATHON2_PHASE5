import { TaskList } from '../components/TaskList';
import { useTasks } from '../hooks/useTasks';
import { Task } from '../types/task.types';
import * as tasksApi from '../services/tasks.api';

/**
 * TaskListContainer
 * Container component that manages task list state and actions
 */

interface TaskListContainerProps {
  onEdit: (task: Task) => void;
}

export function TaskListContainer({ onEdit }: TaskListContainerProps) {
  const { tasks, isLoading, error, refetch } = useTasks();

  const handleToggleComplete = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    try {
      if (task.completed) {
        await tasksApi.markIncomplete(id);
      } else {
        await tasksApi.markComplete(id);
      }
      refetch();
    } catch (err: any) {
      alert(`Failed to update task: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await tasksApi.deleteTask(id);
      refetch();
    } catch (err: any) {
      alert(`Failed to delete task: ${err.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        <p className="font-medium">Error loading tasks</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={refetch}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <TaskList
      tasks={tasks}
      onToggleComplete={handleToggleComplete}
      onEdit={onEdit}
      onDelete={handleDelete}
    />
  );
}
