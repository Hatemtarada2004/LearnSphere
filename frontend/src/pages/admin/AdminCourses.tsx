import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  BookOpen,
  Users,
  Star,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { courseService } from '../../services/course.service';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ConfirmModal } from '../../components/ui/Modal';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { formatPrice, getLevelLabel, getCategoryLabel, extractApiError } from '../../utils';
import { Course } from '../../types';
import { AdminCourseForm } from './AdminCourseForm';

export const AdminCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-courses', search],
    queryFn: () => courseService.getCourses({ search: search || undefined, limit: 50 }),
  });

  const deleteMutation = useMutation({
    mutationFn: courseService.deleteCourse,
    onSuccess: () => {
      toast.success('Course deleted');
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const publishMutation = useMutation({
    mutationFn: courseService.togglePublish,
    onSuccess: (data) => {
      toast.success(data.isPublished ? 'Course published' : 'Course unpublished');
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const courses = data?.data || [];

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCourse(null);
    queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Courses</h1>
          <p className="text-gray-500 text-sm mt-1">{courses.length} courses total</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>
          New Course
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses..."
          className="input pl-9"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
        ) : courses.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <BookOpen className="h-10 w-10 mx-auto mb-3" />
            <p>No courses found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {['Course', 'Category', 'Price', 'Students', 'Rating', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {courses.map((course) => (
                  <motion.tr
                    key={course._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                          {course.thumbnail ? (
                            <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">
                              <BookOpen className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1">
                            {course.title}
                          </p>
                          <p className="text-xs text-gray-500">{getLevelLabel(course.level)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {getCategoryLabel(course.category)}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-sm text-gray-900 dark:text-white">
                      {formatPrice(course.price)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Users className="h-3.5 w-3.5" />
                        {course.totalStudents}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-sm text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {course.rating.toFixed(1)}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={course.isPublished ? 'success' : 'warning'}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/courses/${course._id}`)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => { setEditingCourse(course); setShowForm(true); }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => publishMutation.mutate(course._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
                          title={course.isPublished ? 'Unpublish' : 'Publish'}
                        >
                          {course.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setDeleteId(course._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Course Form Modal */}
      {showForm && (
        <AdminCourseForm
          course={editingCourse}
          onClose={handleFormClose}
        />
      )}

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Course"
        message="Are you sure you want to delete this course? This will remove all modules, lessons, and enrollment data. This action cannot be undone."
        confirmText="Delete Course"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
