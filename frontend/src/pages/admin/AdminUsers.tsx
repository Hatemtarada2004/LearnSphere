import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Trash2, Shield, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/admin.service';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { ConfirmModal } from '../../components/ui/Modal';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { formatDate, extractApiError } from '../../utils';
import { User } from '../../types';

export const AdminUsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, roleFilter],
    queryFn: () => adminService.getUsers({ search: search || undefined, role: roleFilter || undefined, limit: 50 }),
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteUser,
    onSuccess: () => {
      toast.success('User deleted');
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err) => toast.error(extractApiError(err)),
  });

  const users = (data?.data || []) as User[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-gray-500 text-sm mt-1">{data?.pagination.total || 0} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="input pl-9"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input w-36"
        >
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="card overflow-hidden p-0">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users className="h-10 w-10 mx-auto mb-3" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {['User', 'Email', 'Role', 'Verified', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {users.map((user) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          firstName={user.firstName}
                          lastName={user.lastName}
                          avatar={user.avatar}
                          size="sm"
                        />
                        <span className="font-medium text-sm text-gray-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                        {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={user.isVerified ? 'success' : 'warning'}>
                        {user.isVerified ? 'Verified' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => setDeleteId(user._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete User"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
