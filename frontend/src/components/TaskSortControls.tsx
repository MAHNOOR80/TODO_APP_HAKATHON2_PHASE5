/**
 * TaskSortControls Component
 * Presentational component for sort controls
 */

interface TaskSortControlsProps {
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: string;
  onSortOrderChange: (value: string) => void;
}

export function TaskSortControls({
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}: TaskSortControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-dark-300">Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="px-4 py-2 rounded-lg bg-dark-800/50 backdrop-blur-sm border border-dark-600 text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-dark-500 transition-all text-sm"
        >
          <option value="createdAt">Date Created</option>
          <option value="title">Title</option>
          <option value="priority">Priority</option>
          <option value="dueDate">Due Date</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-dark-300">Order:</label>
        <select
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value)}
          className="px-4 py-2 rounded-lg bg-dark-800/50 backdrop-blur-sm border border-dark-600 text-dark-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-dark-500 transition-all text-sm"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
    </div>
  );
}
