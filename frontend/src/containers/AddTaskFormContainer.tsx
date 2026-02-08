import { useState } from 'react';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { TaskFormData, Priority } from '../types/task.types';
import * as tasksApi from '../services/tasks.api';

/**
 * AddTaskFormContainer
 * Container component for creating new tasks
 */

interface AddTaskFormContainerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddTaskFormContainer({
  isOpen,
  onClose,
  onSuccess,
}: AddTaskFormContainerProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    tags: [],
    category: '',
    dueDate: '',
    recurrencePattern: '',
    reminderEnabled: false,
    reminderOffsetMinutes: null,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TaskFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be 200 characters or less';
    }

    if (formData.description && formData.description.length > 5000) {
      newErrors.description = 'Description must be 5000 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        title: formData.title.trim(),
        priority: formData.priority,
      };

      if (formData.description?.trim()) {
        payload.description = formData.description.trim();
      }

      if (formData.tags.length > 0) {
        payload.tags = formData.tags;
      }

      if (formData.category?.trim()) {
        payload.category = formData.category.trim();
      }

      if (formData.dueDate) {
        payload.dueDate = new Date(formData.dueDate).toISOString();
      }

      if (formData.recurrencePattern) {
        payload.recurrencePattern = formData.recurrencePattern;
      }

      await tasksApi.createTask(payload);

      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium' as Priority,
        tags: [],
        category: '',
        dueDate: '',
        recurrencePattern: '',
        reminderEnabled: false,
        reminderOffsetMinutes: null,
      });
      setErrors({});

      onSuccess();
      onClose();
    } catch (err: any) {
      alert(`Failed to create task: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof TaskFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form onSubmit={handleSubmit}>
        <Input
          label="Title"
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          error={errors.title}
          required
          placeholder="Enter task title"
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-dark-800/50 backdrop-blur-sm border border-dark-600 text-dark-50 placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-dark-500 transition-all"
            rows={4}
            placeholder="Enter task description (optional)"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-danger">{errors.description}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => handleChange('priority', e.target.value as Priority)}
            className="w-full px-4 py-3 rounded-xl bg-dark-800/50 backdrop-blur-sm border border-dark-600 text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-dark-500 transition-all"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <Input
          label="Tags"
          type="text"
          value={formData.tags.join(', ')}
          onChange={(e) => {
            const tagsArray = e.target.value
              .split(',')
              .map(tag => tag.trim())
              .filter(tag => tag.length > 0);
            handleChange('tags', tagsArray);
          }}
          placeholder="e.g., Work, Urgent, Meeting (comma-separated, optional)"
        />

        <Input
          label="Category"
          type="text"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          placeholder="e.g., Work, Personal, Shopping (optional)"
        />

        <Input
          label="Due Date"
          type="datetime-local"
          value={formData.dueDate}
          onChange={(e) => handleChange('dueDate', e.target.value)}
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-dark-300 mb-2">
            Recurrence
          </label>
          <select
            value={formData.recurrencePattern}
            onChange={(e) => handleChange('recurrencePattern', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-dark-800/50 backdrop-blur-sm border border-dark-600 text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-dark-500 transition-all"
          >
            <option value="">No Recurrence</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <p className="mt-1 text-xs text-dark-400">
            Recurring tasks will automatically create a new instance when completed
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <Button type="submit" isLoading={isSubmitting} fullWidth>
            Create Task
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
