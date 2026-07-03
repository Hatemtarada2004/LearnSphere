import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { paymentService } from '../../services/payment.service';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { formatPrice, formatDate } from '../../utils';
import { Payment, Course } from '../../types';

const statusConfig = {
  paid: { icon: CheckCircle, label: 'Paid', class: 'text-emerald-600 dark:text-emerald-400' },
  created: { icon: Clock, label: 'Pending', class: 'text-amber-600 dark:text-amber-400' },
  failed: { icon: XCircle, label: 'Failed', class: 'text-red-600 dark:text-red-400' },
  refunded: { icon: XCircle, label: 'Refunded', class: 'text-gray-600 dark:text-gray-400' },
};

export const PaymentHistoryPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['payment-history'],
    queryFn: () => paymentService.getPaymentHistory({ limit: 20 }),
  });

  const payments = (data?.data || []) as Payment[];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment History</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {data?.pagination.total || 0} total transactions
        </p>
      </div>

      {isLoading ? (
        <div className="card overflow-hidden p-0">
          {Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)}
        </div>
      ) : payments.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="h-10 w-10" />}
          title="No payment history"
          description="Your course purchases will appear here."
        />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {payments.map((payment) => {
                  const course = payment.course as Course;
                  const status = statusConfig[payment.status] || statusConfig.failed;
                  const StatusIcon = status.icon;

                  return (
                    <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {course.thumbnail && (
                            <img src={course.thumbnail} alt={course.title} className="h-10 w-16 object-cover rounded-lg flex-shrink-0" />
                          )}
                          <div>
                            <p className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1">
                              {typeof course === 'object' ? course.title : 'Course'}
                            </p>
                            <p className="text-xs text-gray-500 font-mono">{payment.razorpayOrderId?.slice(-12)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatPrice(payment.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1.5 text-sm font-medium ${status.class}`}>
                          <StatusIcon className="h-4 w-4" />
                          {status.label}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(payment.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
