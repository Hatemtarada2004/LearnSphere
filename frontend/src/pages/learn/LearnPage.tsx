import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  Menu,
  X,
  BookOpen,
  Award,
  ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { enrollmentService } from '../../services/enrollment.service';
import { lessonService } from '../../services/lesson.service';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { cn, formatDuration, extractApiError } from '../../utils';

export const LearnPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openModules, setOpenModules] = useState<Set<string>>(new Set());

  const { data, isLoading, error } = useQuery({
    queryKey: ['enrollment-details', courseId],
    queryFn: () => enrollmentService.getEnrollmentDetails(courseId!),
    enabled: !!courseId,
  });

  const { data: currentLesson } = useQuery({
    queryKey: ['lesson', currentLessonId],
    queryFn: () => lessonService.getLessonById(currentLessonId!),
    enabled: !!currentLessonId,
  });

  const completeMutation = useMutation({
    mutationFn: () => lessonService.markComplete(currentLessonId!),
    onSuccess: (result) => {
      queryClient.setQueryData(['enrollment-details', courseId], (old: typeof data) => {
        if (!old) return old;
        return {
          ...old,
          enrollment: {
            ...old.enrollment,
            progress: result.progress,
            completedLessons: result.completedLessons,
          },
        };
      });
      if (result.progress === 100) {
        toast.success('🎉 Congratulations! You completed the course!', { duration: 5000 });
      }
    },
    onError: (error) => toast.error(extractApiError(error)),
  });

  // Set initial lesson
  useEffect(() => {
    if (data && !currentLessonId) {
      const lastLessonId = data.enrollment.lastLesson as unknown as string | undefined;
      if (lastLessonId) {
        setCurrentLessonId(lastLessonId);
      } else {
        const firstLesson = data.curriculum[0]?.lessons[0];
        if (firstLesson) setCurrentLessonId(firstLesson._id);
      }

      // Open first module by default
      if (data.curriculum[0]) {
        setOpenModules(new Set([data.curriculum[0]._id]));
      }
    }
  }, [data, currentLessonId]);

  const allLessons = data?.curriculum.flatMap((m) => m.lessons) || [];
  const currentIndex = allLessons.findIndex((l) => l._id === currentLessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const completedSet = new Set(data?.enrollment.completedLessons || []);
  const isCurrentCompleted = currentLessonId ? completedSet.has(currentLessonId) : false;

  const toggleModule = (moduleId: string) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-gray-500">Unable to load course. You may not be enrolled.</p>
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <>
        {/* Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        <motion.aside
          animate={{ x: sidebarOpen || window.innerWidth >= 1024 ? 0 : -360 }}
          className={cn(
            'fixed lg:static top-0 left-0 h-full w-80 bg-gray-900 border-r border-gray-800 z-30 flex flex-col',
            'lg:translate-x-0'
          )}
          style={{
            transform: window.innerWidth < 1024 && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
          }}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div>
              <p className="font-semibold text-sm truncate">{data.course.title}</p>
              <ProgressBar value={data.enrollment.progress} size="sm" className="mt-2" />
              <p className="text-xs text-gray-400 mt-1">{data.enrollment.progress}% complete</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-800 text-gray-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Course Curriculum */}
          <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
            {data.curriculum.map((module) => (
              <div key={module._id}>
                <button
                  onClick={() => toggleModule(module._id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-800 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-200 pr-2">{module.title}</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-gray-400 flex-shrink-0 transition-transform',
                      openModules.has(module._id) && 'rotate-180'
                    )}
                  />
                </button>

                <AnimatePresence>
                  {openModules.has(module._id) && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      {module.lessons.map((lesson) => {
                        const isCompleted = completedSet.has(lesson._id);
                        const isCurrent = lesson._id === currentLessonId;
                        return (
                          <button
                            key={lesson._id}
                            onClick={() => {
                              setCurrentLessonId(lesson._id);
                              setSidebarOpen(false);
                            }}
                            className={cn(
                              'w-full flex items-start gap-3 px-5 py-2.5 text-left transition-colors',
                              isCurrent
                                ? 'bg-primary-900/40 text-primary-300'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                            )}
                          >
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            ) : (
                              <Circle className={cn('h-4 w-4 mt-0.5 flex-shrink-0', isCurrent ? 'text-primary-400' : 'text-gray-600')} />
                            )}
                            <div className="min-w-0">
                              <p className="text-xs leading-snug line-clamp-2">{lesson.title}</p>
                              <p className="text-2xs text-gray-600 mt-0.5">{formatDuration(lesson.duration)}</p>
                            </div>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Certificate */}
          {data.enrollment.progress === 100 && (
            <div className="p-4 border-t border-gray-800">
              <Button size="sm" className="w-full" leftIcon={<Award className="h-4 w-4" />}>
                Download Certificate
              </Button>
            </div>
          )}
        </motion.aside>
      </>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-4 h-14 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-800 text-gray-400"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Dashboard
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 hidden sm:block">
              {Math.round((completedSet.size / allLessons.length) * 100)}% complete
            </span>

            {currentLessonId && !isCurrentCompleted && (
              <Button
                size="sm"
                leftIcon={<CheckCircle className="h-4 w-4" />}
                onClick={() => completeMutation.mutate()}
                isLoading={completeMutation.isPending}
              >
                Mark Complete
              </Button>
            )}
          </div>
        </header>

        {/* Video Player */}
        <div className="flex-1 overflow-y-auto">
          {currentLesson ? (
            <div>
              {currentLesson.videoUrl ? (
                <div className="aspect-video bg-black">
                  <iframe
                    src={currentLesson.videoUrl}
                    className="w-full h-full"
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                    title={currentLesson.title}
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gray-900 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-3" />
                    <p>No video for this lesson</p>
                  </div>
                </div>
              )}

              <div className="max-w-4xl mx-auto px-6 py-8">
                <h1 className="text-2xl font-bold mb-2">{currentLesson.title}</h1>

                {isCurrentCompleted && (
                  <div className="flex items-center gap-2 text-emerald-400 mb-4">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Completed</span>
                  </div>
                )}

                {/* Resources */}
                {currentLesson.resources.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3 text-gray-300">Resources</h3>
                    <div className="space-y-2">
                      {currentLesson.resources.map((resource, i) => (
                        <a
                          key={i}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
                        >
                          <BookOpen className="h-4 w-4" />
                          {resource.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-800">
                  <Button
                    variant="secondary"
                    disabled={!prevLesson}
                    leftIcon={<ChevronLeft className="h-4 w-4" />}
                    onClick={() => prevLesson && setCurrentLessonId(prevLesson._id)}
                    className="dark"
                  >
                    Previous
                  </Button>

                  <Button
                    disabled={!nextLesson}
                    rightIcon={<ChevronRight className="h-4 w-4" />}
                    onClick={() => nextLesson && setCurrentLessonId(nextLesson._id)}
                  >
                    Next Lesson
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>Select a lesson from the sidebar to start learning</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
