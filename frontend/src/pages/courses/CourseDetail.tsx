import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Users,
  Star,
  Globe,
  Award,
  ChevronDown,
  ChevronUp,
  Play,
  Lock,
  CheckCircle,
  Heart,
  Share2,
  BookOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { courseService } from '../../services/course.service';
import { paymentService } from '../../services/payment.service';
import { enrollmentService } from '../../services/enrollment.service';
import { userService } from '../../services/user.service';
import { StarRating } from '../../components/ui/StarRating';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../context/AuthContext';
import {
  formatPrice,
  formatDuration,
  getLevelLabel,
  getLevelColor,
  getCategoryLabel,
  getAvatarUrl,
  extractApiError,
} from '../../utils';

declare const Razorpay: new (options: Record<string, unknown>) => {
  open: () => void;
  on: (event: string, handler: () => void) => void;
};

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [previewLesson, setPreviewLesson] = useState<{ title: string; videoUrl: string } | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['course', id],
    queryFn: () => courseService.getCourseById(id!),
    enabled: !!id,
  });

  const wishlistMutation = useMutation({
    mutationFn: () => userService.toggleWishlist(id!),
    onSuccess: (result) => {
      setIsWishlisted(result.action === 'added');
      toast.success(result.action === 'added' ? 'Added to wishlist' : 'Removed from wishlist');
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/courses/${id}`);
      return;
    }

    setIsPaymentLoading(true);

    // Free course — enroll directly without payment
    if (course.price === 0) {
      try {
        await enrollmentService.freeEnroll(course._id);
        toast.success('Enrolled successfully!');
        queryClient.invalidateQueries({ queryKey: ['course', id] });
        navigate(`/learn/${course._id}`);
      } catch (err) {
        toast.error(extractApiError(err));
      } finally {
        setIsPaymentLoading(false);
      }
      return;
    }

    try {
      const orderData = await paymentService.createOrder(id!);

      if (!orderData.orderId) {
        throw new Error('Failed to create order');
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);

      script.onload = () => {
        const rzp = new Razorpay({
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'LearnSphere',
          description: orderData.course.title,
          order_id: orderData.orderId,
          handler: async (response: Record<string, string>) => {
            try {
              await paymentService.verifyPayment({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              toast.success('Payment successful! You are now enrolled.');
              queryClient.invalidateQueries({ queryKey: ['course', id] });
              navigate(`/learn/${id}`);
            } catch (err) {
              toast.error(extractApiError(err));
            }
          },
          prefill: {
            name: `${user?.firstName} ${user?.lastName}`,
            email: user?.email,
          },
          theme: { color: '#6366f1' },
          modal: {
            ondismiss: () => setIsPaymentLoading(false),
          },
        });
        rzp.open();
        setIsPaymentLoading(false);
      };
    } catch (err) {
      toast.error(extractApiError(err));
      setIsPaymentLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="bg-gray-900 py-16">
          <div className="container-custom">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-5 w-2/3 mb-6" />
            <div className="flex gap-3">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Course not found</h2>
          <Button onClick={() => navigate('/courses')}>Browse Courses</Button>
        </div>
      </div>
    );
  }

  const { course, curriculum, enrollment, reviews } = data;
  const totalLessons = curriculum.reduce((acc, m) => acc + m.lessons.length, 0);
  const isEnrolled = !!enrollment;

  return (
    <>
    {/* Free Lesson Preview Modal */}
    {previewLesson && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        onClick={() => setPreviewLesson(null)}
      >
        <div
          className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden w-full max-w-3xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-xs text-primary-500 font-semibold uppercase tracking-wider mb-0.5">Free Preview</p>
              <h3 className="font-bold text-gray-900 dark:text-white">{previewLesson.title}</h3>
            </div>
            <button
              onClick={() => setPreviewLesson(null)}
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
            >
              ✕
            </button>
          </div>
          <div className="aspect-video w-full bg-black">
            <iframe
              src={previewLesson.videoUrl}
              title={previewLesson.title}
              className="h-full w-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>
      </div>
    )}
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <section className="bg-gray-900 text-white py-16">
        <div className="container-custom">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="default">{getCategoryLabel(course.category)}</Badge>
              <span className={`badge ${getLevelColor(course.level)}`}>
                {getLevelLabel(course.level)}
              </span>
            </div>

            <h1 className="text-4xl font-black mb-4 leading-tight">{course.title}</h1>
            <p className="text-gray-300 text-lg mb-6">{course.shortDescription}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              {course.totalRatings > 0 && (
                <StarRating rating={course.rating} totalRatings={course.totalRatings} size="sm" />
              )}
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>{course.totalStudents.toLocaleString()} students</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(course.duration)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="h-4 w-4" />
                <span>{course.language}</span>
              </div>
            </div>

            {course.createdBy && (
              <div className="flex items-center gap-2 mt-4">
                <img
                  src={getAvatarUrl(course.createdBy.avatar || '', course.createdBy.firstName, course.createdBy.lastName)}
                  alt={course.createdBy.firstName}
                  className="h-7 w-7 rounded-full"
                />
                <span className="text-gray-400 text-sm">
                  Created by{' '}
                  <span className="text-primary-400 font-medium">
                    {course.createdBy.firstName} {course.createdBy.lastName}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container-custom py-10">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            {course.whatYouLearn.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  What you'll learn
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.whatYouLearn.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle className="h-4 w-4 text-primary-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Curriculum */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Course Curriculum
                </h2>
                <span className="text-sm text-gray-500">
                  {curriculum.length} modules · {totalLessons} lessons
                </span>
              </div>

              <div className="space-y-2">
                {curriculum.map((module) => (
                  <div key={module._id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleModule(module._id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900 dark:text-white">{module.title}</p>
                          <p className="text-xs text-gray-500">{module.lessons.length} lessons</p>
                        </div>
                      </div>
                      {openModules.has(module._id) ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </button>

                    <AnimatePresence>
                      {openModules.has(module._id) && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                            {module.lessons.map((lesson) => {
                              const canPlay = lesson.isFree || isEnrolled;
                              return (
                              <div
                                key={lesson._id}
                                onClick={() => {
                                  if (isEnrolled) {
                                    navigate(`/learn/${course._id}`);
                                  } else if (lesson.isFree && lesson.videoUrl) {
                                    setPreviewLesson({ title: lesson.title, videoUrl: lesson.videoUrl });
                                  }
                                }}
                                className={`flex items-center gap-3 px-4 py-3 text-sm ${canPlay ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors' : ''}`}
                              >
                                {canPlay ? (
                                  <Play className="h-3.5 w-3.5 text-primary-500 flex-shrink-0" />
                                ) : (
                                  <Lock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                )}
                                <span className={`flex-1 ${canPlay ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                                  {lesson.title}
                                </span>
                                {lesson.isFree && !isEnrolled && (
                                  <Badge variant="success">Preview</Badge>
                                )}
                                <span className="text-xs text-gray-400">
                                  {formatDuration(lesson.duration)}
                                </span>
                              </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            {course.requirements.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {course.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instructor */}
            {course.createdBy && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Instructor</h2>
                <div className="flex items-start gap-4">
                  <Avatar
                    firstName={course.createdBy.firstName}
                    lastName={course.createdBy.lastName}
                    avatar={course.createdBy.avatar}
                    size="xl"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-lg">
                      {course.createdBy.firstName} {course.createdBy.lastName}
                    </p>
                    {course.createdBy.bio && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                        {course.createdBy.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Student Reviews</h2>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-gray-900 dark:text-white">{course.rating.toFixed(1)}</span>
                    <span className="text-gray-500">({course.totalRatings})</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="flex gap-3">
                      <Avatar
                        firstName={review.user.firstName}
                        lastName={review.user.lastName}
                        avatar={review.user.avatar}
                        size="sm"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm text-gray-900 dark:text-white">
                            {review.user.firstName} {review.user.lastName}
                          </span>
                          <StarRating rating={review.rating} size="sm" />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Purchase Card */}
          <div className="mt-8 lg:mt-0">
            <div className="sticky top-20">
              <div className="card p-6 space-y-4">
                {/* Thumbnail */}
                <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <Play className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="text-center">
                  <span className="text-4xl font-black text-gray-900 dark:text-white">
                    {formatPrice(course.price)}
                  </span>
                </div>

                {isEnrolled ? (
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => navigate(`/learn/${course._id}`)}
                    leftIcon={<Play className="h-5 w-5" />}
                  >
                    Continue Learning
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleEnroll}
                    isLoading={isPaymentLoading}
                  >
                    {course.price === 0 ? 'Enroll for Free' : 'Buy Now'}
                  </Button>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="md"
                    className="flex-1"
                    leftIcon={<Heart className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />}
                    onClick={() => {
                      if (!isAuthenticated) { navigate('/login'); return; }
                      wishlistMutation.mutate();
                    }}
                  >
                    Wishlist
                  </Button>
                  <Button variant="secondary" size="md" className="flex-1" leftIcon={<Share2 className="h-4 w-4" />}>
                    Share
                  </Button>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">This course includes:</p>
                  {[
                    { icon: Clock, label: `${formatDuration(course.duration)} on-demand video` },
                    { icon: BookOpen, label: `${totalLessons} lessons across ${curriculum.length} modules` },
                    { icon: Globe, label: 'Access on mobile & desktop' },
                    { icon: Award, label: 'Certificate of completion' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Icon className="h-4 w-4 text-primary-500 flex-shrink-0" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};
