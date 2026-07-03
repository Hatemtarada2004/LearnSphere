import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Play,
  Star,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Zap,
  Globe,
  Shield,
} from 'lucide-react';
import { courseService } from '../services/course.service';
import { CourseCard } from '../components/course/CourseCard';
import { CourseCardSkeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { getCategoryLabel } from '../utils';

const CATEGORIES = [
  { id: 'development', emoji: '💻', color: 'from-blue-500 to-cyan-500' },
  { id: 'design', emoji: '🎨', color: 'from-purple-500 to-pink-500' },
  { id: 'business', emoji: '📈', color: 'from-green-500 to-teal-500' },
  { id: 'marketing', emoji: '📣', color: 'from-orange-500 to-red-500' },
  { id: 'photography', emoji: '📷', color: 'from-yellow-500 to-orange-500' },
  { id: 'music', emoji: '🎵', color: 'from-indigo-500 to-purple-500' },
  { id: 'health', emoji: '🏃', color: 'from-teal-500 to-emerald-500' },
  { id: 'finance', emoji: '💰', color: 'from-yellow-400 to-amber-500' },
];

const STATS = [
  { icon: Users, value: '50,000+', label: 'Students Enrolled' },
  { icon: BookOpen, value: '500+', label: 'Expert Courses' },
  { icon: Award, value: '200+', label: 'Certificates Issued' },
  { icon: Star, value: '4.8/5', label: 'Average Rating' },
];

const FEATURES = [
  {
    icon: Zap,
    title: 'Learn at Your Own Pace',
    description: 'Access course materials anytime, anywhere. Study on your schedule.',
    color: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  },
  {
    icon: Globe,
    title: 'World-Class Instructors',
    description: 'Learn from industry professionals with real-world experience.',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  },
  {
    icon: Award,
    title: 'Earn Certificates',
    description: 'Get recognized for your achievements with verified certificates.',
    color: 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400',
  },
  {
    icon: Shield,
    title: 'Lifetime Access',
    description: 'Buy once, access forever. Including all future updates.',
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
  },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const { data: featuredCourses, isLoading } = useQuery({
    queryKey: ['featured-courses'],
    queryFn: courseService.getFeaturedCourses,
  });

  const { data: categoryStats } = useQuery({
    queryKey: ['course-categories'],
    queryFn: courseService.getCoursesByCategory,
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary-950 to-violet-950 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0xMnY2aDZ2LTZoLTZ6bTAtMTJ2Nmg2di02aC02em0tMTIgMTJ2Nmg2di02aC02em0wLTEydjZoNnYtNmgtNnptMTIgMHY2aDZ2LTZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />

        <div className="container-custom relative py-28 lg:py-40">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20">
                <TrendingUp className="h-4 w-4 text-primary-300" />
                <span className="text-sm text-primary-200">Over 50,000 students trust LearnSphere</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight mb-6">
                Learn Without
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-300 via-violet-300 to-pink-300">
                  Limits
                </span>
              </h1>

              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                Expand your knowledge with expert-led courses in development, design, business, and more.
                Join a global community of learners today.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="xl"
                  onClick={() => navigate('/courses')}
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                >
                  Explore Courses
                </Button>
                <Button
                  size="xl"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                  leftIcon={<Play className="h-5 w-5" />}
                  onClick={() => navigate('/register')}
                >
                  Start for Free
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L48 74.7C96 69.3 192 58.7 288 53.3C384 48 480 48 576 53.3C672 58.7 768 69.3 864 69.3C960 69.3 1056 58.7 1152 53.3C1248 48 1344 48 1392 48L1440 48V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z" fill="currentColor" className="text-white dark:text-gray-950" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map(({ icon: Icon, value, label }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="flex justify-center mb-3">
                  <div className="p-3 rounded-2xl bg-primary-100 dark:bg-primary-950">
                    <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">{value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-heading mb-4">Browse by Category</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Discover courses across a wide range of topics taught by industry experts
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, i) => {
              const count = categoryStats?.find((c) => c._id === cat.id)?.count || 0;
              return (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => navigate(`/courses?category=${cat.id}`)}
                  className="group p-5 rounded-2xl bg-white dark:bg-gray-800 shadow-soft hover:shadow-card-hover transition-all text-left border border-transparent hover:border-primary-200 dark:hover:border-primary-800"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform`}>
                    {cat.emoji}
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm">
                    {getCategoryLabel(cat.id)}
                  </div>
                  {count > 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {count} courses
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-heading mb-2">Featured Courses</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Hand-picked courses to jumpstart your learning journey
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/courses')}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="hidden sm:flex"
            >
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <CourseCardSkeleton key={i} />)
              : featuredCourses?.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
          </div>

          <div className="text-center mt-10 sm:hidden">
            <Button onClick={() => navigate('/courses')}>Browse All Courses</Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-heading mb-4">Why Choose LearnSphere?</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              We provide the tools and environment you need to learn effectively
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, description, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-6 text-center hover:shadow-card-hover transition-shadow"
              >
                <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-primary-600 via-violet-600 to-purple-700 text-white">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Start Your Learning Journey Today
            </h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Join thousands of students already learning on LearnSphere. Create your free account and unlock your potential.
            </p>
            <Button
              size="xl"
              className="bg-white text-primary-700 hover:bg-gray-100 shadow-xl"
              rightIcon={<ArrowRight className="h-5 w-5" />}
              onClick={() => navigate('/register')}
            >
              Get Started for Free
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
