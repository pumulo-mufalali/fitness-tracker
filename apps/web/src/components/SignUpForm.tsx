import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface SignUpFormProps {
  onSuccess?: (user: any) => void;
  onSwitchToLogin: () => void;
  isLoading?: boolean;
}

export default function SignUpForm({ onSuccess, onSwitchToLogin, isLoading: externalLoading = false }: SignUpFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ 
    name?: string; 
    email?: string; 
    password?: string; 
    confirmPassword?: string;
    general?: string;
  }>({});

  const validateForm = () => {
    const newErrors: { 
      name?: string; 
      email?: string; 
      password?: string; 
      confirmPassword?: string;
      general?: string;
    } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose a stronger password';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      default:
        return 'Failed to create account. Please try again';
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
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      // Update the user's display name
      await updateProfile(user, {
        displayName: formData.name
      });
      
      // Create user object for the parent component
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: formData.name,
        emailVerified: user.emailVerified
      };

      // Call success callback if provided
      if (onSuccess) {
        onSuccess(userData);
      }
      
    } catch (error: any) {
      console.error('Signup error:', error);
      setErrors({
        general: getErrorMessage(error.code)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (errors[field] || errors.general) {
      setErrors(prev => ({ ...prev, [field]: undefined, general: undefined }));
    }
  };

  const isFormLoading = isLoading || externalLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl  shadow-2xl p-10 border border-gray-200/50 dark:border-gray-700/50">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3">
            Create Account
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
            Start your fitness journey today
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange('name')}
                className={`block w-full pl-12 pr-4 py-4 border-2  focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 font-medium ${
                  errors.name 
                    ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                placeholder="Enter your full name"
              />
            </div>
            {errors.name && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">{errors.name}</p>
            )}
          </div>

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
                value={formData.email}
                onChange={handleInputChange('email')}
                className={`block w-full pl-12 pr-4 py-4 border-2  focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 font-medium ${
                  errors.email 
                    ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500'
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
                value={formData.password}
                onChange={handleInputChange('password')}
                className={`block w-full pl-12 pr-14 py-4 border-2  focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 font-medium ${
                  errors.password 
                    ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                placeholder="Create a password"
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

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                className={`block w-full pl-12 pr-14 py-4 border-2  focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 font-medium ${
                  errors.confirmPassword 
                    ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-900 dark:text-white hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-100 dark:hover:bg-gray-700  transition-colors duration-200"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">{errors.confirmPassword}</p>
            )}
          </div>

          {/* General Error Message */}
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800  p-4">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">{errors.general}</p>
            </div>
          )}

          {/* Terms and Conditions */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-gray-700 dark:text-gray-300 font-medium">
                I agree to the{' '}
                <button type="button" className="text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 font-semibold">
                  Terms and Conditions
                </button>{' '}
                and{' '}
                <button type="button" className="text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 font-semibold">
                  Privacy Policy
                </button>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isFormLoading}
            className="w-full flex justify-center py-4 px-6 border border-transparent  shadow-xl text-lg font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isFormLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                Creating account...
              </div>
            ) : (
              'Create Account'
            )}
          </motion.button>
        </form>

        {/* Switch to Login */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors duration-200"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
