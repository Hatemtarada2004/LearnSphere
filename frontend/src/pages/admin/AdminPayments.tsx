import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { paymentService } from '../../services/payment.service';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { Badge } from '../../components/ui/Badge';
import { formatPrice, formatDate } from '../../utils';
import { Payment, User, Course } from '../../types';

const STATUS_BADGES = {
  paid: { label: 'Paid', variant: 'success' as const, icon: CheckCircle },
  created: { label: 'Pending', variant: 'warning' as const, icon: Clock },
  failed: { label: 'Failed', variant: 'danger' as const, icon: XCircle },
  refunded: { label: 'Refunded', variant: 'outline' as const, icon: XCircle },
};

export const AdminPaymentsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments', statusFilter],
    queryFn: () => paymentService.getAllPayments({ status: statusFilter || undefined, limit: 50 }),
  });

  const payments = (data?.data || []) as Payment[];
  const totalRevenue = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
          <p className="text-gray-500 text-sm mt-1">
            {data?.pagination.total || 0} transactions · Total: {formatPrice(totalRevenue)}
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-36"
        >
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="created">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="card overflow-hidden p-0">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
        ) : payments.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CreditCard className="h-10 w-10 mx-auto mb-3" />
            <p>No payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {['Student', 'Course', 'Amount', 'Status', 'Order ID', 'Date'].map((h) => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {payments.map((payment) => {
                  const user = payment.user as User;
                  const course = payment.course as Course;
                  const statusConfig = STATUS_BADGES[payment.status] || STATUS_BADGES.failed;
                  const StatusIcon = statusConfig.icon;

                  return (
                    <motion.tr
                      key={payment._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-5 py-4 text-sm text-gray-900 dark:text-white">
                        {typeof user === 'object' ? `${user.firstName} ${user.lastName}` : 'N/A'}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="line-clamp-1 max-w-[200px]">
                          {typeof course === 'object' ? course.title : 'N/A'}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-sm text-gray-900 dark:text-white">
                        {formatPrice(payment.amount)}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={statusConfig.variant}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400 font-mono">
                        {payment.razorpayOrderId?.slice(-16) || 'N/A'}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(payment.createdAt)}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
