import { Search } from 'lucide-react';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'name-asc', label: 'Name A–Z' },
  { value: 'name-desc', label: 'Name Z–A' },
];

export default function SearchSortBar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {/* Search input */}
      <div className="relative flex-1">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--color-text-tertiary)' }}
          aria-hidden="true"
        />
        <input
          type="text"
          className="input-field w-full pl-10"
          placeholder="Search models..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search saved models"
        />
      </div>

      {/* Sort dropdown */}
      <select
        className="btn-secondary px-4 py-2 rounded-xl text-sm min-w-[140px] cursor-pointer"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        aria-label="Sort models"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
