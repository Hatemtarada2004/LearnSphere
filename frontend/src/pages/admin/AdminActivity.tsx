import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { UserPlus, BookOpen, CreditCard, Activity } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { Avatar } from '../../components/ui/Avatar';
import { formatRelativeTime } from '../../utils';

interface ActivityItem {
  type: 'enrollment' | 'payment' | 'registration';
  message: string;
  user: { _id: string; firstName: string; lastName: string; avatar?: string };
  course?: { title: string };
  amount?: number;
  createdAt: string;
}

const TYPE_CONFIG = {
  enrollment: {
    icon: BookOpen,
    bg: 'bg-blue-100 dark:bg-blue-950',
    color: 'text-blue-600 dark:text-blue-400',
    label: 'Enrollment',
  },
  payment: {
    icon: CreditCard,
    bg: 'bg-emerald-100 dark:bg-emerald-950',
    color: 'text-emerald-600 dark:text-emerald-400',
    label: 'Payment',
  },
  registration: {
    icon: UserPlus,
    bg: 'bg-violet-100 dark:bg-violet-950',
    color: 'text-violet-600 dark:text-violet-400',
    label: 'New User',
  },
};

export const AdminActivityPage: React.FC = () => {
  const { data: activity = [], isLoading } = useQuery({
    queryKey: ['admin-activity'],
    queryFn: adminService.getRecentActivity,
    refetchInterval: 30_000,
  });

  const items = activity as ActivityItem[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Activity</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Latest enrollments, payments, and registrations across the platform
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 animate-pulse"
            >
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">No recent activity found.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-[1.375rem] top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />

          <div className="space-y-1">
            {items.map((item, i) => {
              const cfg = TYPE_CONFIG[item.type];
              const Icon = cfg.icon;
              const name = `${item.user?.firstName ?? ''} ${item.user?.lastName ?? ''}`.trim();

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="relative flex items-start gap-4 pl-2 pr-4 py-3 group"
                >
                  {/* Icon bubble on the timeline */}
                  <div
                    className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                  </div>

                  {/* Card */}
                  <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-4 py-3 shadow-sm group-hover:border-gray-200 dark:group-hover:border-gray-600 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar
                          firstName={item.user?.firstName ?? ''}
                          lastName={item.user?.lastName ?? ''}
                          avatar={item.user?.avatar}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.message}
                            {item.course?.title && (
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                {' '}&ldquo;{item.course.title}&rdquo;
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}
                        >
                          {cfg.label}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
