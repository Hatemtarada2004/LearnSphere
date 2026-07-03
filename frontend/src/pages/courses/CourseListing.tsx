import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, BookOpen } from 'lucide-react';
import { courseService } from '../../services/course.service';
import { userService } from '../../services/user.service';
import { CourseCard } from '../../components/course/CourseCard';
import { CourseFilter } from '../../components/course/CourseFilter';
import { CourseCardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { CourseFilters } from '../../types';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { extractApiError } from '../../utils';

export const CourseListingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilter, setShowFilter] = useState(false);
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());

  const [filters, setFilters] = useState<CourseFilters>({
    category: (searchParams.get('category') as CourseFilters['category']) || undefined,
    level: (searchParams.get('level') as CourseFilters['level']) || undefined,
    search: searchParams.get('search') || undefined,
    sort: (searchParams.get('sort') as CourseFilters['sort']) || 'newest',
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: 12,
  });

  const [searchInput, setSearchInput] = useState(filters.search || '');

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) params.set(k, String(v));
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['courses', filters],
    queryFn: () => courseService.getCourses(filters),
    placeholderData: (prev) => prev,
  });

  const { data: wishlist } = useQuery({
    queryKey: ['wishlist'],
    queryFn: userService.getWishlist,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (wishlist) {
      setWishlistedIds(new Set(wishlist.map((c) => c._id)));
    }
  }, [wishlist]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setFilters((f) => ({ ...f, search: searchInput.trim() || undefined, page: 1 }));
    },
    [searchInput]
  );

  const handleWishlist = async (courseId: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save courses');
      return;
    }
    try {
      const result = await userService.toggleWishlist(courseId);
      setWishlistedIds((prev) => {
        const next = new Set(prev);
        if (result.action === 'added') {
          next.add(courseId);
          toast.success('Added to wishlist');
        } else {
          next.delete(courseId);
          toast.success('Removed from wishlist');
        }
        return next;
      });
    } catch (error) {
      toast.error(extractApiError(error));
    }
  };

  const handleResetFilters = () => {
    setFilters({ sort: 'newest', page: 1, limit: 12 });
    setSearchInput('');
  };

  const courses = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
            {filters.search ? `Results for "${filters.search}"` : filters.category ? `${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)} Courses` : 'All Courses'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {pagination ? `${pagination.total.toLocaleString()} courses found` : 'Browse our library'}
          </p>
        </div>

        {/* Search + Filter Toggle */}
        <div className="flex gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search courses..."
                className="input pl-9"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => { setSearchInput(''); setFilters(f => ({ ...f, search: undefined, page: 1 })); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button type="submit" variant="secondary" leftIcon={<Search className="h-4 w-4" />}>
              Search
            </Button>
          </form>

          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`lg:hidden btn btn-secondary btn-md ${showFilter ? 'bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300' : ''}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filter */}
          <aside className={`${showFilter ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
            <div className="sticky top-20">
              <CourseFilter
                filters={filters}
                onChange={setFilters}
                onReset={handleResetFilters}
              />
            </div>
          </aside>

          {/* Course Grid */}
          <div className="flex-1 min-w-0">
            {isLoading || isFetching ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 9 }).map((_, i) => <CourseCardSkeleton key={i} />)}
              </div>
            ) : courses.length === 0 ? (
              <EmptyState
                icon={<BookOpen className="h-10 w-10" />}
                title="No courses found"
                description="Try adjusting your filters or search terms to find what you're looking for."
                action={{ label: 'Clear Filters', onClick: handleResetFilters }}
              />
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                >
                  {courses.map((course) => (
                    <CourseCard
                      key={course._id}
                      course={course}
                      onWishlist={handleWishlist}
                      isWishlisted={wishlistedIds.has(course._id)}
                    />
                  ))}
                </motion.div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={!pagination.hasPrevPage}
                      onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) - 1 }))}
                    >
                      Previous
                    </Button>

                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(
                        pagination.totalPages - 4,
                        (pagination.page || 1) - 2
                      )) + i;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setFilters((f) => ({ ...f, page: pageNum }))}
                          className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                            pageNum === pagination.page
                              ? 'bg-primary-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={!pagination.hasNextPage}
                      onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
