import React from 'react';
import { Filter, X } from 'lucide-react';
import { CourseFilters, CourseCategory, CourseLevel } from '../../types';
import { Button } from '../ui/Button';

const CATEGORIES: { value: CourseCategory | ''; label: string }[] = [
  { value: '', label: 'All Categories' },
  { value: 'development', label: 'Development' },
  { value: 'design', label: 'Design' },
  { value: 'business', label: 'Business' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'photography', label: 'Photography' },
  { value: 'music', label: 'Music' },
  { value: 'health', label: 'Health & Fitness' },
  { value: 'finance', label: 'Finance' },
  { value: 'language', label: 'Language' },
  { value: 'other', label: 'Other' },
];

const LEVELS: { value: CourseLevel | ''; label: string }[] = [
  { value: '', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

interface CourseFilterProps {
  filters: CourseFilters;
  onChange: (filters: CourseFilters) => void;
  onReset: () => void;
}

export const CourseFilter: React.FC<CourseFilterProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const hasActiveFilters =
    filters.category ||
    filters.level ||
    filters.sort !== 'newest' ||
    filters.minPrice ||
    filters.maxPrice;

  return (
    <div className="card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" leftIcon={<X className="h-3 w-3" />} onClick={onReset}>
            Clear
          </Button>
        )}
      </div>

      {/* Sort */}
      <div>
        <label className="label">Sort By</label>
        <select
          value={filters.sort || 'newest'}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as CourseFilters['sort'], page: 1 })}
          className="input"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div>
        <label className="label">Category</label>
        <div className="space-y-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onChange({ ...filters, category: cat.value || undefined, page: 1 })}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                (filters.category || '') === cat.value
                  ? 'bg-primary-100 text-primary-700 font-medium dark:bg-primary-950 dark:text-primary-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Level */}
      <div>
        <label className="label">Level</label>
        <div className="space-y-1.5">
          {LEVELS.map((lvl) => (
            <button
              key={lvl.value}
              onClick={() => onChange({ ...filters, level: lvl.value || undefined, page: 1 })}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                (filters.level || '') === lvl.value
                  ? 'bg-primary-100 text-primary-700 font-medium dark:bg-primary-950 dark:text-primary-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="label">Price Range (₹)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => onChange({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
            className="input w-1/2 text-sm"
            min={0}
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => onChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined, page: 1 })}
            className="input w-1/2 text-sm"
            min={0}
          />
        </div>
      </div>
    </div>
  );
};
