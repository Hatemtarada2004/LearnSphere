import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authService } from '../../services/auth.service';

export const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }
      try {
        const msg = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(msg);
      } catch {
        setStatus('error');
        setMessage('This verification link is invalid or has expired.');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card p-10 max-w-md w-full text-center"
      >
        {status === 'loading' && (
          <>
            <Loader2 className="h-16 w-16 text-primary-500 animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verifying Email</h1>
            <p className="text-gray-500 dark:text-gray-400">Please wait while we verify your email address...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Email Verified!</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{message}</p>
            <Link to="/login" className="btn btn-primary btn-lg w-full justify-center">
              Continue to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verification Failed</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{message}</p>
            <Link to="/login" className="btn btn-secondary btn-lg w-full justify-center">
              Back to Login
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
};
