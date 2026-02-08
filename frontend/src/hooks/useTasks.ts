import { useState, useEffect, useRef, useCallback } from 'react';
import * as tasksApi from '../services/tasks.api';
import { Task } from '../types/task.types';

/**
 * useTasks Hook
 * Manages task data fetching and state
 */

export function useTasks(filters?: tasksApi.TaskFilters) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use ref to track if we're currently fetching to prevent duplicate requests
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchTasks = useCallback(async () => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Prevent duplicate fetches
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const data = await tasksApi.getAllTasks(filters);
      setTasks(data);
    } catch (err: any) {
      // Don't set error if request was aborted
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to fetch tasks');
      }
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [filters?.search, filters?.completed, filters?.priority, filters?.tag, filters?.sort, filters?.order]);

  useEffect(() => {
    fetchTasks();

    // Cleanup: abort any in-flight requests when component unmounts or dependencies change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchTasks]);

  const refetch = useCallback(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    isLoading,
    error,
    refetch,
  };
}
