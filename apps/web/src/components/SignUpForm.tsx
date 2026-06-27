import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface SignUpFormProps {
  onSuccess?: (user: any) => void;
  onSwitchToLogin: () => void;
  isLoading?: boolean;
}

export default function SignUpForm({ onSuccess, onSwitchToLogin, isLoading: externalLoading = false }: SignUpFormProps) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
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
    const newErrors: typeof errors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/email-already-in-use': return 'An account with this email already exists';
      case 'auth/invalid-email': return 'Invalid email address';
      case 'auth/weak-password': return 'Password is too weak. Please choose a stronger password';
      case 'auth/network-request-failed': return 'Network error. Please check your connection';
      default: return 'Failed to create account. Please try again';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: formData.name });
      sessionStorage.setItem('myfitness_just_logged_in', 'true');
      if (onSuccess) {
        onSuccess({ uid: user.uid, email: user.email, displayName: formData.name, emailVerified: user.emailVerified });
      }
    } catch (error: any) {
      setErrors({ general: getErrorMessage(error.code) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field] || errors.general) {
      setErrors(prev => ({ ...prev, [field]: undefined, general: undefined }));
    }
  };

  const isFormLoading = isLoading || externalLoading;

  const inputClass = (error?: string) =>
    `block w-full px-3 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm ${
      error
        ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600'
        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
    }`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-sm mx-auto"
    >
      <div className="bg-white dark:bg-gray-900 shadow-md rounded-xl p-5 sm:p-8 border border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-8 text-center">
          Create account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Full name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange('name')}
              className={inputClass(errors.name)}
              placeholder="Your name"
            />
            {errors.name && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              className={inputClass(errors.email)}
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
                value={formData.password}
                onChange={handleInputChange('password')}
                className={`${inputClass(errors.password)} pr-10`}
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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                className={`${inputClass(errors.confirmPassword)} pr-10`}
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.confirmPassword}</p>}
          </div>

          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2">
              <p className="text-xs text-red-600 dark:text-red-400">{errors.general}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isFormLoading}
            className="w-full flex justify-center py-2.5 px-4 text-sm font-semibold text-white rounded-lg bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isFormLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Creating account...
              </div>
            ) : 'Create account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
}