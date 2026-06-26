import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LoginForm from '../components/LoginForm';
import SignUpForm from '../components/SignUpForm';
import { useAuth } from '../providers/auth-provider';

interface AuthPageProps {
  onAuthSuccess: (user: any) => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleAuthSuccess = (userData: any) => {
    // Convert Firebase user data to our app's user format
    const appUser = {
      uid: userData.uid,
      name: userData.displayName || userData.email?.split('@')[0] || 'User',
      email: userData.email,
      age: 0,
      weightKg: 0,
      heightCm: 0,
      theme: "system",
      fitnessGoal: "Not yet set"
    };
    
    login(appUser);
    onAuthSuccess(appUser);
  };

  return (
    <div className="min-h-screen gradient-elegant-light dark:gradient-elegant-dark flex items-center justify-center p-6">
      {/* Modern Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/10 dark:bg-blue-900/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-60 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200/10 dark:bg-indigo-900/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-60 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 left-1/2 w-96 h-96 bg-emerald-200/10 dark:bg-emerald-900/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-60 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo and Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <h1 className="text-5xl font-black text-gray-900 dark:text-white">
              FITNESS TRACKER
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
            Your personal fitness companion
          </p>
        </motion.div>

        {/* Auth Form */}
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
              isLoading={isLoading}
            />
          ) : (
            <SignUpForm
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setIsLogin(true)}
              isLoading={isLoading}
            />
          )}
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-medium">
            Track your progress, log workouts, and achieve your fitness goals
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-lg">ðŸ“Š</span>
              <span>Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">ðŸ‹ï¸</span>
              <span>Workouts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">ðŸ“ˆ</span>
              <span>Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">ðŸŽ¯</span>
              <span>Goals</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
