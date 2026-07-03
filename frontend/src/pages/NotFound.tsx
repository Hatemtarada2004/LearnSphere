import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        {/* Animated 404 */}
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          className="mb-8"
        >
          <span className="text-[8rem] font-black leading-none gradient-text">404</span>
        </motion.div>

        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => window.history.back()}
            variant="secondary"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Go Back
          </Button>
          <Link to="/">
            <Button leftIcon={<Home className="h-4 w-4" />}>
              Home
            </Button>
          </Link>
          <Link to="/courses">
            <Button variant="outline" leftIcon={<Search className="h-4 w-4" />}>
              Browse Courses
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
