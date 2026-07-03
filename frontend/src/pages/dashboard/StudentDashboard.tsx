import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BookOpen, Award, TrendingUp, Clock, ArrowRight, Play } from 'lucide-react';
import { enrollmentService } from '../../services/enrollment.service';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { CourseCardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDuration, getCategoryLabel } from '../../utils';
import { Enrollment, Course } from '../../types';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: () => enrollmentService.getMyEnrollments({ limit: 6 }),
  });

  const enrollments = (data?.data || []) as Enrollment[];
  const completedCount = enrollments.filter((e) => e.progress === 100).length;
  const inProgressCount = enrollments.filter((e) => e.progress > 0 && e.progress < 100).length;

  const stats = [
    {
      icon: BookOpen,
      label: 'Enrolled Courses',
      value: data?.pagination.total || 0,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    },
    {
      icon: TrendingUp,
      label: 'In Progress',
      value: inProgressCount,
      color: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    },
    {
      icon: Award,
      label: 'Completed',
      value: completedCount,
      color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600 to-violet-600 rounded-2xl p-6 text-white"
      >
        <h1 className="text-2xl font-black mb-1">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-white/80">
          {inProgressCount > 0
            ? `You have ${inProgressCount} course${inProgressCount > 1 ? 's' : ''} in progress. Keep it up!`
            : 'Ready to learn something new today?'}
        </p>
        <Button
          className="mt-4 bg-white text-primary-700 hover:bg-gray-50"
          onClick={() => navigate('/courses')}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Browse Courses
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-4 text-center"
          >
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mx-auto mb-2`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">{value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* My Courses */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Courses</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/courses')} rightIcon={<ArrowRight className="h-4 w-4" />}>
            View All
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => <CourseCardSkeleton key={i} />)}
          </div>
        ) : enrollments.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="h-10 w-10" />}
            title="No courses yet"
            description="Start your learning journey by enrolling in your first course."
            action={{ label: 'Browse Courses', onClick: () => navigate('/courses') }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {enrollments.map((enrollment) => {
              const course = enrollment.course as Course;
              return (
                <motion.div
                  key={enrollment._id}
                  whileHover={{ y: -2 }}
                  className="card p-0 overflow-hidden"
                >
                  <div className="relative">
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full bg-gradient-to-br from-primary-100 to-violet-100 dark:from-primary-950 dark:to-violet-950 flex items-center justify-center">
                          <span className="text-3xl font-bold text-primary-300">
                            {course.title.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    {enrollment.progress === 100 && (
                      <div className="absolute top-2 right-2">
                        <span className="badge bg-emerald-500 text-white">
                          <Award className="h-3 w-3 mr-1" />Completed
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-1">{getCategoryLabel(course.category)}</p>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-3">
                      {course.title}
                    </h3>

                    <ProgressBar value={enrollment.progress} size="sm" showLabel className="mb-3" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {formatDuration(course.duration)}
                      </div>
                      <Button
                        size="sm"
                        leftIcon={<Play className="h-3.5 w-3.5" />}
                        onClick={() => navigate(`/learn/${course._id}`)}
                      >
                        {enrollment.progress > 0 ? 'Continue' : 'Start'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
