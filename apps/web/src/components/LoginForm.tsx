import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, X, CheckCircle, AlertCircle } from 'lucide-react';
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
  
  // Password reset state
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetError, setResetError] = useState<string>('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; general?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      default:
        return 'Invalid credentials. Please try again';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user object for the parent component
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || email.split('@')[0],
        emailVerified: user.emailVerified
      };

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(userData);
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      setErrors({
        general: getErrorMessage(error.code)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: 'email' | 'password') => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (field === 'email') {
      setEmail(e.target.value);
    } else {
      setPassword(e.target.value);
    }
    
    // Clear errors when user starts typing
    if (errors[field] || errors.general) {
      setErrors(prev => ({ ...prev, [field]: undefined, general: undefined }));
    }
  };

  // Handle password reset
  const handleForgotPassword = () => {
    setShowPasswordResetModal(true);
    setResetEmail(email || ''); // Pre-fill with current email if available
    setResetError('');
    setResetSuccess(false);
  };

  const validateResetEmail = (emailValue: string): { valid: boolean; error?: string } => {
    if (!emailValue || emailValue.trim().length === 0) {
      return { valid: false, error: 'Email is required' };
    }
    
    if (!/\S+@\S+\.\S+/.test(emailValue)) {
      return { valid: false, error: 'Please enter a valid email address' };
    }

    return { valid: true };
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    const validation = validateResetEmail(resetEmail);
    if (!validation.valid) {
      setResetError(validation.error || 'Invalid email');
      return;
    }

    setIsSendingReset(true);
    setResetError('');
    setResetSuccess(false);

    try {
      const trimmedEmail = resetEmail.trim();
      
      // Additional validation
      if (!trimmedEmail || trimmedEmail.length === 0) {
        throw new Error('Email cannot be empty');
      }

      // Check if auth is properly initialized
      if (!auth) {
        throw new Error('Authentication service not available. Please refresh the page.');
      }

      console.log('Sending password reset email to:', trimmedEmail);
      
      // Firebase sends reset emails even for non-existent users to prevent email enumeration
      // But the email might not arrive if the user doesn't exist
      await sendPasswordResetEmail(auth, trimmedEmail, {
        url: window.location.origin,
        handleCodeInApp: false,
      });
      
      console.log('Password reset email sent successfully');
      
      // Enhanced success message with troubleshooting tips
      setResetSuccess(true);
      // Clear email after successful reset for security
      setTimeout(() => {
        setResetEmail('');
      }, 5000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        name: error.name
      });
      
      // Handle specific Firebase errors
      if (error.code) {
        const errorMessage = getFirebaseAuthErrorMessage(error.code);
        setResetError(errorMessage);
      } else if (error.message) {
        setResetError(error.message);
      } else {
        setResetError('Failed to send reset email. Please try again or contact support.');
      }
      setResetSuccess(false);
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
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="bg-white dark:bg-gray-900  shadow-md p-10 border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3">
            Welcome Back
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
            Sign in to continue your fitness journey
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={handleInputChange('email')}
                className={`block w-full pl-12 pr-4 py-4 border-2  focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-medium ${
                  errors.email 
                    ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handleInputChange('password')}
                className={`block w-full pl-12 pr-14 py-4 border-2  focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-medium ${
                  errors.password 
                    ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-100 dark:hover:bg-gray-700  transition-colors duration-200"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">{errors.password}</p>
            )}
          </div>

          {/* General Error Message */}
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800  p-4">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">{errors.general}</p>
            </div>
          )}

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Remember me
              </label>
            </div>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isFormLoading}
            className="w-full flex justify-center py-4 px-6 border border-transparent  shadow-sm text-lg font-bold text-white bg-blue-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isFormLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </motion.button>
        </form>

        {/* Switch to Sign Up */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignUp}
              className="font-bold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>

      {/* Password Reset Modal */}
      <AnimatePresence>
        {showPasswordResetModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePasswordResetModal}
              className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white/95 dark:bg-gray-900/95  shadow-md border border-gray-200 dark:border-gray-700 w-full max-w-md p-8 relative">
                {/* Close Button */}
                <button
                  onClick={closePasswordResetModal}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>

                {/* Success State */}
                {resetSuccess ? (
                  <div className="text-center py-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      Check Your Email
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      We've sent a password reset link to <span className="font-semibold text-gray-900 dark:text-white">{resetEmail}</span>
                    </p>
                    <div className="text-sm text-gray-500 dark:text-gray-500 mb-6 space-y-2">
                      <p className="font-semibold">Next steps:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Check your inbox (emails usually arrive within 1-2 minutes)</li>
                        <li>Check your <span className="font-semibold">spam/junk folder</span> - Firebase emails sometimes go there</li>
                        <li>Look for emails from <span className="font-semibold">noreply@pumulo-12eb1.firebaseapp.com</span></li>
                        <li>If using Gmail, check the "Promotions" or "Updates" tab</li>
                        <li>The link expires in 1 hour</li>
                        <li>Make sure this email is registered to your account</li>
                      </ul>
                      <p className="mt-3 text-xs italic">
                        If you don't receive the email after 5 minutes, try again or contact support.
                      </p>
                    </div>
                    <button
                      onClick={closePasswordResetModal}
                      className="w-full py-3 px-6 bg-blue-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold  transition-all duration-300 shadow-lg hover:shadow-sm"
                    >
                      Got it
                    </button>
                  </div>
                ) : (
                  /* Reset Form */
                  <>
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Reset Password
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Enter your email address and we'll send you a link to reset your password.
                      </p>
                    </div>

                    <form onSubmit={handlePasswordReset} className="space-y-6">
                      {/* Email Input */}
                      <div>
                        <label htmlFor="reset-email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            id="reset-email"
                            type="email"
                            value={resetEmail}
                            onChange={(e) => {
                              setResetEmail(e.target.value);
                              setResetError('');
                            }}
                            className={`block w-full pl-12 pr-4 py-4 border-2  focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-medium ${
                              resetError
                                ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600'
                                : 'border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                            placeholder="Enter your email"
                            disabled={isSendingReset}
                          />
                        </div>
                      </div>

                      {/* Error Message */}
                      {resetError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 "
                        >
                          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                          <p className="text-sm text-red-800 dark:text-red-200 font-medium">{resetError}</p>
                        </motion.div>
                      )}

                      {/* Submit Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isSendingReset}
                        className="w-full flex justify-center py-4 px-6 border border-transparent  shadow-sm text-lg font-bold text-white bg-blue-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        {isSendingReset ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                            Sending...
                          </div>
                        ) : (
                          'Send Reset Link'
                        )}
                      </motion.button>

                      {/* Cancel Button */}
                      <button
                        type="button"
                        onClick={closePasswordResetModal}
                        className="w-full py-3 px-6 border-2 border-gray-300 dark:border-gray-600  text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
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
