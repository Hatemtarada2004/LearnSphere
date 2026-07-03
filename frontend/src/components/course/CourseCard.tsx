import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Clock, Heart } from 'lucide-react';
import { Course } from '../../types';
import { StarRating } from '../ui/StarRating';
import { Badge } from '../ui/Badge';
import {
  formatPrice,
  formatDuration,
  getLevelColor,
  getLevelLabel,
  getCategoryLabel,
  getAvatarUrl,
  cn,
} from '../../utils';

interface CourseCardProps {
  course: Course;
  onWishlist?: (courseId: string) => void;
  isWishlisted?: boolean;
  enrolled?: boolean;
  progress?: number;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onWishlist,
  isWishlisted = false,
  enrolled = false,
  progress,
}) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="card overflow-hidden p-0 group"
    >
      {/* Thumbnail */}
      <Link to={`/courses/${course._id}`} className="block relative">
        <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-violet-100 dark:from-primary-950 dark:to-violet-950">
              <span className="text-4xl font-bold text-primary-300 dark:text-primary-700">
                {course.title.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {enrolled && (
          <div className="absolute top-3 left-3">
            <Badge variant="success">Enrolled</Badge>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-5">
        {/* Category & Level */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {getCategoryLabel(course.category)}
          </span>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', getLevelColor(course.level))}>
            {getLevelLabel(course.level)}
          </span>
        </div>

        {/* Title */}
        <Link to={`/courses/${course._id}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {course.title}
          </h3>
        </Link>

        {/* Instructor */}
        {course.createdBy && typeof course.createdBy === 'object' && (
          <div className="flex items-center gap-2 mb-3">
            <img
              src={getAvatarUrl(
                course.createdBy.avatar || '',
                course.createdBy.firstName,
                course.createdBy.lastName
              )}
              alt={course.createdBy.firstName}
              className="h-5 w-5 rounded-full"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {course.createdBy.firstName} {course.createdBy.lastName}
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 mb-3">
          {course.totalRatings > 0 && (
            <StarRating rating={course.rating} totalRatings={course.totalRatings} size="sm" />
          )}
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <Users className="h-3 w-3" />
            <span>{course.totalStudents.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <Clock className="h-3 w-3" />
            <span>{formatDuration(course.duration)}</span>
          </div>
        </div>

        {/* Progress bar */}
        {enrolled && progress !== undefined && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-violet-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Price & Actions */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {formatPrice(course.price)}
          </span>

          <div className="flex items-center gap-2">
            {onWishlist && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onWishlist(course._id);
                }}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  isWishlisted
                    ? 'text-rose-500 bg-rose-50 dark:bg-rose-950'
                    : 'text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950'
                )}
              >
                <Heart className={cn('h-4 w-4', isWishlisted && 'fill-current')} />
              </button>
            )}

            <Link
              to={`/courses/${course._id}`}
              className="btn btn-primary btn-sm"
            >
              {enrolled ? 'Continue' : 'View Course'}
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
