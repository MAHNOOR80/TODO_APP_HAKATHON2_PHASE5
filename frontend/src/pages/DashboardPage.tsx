import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { signout } from '../services/auth.api';
import { Button } from '../components/Button';
import { TaskFilters } from '../components/TaskFilters';
import { TaskSortControls } from '../components/TaskSortControls';
import { AddTaskFormContainer } from '../containers/AddTaskFormContainer';
import { EditTaskFormContainer } from '../containers/EditTaskFormContainer';
import { ToastContainer } from '../components/ToastContainer';
import { Task } from '../types/task.types';
import { useTasks } from '../hooks/useTasks';
import { useToast } from '../hooks/useToast';
import * as tasksApi from '../services/tasks.api';
import { formatDate, getRelativeTime } from '../utils/dateFormatter';
import { Spinner } from '../components/Spinner';
import FloatingChatbot from '../components/FloatingChatbot';
import { useNotifications } from '../hooks/useNotifications';

/**
 * Dashboard Page
 * Main task management interface with full CRUD functionality
 */

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toasts, removeToast, success, error } = useToast();
  const { permission, requestPermission, showNotification, isSupported } = useNotifications();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notificationsDisabled, setNotificationsDisabled] = useState(() => {
    return localStorage.getItem('notificationsDisabled') === 'true';
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Listen for changes to notification preferences in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'notificationsDisabled') {
        setNotificationsDisabled(e.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEnableNotifications = async () => {
    if (!isSupported) {
      error('Browser notifications are not supported in your browser');
      handleClose();
      return;
    }

    try {
      const result = await requestPermission();
      if (result === 'granted') {
        // Remove the disabled flag if it exists
        localStorage.removeItem('notificationsDisabled');
        setNotificationsDisabled(false);
        success('Browser notifications enabled successfully!');
        // Show a test notification to confirm it's working
        showNotification('Notifications Enabled', {
          body: 'You will now receive task reminders and due date notifications',
          icon: '/favicon.ico',
          tag: 'notification-enabled',
        });
      } else if (result === 'denied') {
        error('Notifications were blocked. Please enable them in your browser settings.');
      } else {
        success('Notification permissions updated');
      }
    } catch (err: any) {
      error(`Failed to enable notifications: ${err.message}`);
    }
    handleClose();
  };

  const handleDisableNotifications = () => {
    // Store user preference to disable notifications in localStorage
    localStorage.setItem('notificationsDisabled', 'true');
    setNotificationsDisabled(true);
    success('Browser notifications have been disabled. You will no longer receive task reminders.');
    handleClose();
  };
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filter and sort state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [completedFilter, setCompletedFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');


  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Build filter object for API
  const filters: tasksApi.TaskFilters = {
    search: debouncedSearch || undefined,
    completed: completedFilter === 'completed' ? true : completedFilter === 'incomplete' ? false : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
    tag: tagFilter !== 'all' ? tagFilter : undefined,
    sort: sortBy,
    order: sortOrder,
  };

  // Fetch tasks with filters
  const { tasks, isLoading, error: loadError, refetch } = useTasks(filters);

  // Extract unique tags from tasks for filter dropdown
  const availableTags = Array.from(new Set(tasks.flatMap(task => task.tags))).sort();

  // Check for due/overdue tasks and show notifications
  useEffect(() => {
    if (permission !== 'granted' || notificationsDisabled) return;

    const checkAndNotifyDueTasks = () => {
      if (!tasks || tasks.length === 0) return;

      const now = new Date();

      tasks.forEach(task => {
        if (task.dueDate && !task.completed) {
          const dueDate = new Date(task.dueDate);
          const timeDiff = dueDate.getTime() - now.getTime();
          const minutesDiff = Math.ceil(timeDiff / (1000 * 60));

          // Check if task is overdue or due within 5 minutes
          if (minutesDiff <= 0 || minutesDiff <= 5) {
            // Check if we've already shown a notification for this task recently
            const notificationKey = `notification-${task.id}-${dueDate.getTime()}`;
            if (!localStorage.getItem(notificationKey)) {
              showNotification('Task Reminder', {
                body: `Task '${task.title}' is due now!`,
                icon: '/favicon.ico',
                tag: `todo-reminder-${task.id}`,
                requireInteraction: true,
              });

              // Set a flag to prevent duplicate notifications for the same due date
              localStorage.setItem(notificationKey, 'true');

              // Remove the flag after 10 minutes to allow future notifications
              setTimeout(() => {
                localStorage.removeItem(notificationKey);
              }, 10 * 60 * 1000); // 10 minutes
            }
          }
        }
      });
    };

    // Check immediately
    checkAndNotifyDueTasks();

    // Check every 60 seconds
    const intervalId = setInterval(checkAndNotifyDueTasks, 60000);

    return () => {
      clearInterval(intervalId);
    };
  }, [tasks, permission, notificationsDisabled, showNotification]);

  const handleSignout = async () => {
    try {
      await signout();
      logout();
      navigate('/signin');
    } catch (err: any) {
      error('Failed to sign out. Please try again.');
      console.error('Signout failed:', err);
    }
  };

  const handleAddSuccess = () => {
    success('Task created successfully!');
    refetch();
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    success('Task updated successfully!');
    refetch();
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setEditingTask(null);
  };

  const handleToggleComplete = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    try {
      if (task.completed) {
        await tasksApi.markIncomplete(id);
        success('Task marked as incomplete');
      } else {
        await tasksApi.markComplete(id);
        success(task.recurrencePattern ? 'Task completed! New instance created.' : 'Task completed!');
      }
      refetch();
    } catch (err: any) {
      error(`Failed to update task: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await tasksApi.deleteTask(id);
      success('Task deleted successfully');
      refetch();
    } catch (err: any) {
      error(`Failed to delete task: ${err.message}`);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800/95">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header - Improved contrast and spacing */}
      <header className="sticky top-0 z-50 bg-dark-900/95 backdrop-blur-xl border-b border-dark-700/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-300 via-primary-400 to-accent-purple bg-clip-text text-transparent">
                TaskFlow
              </h1>
              <p className="text-sm text-dark-300 font-medium">Welcome back, {user?.name || user?.email}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="flex-1 sm:flex-none bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40"
                size="lg"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline font-semibold">New Task</span>
                <span className="sm:hidden font-semibold">New</span>
              </Button>
              <div className="relative">
                <Button
                  onClick={handleClick}
                  variant="secondary"
                  className={`flex-1 sm:flex-none ${
                    permission === 'granted' && !notificationsDisabled
                      ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400'
                      : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400'
                  } text-white shadow-lg ${
                    permission === 'granted' && !notificationsDisabled
                      ? 'shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40'
                      : 'shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40'
                  }`}
                  size="lg"
                  disabled={!isSupported}
                  title={isSupported
                    ? permission === 'granted' && !notificationsDisabled
                      ? "Notifications are enabled. Click to change settings."
                      : "Notifications are disabled. Click to change settings."
                    : "Notifications not supported in your browser"}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM16 3h5v5h-5V3zM4 3h6v6H4V3z" />
                  </svg>
                  <span className="hidden sm:inline font-semibold">
                    {permission === 'granted' && !notificationsDisabled ? 'Reminders: ON' : 'Reminders: OFF'}
                  </span>
                </Button>

                {open && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-dark-800 ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu">
                      {permission === 'granted' && !notificationsDisabled ? (
                        <>
                          <button
                            onClick={handleDisableNotifications}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-dark-700"
                            role="menuitem"
                          >
                            Disable Notifications
                          </button>
                          <button
                            onClick={() => {
                              showNotification('Test Notification', {
                                body: 'This is a test reminder to confirm notifications are working',
                                icon: '/favicon.ico',
                                tag: 'test-notification',
                              });
                              handleClose();
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-dark-700"
                            role="menuitem"
                          >
                            Test Notification
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={handleEnableNotifications}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-dark-700"
                          role="menuitem"
                        >
                          Enable Notifications
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Button
                onClick={handleSignout}
                variant="ghost"
                className="flex-1 sm:flex-none text-dark-300 hover:text-dark-100 hover:bg-dark-800/80"
                size="lg"
              >
                <svg className="w-4 h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Task Management */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 sm:p-8 animate-scale-in">
              {/* Section Header with improved hierarchy */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-dark-700/50">
                <div>
                  <h2 className="text-2xl font-bold text-dark-50 mb-1">My Tasks</h2>
                  <p className="text-sm text-dark-400">
                    {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} total
                    <span className="mx-2">•</span>
                    <span className="text-primary-400 font-medium">{tasks.filter(t => !t.completed).length} pending</span>
                    <span className="mx-2">•</span>
                    <span className="text-green-400 font-medium">{tasks.filter(t => t.completed).length} completed</span>
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="mb-6">
                <TaskFilters
                  search={search}
                  onSearchChange={setSearch}
                  completedFilter={completedFilter}
                  onCompletedFilterChange={setCompletedFilter}
                  priorityFilter={priorityFilter}
                  onPriorityFilterChange={setPriorityFilter}
                  tagFilter={tagFilter}
                  onTagFilterChange={setTagFilter}
                  availableTags={availableTags}
                />
              </div>

              {/* Sort Controls */}
              <div className="mb-6">
                <TaskSortControls
                  sortBy={sortBy}
                  onSortByChange={setSortBy}
                  sortOrder={sortOrder}
                  onSortOrderChange={setSortOrder}
                />
              </div>

              {/* Task List */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Spinner size="lg" variant="gradient" className="mb-4" />
                  <p className="text-dark-400">Loading your tasks...</p>
                </div>
              ) : loadError ? (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-red-400">Error Loading Tasks</h3>
                  </div>
                  <p className="text-dark-400 mb-4">{loadError}</p>
                  <Button onClick={refetch} variant="primary">
                    Try Again
                  </Button>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-20 px-4">
                  <div className="mx-auto w-28 h-28 bg-gradient-to-br from-primary-500/20 to-accent-purple/20 rounded-full flex items-center justify-center mb-8 animate-pulse">
                    <svg className="w-14 h-14 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-dark-100 mb-3">
                    {debouncedSearch || completedFilter !== 'all' || priorityFilter !== 'all' || tagFilter !== 'all'
                      ? 'No tasks match your filters'
                      : 'No tasks yet'}
                  </h3>
                  <p className="text-dark-300 mb-8 text-lg max-w-md mx-auto leading-relaxed">
                    {debouncedSearch || completedFilter !== 'all' || priorityFilter !== 'all' || tagFilter !== 'all'
                      ? 'Try adjusting your filters to see more tasks.'
                      : 'Start organizing your work by creating your first task!'}
                  </p>
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 px-8 py-4 text-base font-semibold"
                    size="lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Your First Task
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`group relative glass-card-hover p-5 sm:p-6 transition-all duration-300 ${
                        task.completed ? 'opacity-60 hover:opacity-75' : 'hover:scale-[1.01]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        {/* Checkbox with improved styling */}
                        <div className="flex-shrink-0 mt-0.5">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleToggleComplete(task.id)}
                            className="w-5 h-5 text-primary-500 bg-dark-700/50 border-dark-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-900 cursor-pointer transition-all hover:scale-110"
                            aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
                          />
                        </div>

                        {/* Content with improved typography */}
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`text-lg font-semibold break-words transition-colors ${
                              task.completed
                                ? 'line-through text-dark-500'
                                : 'text-dark-100 group-hover:text-primary-300'
                            }`}
                          >
                            {task.title}
                          </h3>

                          {task.description && (
                            <p className={`text-sm mt-2 break-words leading-relaxed ${
                              task.completed ? 'text-dark-500' : 'text-dark-300'
                            }`}>
                              {task.description}
                            </p>
                          )}

                          {/* Metadata with improved spacing and contrast */}
                          <div className="flex flex-wrap gap-2 mt-4">
                            {/* Priority Badge */}
                            {task.priority && (
                              <span className={`badge-${task.priority} font-semibold`}>
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </span>
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

                            {/* Due Date with improved visibility */}
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

                        {/* Actions with improved buttons */}
                        <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Button
                            onClick={() => handleEditClick(task)}
                            variant="ghost"
                            className="text-sm px-3 py-2 flex-1 sm:flex-none text-primary-400 hover:text-primary-300 hover:bg-primary-500/10"
                            aria-label={`Edit task "${task.title}"`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="ml-1.5 hidden md:inline">Edit</span>
                          </Button>
                          <Button
                            onClick={() => handleDelete(task.id)}
                            variant="ghost"
                            className="text-sm px-3 py-2 flex-1 sm:flex-none text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            aria-label={`Delete task "${task.title}"`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="ml-1.5 hidden md:inline">Delete</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Additional space for task management */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sm:p-8 h-full">
              <div className="flex flex-col h-full">
                <h2 className="text-2xl font-bold text-dark-50 mb-6">Task Insights</h2>
                <div className="flex-grow flex items-center justify-center">
                  <div className="text-center text-dark-400">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-lg font-medium text-dark-300">AI Assistant Available</p>
                    <p className="mt-2">Click the chat icon in the corner to interact with your AI assistant</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddTaskFormContainer
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      <EditTaskFormContainer
        isOpen={isEditModalOpen}
        task={editingTask}
        onClose={handleEditClose}
        onSuccess={handleEditSuccess}
      />
      {/* Floating AI Chatbot */}
      <FloatingChatbot position="bottom-right" onTasksUpdated={refetch} />
    </div>
  );
}
