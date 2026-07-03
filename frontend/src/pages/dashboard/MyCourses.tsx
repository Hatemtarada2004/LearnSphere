import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BookOpen, Play, Award, Clock } from 'lucide-react';
import { enrollmentService } from '../../services/enrollment.service';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { CourseCardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { getCategoryLabel, formatDuration } from '../../utils';
import { Enrollment, Course } from '../../types';

export const MyCoursesPage: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['my-enrollments-all'],
    queryFn: () => enrollmentService.getMyEnrollments({ limit: 50 }),
  });

  const enrollments = (data?.data || []) as Enrollment[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {data?.pagination.total || 0} courses enrolled
          </p>
        </div>
        <Button onClick={() => navigate('/courses')} leftIcon={<BookOpen className="h-4 w-4" />}>
          Browse More
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)}
        </div>
      ) : enrollments.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-10 w-10" />}
          title="No enrolled courses"
          description="Find and enroll in courses to start your learning journey."
          action={{ label: 'Browse Courses', onClick: () => navigate('/courses') }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {enrollments.map((enrollment, i) => {
            const course = enrollment.course as Course;
            return (
              <motion.div
                key={enrollment._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-0 overflow-hidden group"
              >
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-full bg-gradient-to-br from-primary-100 to-violet-100 dark:from-primary-950 dark:to-violet-950 flex items-center justify-center">
                      <span className="text-4xl font-bold text-primary-300">{course.title.charAt(0)}</span>
                    </div>
                  )}
                  {enrollment.progress === 100 && (
                    <div className="absolute inset-0 bg-emerald-900/60 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Award className="h-8 w-8 mx-auto mb-1" />
                        <p className="text-sm font-bold">Completed!</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-1">
                    {getCategoryLabel(course.category)}
                  </p>
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-3">
                    {course.title}
                  </h3>

                  <ProgressBar value={enrollment.progress} size="md" showLabel className="mb-4" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDuration(course.duration)}
                    </div>
                    <Button
                      size="sm"
                      leftIcon={<Play className="h-3.5 w-3.5" />}
                      onClick={() => navigate(`/learn/${course._id}`)}
                    >
                      {enrollment.progress > 0 ? 'Continue' : 'Start Learning'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
