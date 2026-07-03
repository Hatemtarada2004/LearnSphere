import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  ArrowUp,
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { StatCardSkeleton } from '../../components/ui/Skeleton';
import { Avatar } from '../../components/ui/Avatar';
import { formatPrice, formatDate, formatRelativeTime } from '../../utils';

export const AdminDashboard: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminService.getDashboardStats,
    refetchInterval: 60_000,
  });

  const statCards = data
    ? [
        {
          icon: Users,
          label: 'Total Students',
          value: data.stats.totalUsers.toLocaleString(),
          color: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
          change: '+12%',
        },
        {
          icon: BookOpen,
          label: 'Total Courses',
          value: data.stats.totalCourses.toLocaleString(),
          color: 'bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
          change: '+5%',
        },
        {
          icon: TrendingUp,
          label: 'Enrollments',
          value: data.stats.totalEnrollments.toLocaleString(),
          color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
          change: '+18%',
        },
        {
          icon: DollarSign,
          label: 'Total Revenue',
          value: formatPrice(data.stats.totalRevenue),
          color: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
          change: '+22%',
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Platform overview and statistics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map(({ icon: Icon, label, value, color, change }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
                  <div className={`p-2 rounded-xl ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{value}</p>
                <div className="flex items-center gap-1 mt-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                  <ArrowUp className="h-3.5 w-3.5" />
                  <span>{change} this month</span>
                </div>
              </motion.div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart (simplified) */}
        {data?.monthlyRevenue && data.monthlyRevenue.length > 0 && (
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Monthly Revenue</h2>
            <div className="space-y-2">
              {data.monthlyRevenue.slice(-6).map((month) => {
                const maxRev = Math.max(...data.monthlyRevenue.map((m) => m.revenue));
                const pct = maxRev > 0 ? (month.revenue / maxRev) * 100 : 0;
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                return (
                  <div key={`${month._id.year}-${month._id.month}`} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-8 flex-shrink-0">
                      {monthNames[month._id.month - 1]}
                    </span>
                    <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-violet-500 rounded-lg transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white w-20 text-right">
                      {formatPrice(month.revenue)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top Courses */}
        {data?.topCourses && (
          <div className="card p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top Courses</h2>
            <div className="space-y-3">
              {(data.topCourses as Array<{
                _id: string;
                title: string;
                thumbnail: string;
                totalStudents: number;
                rating: number;
                price: number;
              }>).map((course, i) => (
                <div key={course._id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
                  <div className="h-10 w-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                    {course.thumbnail && (
                      <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{course.title}</p>
                    <p className="text-xs text-gray-500">{course.totalStudents} students</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatPrice(course.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Enrollments */}
      {data?.recentEnrollments && data.recentEnrollments.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Enrollments</h2>
          <div className="space-y-3">
            {(data.recentEnrollments as Array<{
              _id: string;
              student: { _id: string; firstName: string; lastName: string; email: string; avatar: string };
              course: { title: string };
              enrollmentDate: string;
            }>).map((enrollment) => (
              <div key={enrollment._id} className="flex items-center gap-3">
                <Avatar
                  firstName={enrollment.student?.firstName || ''}
                  lastName={enrollment.student?.lastName || ''}
                  avatar={enrollment.student?.avatar}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {enrollment.student?.firstName} {enrollment.student?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">enrolled in {(enrollment.course as { title: string })?.title}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {formatRelativeTime(enrollment.enrollmentDate)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
