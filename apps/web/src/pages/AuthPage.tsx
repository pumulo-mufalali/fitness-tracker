import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import SignUpForm from '../components/SignUpForm';
import AppTitle from '../components/AppTitle';
import { useAuth } from '../providers/auth-provider';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already logged in, send to dashboard
  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated]);

  const handleAuthSuccess = (userData: any) => {
    login({
      uid: userData.uid,
      name: userData.displayName || userData.email?.split('@')[0] || 'User',
      email: userData.email,
      age: 0,
      weightKg: 0,
      heightCm: 0,
      theme: 'light',
      fitnessGoal: 'Not yet set',
    });
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 gradient-elegant-light dark:gradient-elegant-dark">
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <AppTitle className="text-3xl sm:text-4xl lg:text-5xl" />
        </motion.div>

        <motion.div
          key={isLogin ? 'login' : 'signup'}
          initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isLogin ? (
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSwitchToSignUp={() => setIsLogin(false)}
            />
          ) : (
            <SignUpForm
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setIsLogin(true)}
            />
          )}
        </motion.div>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Just browsing?{' '}
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Continue without signing in
          </button>
        </p>
      </div>
    </div>
  );
}

