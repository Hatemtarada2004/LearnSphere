import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../../services/user.service';
import { CourseCard } from '../../components/course/CourseCard';
import { CourseCardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { extractApiError } from '../../utils';

export const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: userService.getWishlist,
  });

  const toggleMutation = useMutation({
    mutationFn: (courseId: string) => userService.toggleWishlist(courseId),
    onSuccess: (_, courseId) => {
      toast.success('Removed from wishlist');
      queryClient.setQueryData(['wishlist'], (old: typeof wishlist) =>
        (old || []).filter((c) => c._id !== courseId)
      );
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {wishlist.length} course{wishlist.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)}
        </div>
      ) : wishlist.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-10 w-10" />}
          title="Your wishlist is empty"
          description="Save courses you're interested in to come back to them later."
          action={{ label: 'Browse Courses', onClick: () => navigate('/courses') }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {wishlist.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              isWishlisted
              onWishlist={(id) => toggleMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
