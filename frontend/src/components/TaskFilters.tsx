/**
 * TaskFilters Component
 * Presentational component for search and filter controls
 */

interface TaskFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  completedFilter: string;
  onCompletedFilterChange: (value: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (value: string) => void;
  tagFilter: string;
  onTagFilterChange: (value: string) => void;
  availableTags: string[];
}

export function TaskFilters({
  search,
  onSearchChange,
  completedFilter,
  onCompletedFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  tagFilter,
  onTagFilterChange,
  availableTags,
}: TaskFiltersProps) {
  return (
    <div className="glass-card p-4 sm:p-5 rounded-2xl mb-4 sm:mb-6 space-y-4">
      {/* Search Input */}
      <div>
        <label htmlFor="search-tasks" className="block text-sm font-medium text-dark-300 mb-2">
          🔍 Search Tasks
        </label>
        <input
          id="search-tasks"
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title or description..."
          className="w-full px-4 py-3 rounded-xl bg-dark-800/50 backdrop-blur-sm border border-dark-600 text-dark-50 placeholder:text-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-dark-500 transition-all text-sm sm:text-base"
          aria-label="Search tasks by title or description"
        />
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Completed Status Filter */}
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-dark-300 mb-2">
            Status
          </label>
          <select
            id="status-filter"
            value={completedFilter}
            onChange={(e) => onCompletedFilterChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-dark-800/50 backdrop-blur-sm border border-dark-600 text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-dark-500 transition-all text-sm sm:text-base"
            aria-label="Filter tasks by status"
          >
            <option value="all">All Tasks</option>
            <option value="incomplete">Incomplete</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label htmlFor="priority-filter" className="block text-sm font-medium text-dark-300 mb-2">
            Priority
          </label>
          <select
            id="priority-filter"
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-dark-800/50 backdrop-blur-sm border border-dark-600 text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-dark-500 transition-all text-sm sm:text-base"
            aria-label="Filter tasks by priority"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Tag Filter */}
        <div>
          <label htmlFor="tag-filter" className="block text-sm font-medium text-dark-300 mb-2">
            Tag
          </label>
          <select
            id="tag-filter"
            value={tagFilter}
            onChange={(e) => onTagFilterChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-dark-800/50 backdrop-blur-sm border border-dark-600 text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-dark-500 transition-all text-sm sm:text-base"
            aria-label="Filter tasks by tag"
          >
            <option value="all">All Tags</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
