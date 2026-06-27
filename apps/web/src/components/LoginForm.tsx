import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, X, CheckCircle, AlertCircle } from 'lucide-react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getFirebaseAuthErrorMessage } from '../utils/error-handler';

interface LoginFormProps {
  onSuccess?: (user: any) => void;
  onSwitchToSignUp: () => void;
  isLoading?: boolean;
}

export default function LoginForm({ onSuccess, onSwitchToSignUp, isLoading: externalLoading = false }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetError, setResetError] = useState<string>('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; general?: string } = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found': return 'No account found with this email address';
      case 'auth/wrong-password': return 'Incorrect password';
      case 'auth/invalid-email': return 'Invalid email address';
      case 'auth/user-disabled': return 'This account has been disabled';
      case 'auth/too-many-requests': return 'Too many failed attempts. Please try again later';
      case 'auth/network-request-failed': return 'Network error. Please check your connection';
      default: return 'Invalid credentials. Please try again';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      sessionStorage.setItem('myfitness_just_logged_in', 'true');
      if (onSuccess) {
        onSuccess({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || email.split('@')[0],
          emailVerified: user.emailVerified,
        });
      }
    } catch (error: any) {
      setErrors({ general: getErrorMessage(error.code) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: 'email' | 'password') => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (field === 'email') setEmail(e.target.value);
    else setPassword(e.target.value);
    if (errors[field] || errors.general) {
      setErrors(prev => ({ ...prev, [field]: undefined, general: undefined }));
    }
  };

  const handleForgotPassword = () => {
    setShowPasswordResetModal(true);
    setResetEmail(email || '');
    setResetError('');
    setResetSuccess(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !/\S+@\S+\.\S+/.test(resetEmail)) {
      setResetError('Please enter a valid email address');
      return;
    }
    setIsSendingReset(true);
    setResetError('');
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim(), {
        url: window.location.origin,
        handleCodeInApp: false,
      });
      setResetSuccess(true);
    } catch (error: any) {
      setResetError(error.code ? getFirebaseAuthErrorMessage(error.code) : 'Failed to send reset email. Please try again.');
    } finally {
      setIsSendingReset(false);
    }
  };

  const closePasswordResetModal = () => {
    setShowPasswordResetModal(false);
    setResetEmail('');
    setResetError('');
    setResetSuccess(false);
  };

  const isFormLoading = isLoading || externalLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-sm mx-auto"
    >
      <div className="bg-white dark:bg-gray-900 shadow-md rounded-xl p-5 sm:p-8 border border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-8 text-center">
          Welcome back
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleInputChange('email')}
              className={`block w-full px-3 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm ${
                errors.email
                  ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
              }`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handleInputChange('password')}
                className={`block w-full px-3 py-2.5 pr-10 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm ${
                  errors.password
                    ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                }`}
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.password}</p>}
          </div>

          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2">
              <p className="text-xs text-red-600 dark:text-red-400">{errors.general}</p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isFormLoading}
            className="w-full flex justify-center py-2.5 px-4 text-sm font-semibold text-white rounded-lg bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isFormLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Signing in...
              </div>
            ) : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignUp}
              className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>

      <AnimatePresence>
        {showPasswordResetModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePasswordResetModal}
              className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-gray-900 shadow-md rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-sm p-6 relative">
                <button
                  onClick={closePasswordResetModal}
                  className="absolute top-4 right-4 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>

                {resetSuccess ? (
                  <div className="text-center py-2">
                    <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-4" />
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Check your email</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
                      A reset link was sent to <span className="font-medium text-gray-900 dark:text-white">{resetEmail}</span>. Check your spam folder if you don't see it.
                    </p>
                    <button
                      onClick={closePasswordResetModal}
                      className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Reset password</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                      Enter your email and we'll send you a reset link.
                    </p>
                    <form onSubmit={handlePasswordReset} className="space-y-4">
                      <input
                        id="reset-email"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => { setResetEmail(e.target.value); setResetError(''); }}
                        className={`block w-full px-3 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm ${
                          resetError
                            ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                        }`}
                        placeholder="you@example.com"
                        disabled={isSendingReset}
                      />
                      {resetError && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                          <p className="text-xs text-red-700 dark:text-red-300">{resetError}</p>
                        </div>
                      )}
                      <button
                        type="submit"
                        disabled={isSendingReset}
                        className="w-full flex justify-center py-2.5 px-4 text-sm font-semibold text-white rounded-lg bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSendingReset ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            Sending...
                          </div>
                        ) : 'Send reset link'}
                      </button>
                      <button
                        type="button"
                        onClick={closePasswordResetModal}
                        className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 font-medium hover:rounded-lg bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        disabled={isSendingReset}
                      >
                        Cancel
                      </button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}