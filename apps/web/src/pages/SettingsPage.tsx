import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../providers/auth-provider';
import { useSettings } from '../providers/settings-provider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../providers/toast-provider';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { getUserFromFirestore, updateUserProfile } from '../lib/firebase-user-service';
import { workoutService, weightService } from '../lib/firebase-data-service';
import { getUserGoals } from '../lib/firebase-goal-service';
import { getUserSchedule } from '../lib/firebase-schedule-service';
import type { User } from '@myfitness/shared';
import { 
  User as UserIcon, 
  Shield, 
  Bell, 
  Palette, 
  Download, 
  Upload, 
  Trash2, 
  Eye, 
  EyeOff,
  Save,
  AlertTriangle,
  CheckCircle,
  Settings as SettingsIcon
} from 'lucide-react';

interface SettingsSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SettingsSection = ({ title, icon, children }: SettingsSectionProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-white dark:bg-gray-800  p-6 shadow-sm border border-gray-200 dark:border-gray-700"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10  bg-blue-600 flex items-center justify-center">
        {icon}
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h2>
    </div>
    {children}
  </motion.div>
);

const SettingItem = ({ 
  label, 
  description, 
  children, 
  warning 
}: { 
  label: string; 
  description?: string; 
  children: React.ReactNode;
  warning?: boolean;
}) => (
  <div className={`p-4  border transition-all duration-200 ${
    warning 
      ? 'border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/20' 
      : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20'
  }`}>
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{label}</h3>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">
        {children}
      </div>
    </div>
  </div>
);

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const settings = useSettings();
  const { showSuccess, showError, showWarning } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  // Fetch user profile
  const { data: profile } = useQuery<User | null>({
    queryKey: ['user', 'profile', user?.uid],
    queryFn: () => getUserFromFirestore(user!.uid),
    enabled: !!user?.uid,
  });

  const currentUser = profile || user;

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (updates: Partial<User>) => updateUserProfile(user!.uid, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile', user?.uid] });
      showSuccess('Settings updated successfully!');
    },
  });

  // Export data function
  const exportData = async () => {
    if (!user?.uid) return;
    
    try {
      const [workoutLogs, weightHistory, goals, schedule] = await Promise.all([
        workoutService.getLogs(user.uid),
        weightService.getHistory(user.uid),
        getUserGoals(user.uid),
        getUserSchedule(user.uid),
      ]);

      const exportData = {
        profile: currentUser,
        workoutLogs,
        weightHistory,
        goals,
        schedule,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `myfitness-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showSuccess('Data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      showError('Failed to export data. Please try again.');
    }
  };

  // Delete account function
  const deleteAccount = async () => {
    if (!user?.uid) return;
    
    try {
      // In a real app, this would call a backend API to delete the account
      showWarning('Account deletion is not implemented yet. Please contact support.');
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Delete account failed:', error);
      showError('Failed to delete account. Please try again.');
    }
  };

  // Change password function
  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      showError('New passwords do not match!');
      return;
    }
    
    if (newPassword.length < 6) {
      showError('Password must be at least 6 characters long!');
      return;
    }

    try {
      // In a real app, this would call Firebase Auth to change password
      showWarning('Password change is not implemented yet. Please use Firebase Auth directly.');
      setShowPasswordChange(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Password change failed:', error);
      showError('Failed to change password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen gradient-modern-light dark:gradient-modern-dark">
      <div className="max-w-4xl mx-auto py-8 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12  bg-blue-600 flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white">
                Settings
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2 font-medium">
                Manage your account preferences and app settings
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-8">
          {/* Account Settings */}
          <SettingsSection title="Account" icon={<UserIcon className="w-5 h-5 text-white" />}>
            <div className="space-y-4">
              <SettingItem 
                label="Email Address" 
                description="Your account email address"
              >
                <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {currentUser?.email || 'Not set'}
                </div>
              </SettingItem>

              <SettingItem 
                label="Display Name" 
                description="Your public display name"
              >
                <input
                  type="text"
                  value={currentUser?.name || ''}
                  onChange={(e) => updateProfileMutation.mutate({ name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600  bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your name"
                />
              </SettingItem>

              <SettingItem 
                label="Change Password" 
                description="Update your account password"
              >
                <button
                  onClick={() => setShowPasswordChange(true)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white  transition-colors duration-200"
                >
                  Change Password
                </button>
              </SettingItem>

              <SettingItem 
                label="Account Deletion" 
                description="Permanently delete your account and all data"
                warning={true}
              >
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white  transition-colors duration-200 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              </SettingItem>
            </div>
          </SettingsSection>

          {/* Privacy Settings */}
          <SettingsSection title="Privacy & Security" icon={<Shield className="w-5 h-5 text-white" />}>
            <div className="space-y-4">
              <SettingItem 
                label="Profile Visibility" 
                description="Control who can see your profile information"
              >
                <select
                  value={settings.privacy}
                  onChange={(e) => settings.setPrivacy(e.target.value as 'private' | 'friends' | 'public')}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600  bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="private">Private</option>
                  <option value="friends">Friends Only</option>
                  <option value="public">Public</option>
                </select>
              </SettingItem>

              <SettingItem 
                label="Data Sharing" 
                description="Allow anonymous usage data to improve the app"
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.dataSharing}
                    onChange={(e) => settings.setDataSharing(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Enable data sharing</span>
                </label>
              </SettingItem>

              <SettingItem 
                label="Activity Tracking" 
                description="Track your workout activities and progress"
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.activityTracking}
                    onChange={(e) => settings.setActivityTracking(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Enable activity tracking</span>
                </label>
              </SettingItem>
            </div>
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection title="Notifications" icon={<Bell className="w-5 h-5 text-white" />}>
            <div className="space-y-4">
              <SettingItem 
                label="Workout Reminders" 
                description="Get notified about scheduled workouts"
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.workoutReminders}
                    onChange={(e) => settings.setNotifications({ workoutReminders: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Enable reminders</span>
                </label>
              </SettingItem>

              <SettingItem 
                label="Goal Achievements" 
                description="Celebrate when you reach your fitness goals"
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.goalAchievements}
                    onChange={(e) => settings.setNotifications({ goalAchievements: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Enable achievement notifications</span>
                </label>
              </SettingItem>

              <SettingItem 
                label="Weekly Progress" 
                description="Receive weekly progress summaries"
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.weeklyProgress}
                    onChange={(e) => settings.setNotifications({ weeklyProgress: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Enable weekly summaries</span>
                </label>
              </SettingItem>
            </div>
          </SettingsSection>

          {/* App Settings */}
          <SettingsSection title="App Preferences" icon={<Palette className="w-5 h-5 text-white" />}>
            <div className="space-y-4">
              <SettingItem 
                label="Theme" 
                description="Choose your preferred color theme"
              >
                <select
                  value={settings.theme}
                  onChange={(e) => settings.setTheme(e.target.value as 'light' | 'dark' | 'system')}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600  bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </SettingItem>

              <SettingItem 
                label="Units" 
                description="Choose your preferred measurement units"
              >
                <select
                  value={settings.units}
                  onChange={(e) => settings.setUnits(e.target.value as 'metric' | 'imperial')}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600  bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="metric">Metric (kg, cm)</option>
                  <option value="imperial">Imperial (lbs, ft)</option>
                </select>
              </SettingItem>

              <SettingItem 
                label="Language" 
                description="Select your preferred language"
              >
                <select
                  value={settings.language}
                  onChange={(e) => settings.setLanguage(e.target.value as 'en' | 'es' | 'fr' | 'de')}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600  bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="en">English</option>
                  <option value="es">EspaÃ±ol</option>
                  <option value="fr">FranÃ§ais</option>
                  <option value="de">Deutsch</option>
                </select>
              </SettingItem>
            </div>
          </SettingsSection>

          {/* Data Management */}
          <SettingsSection title="Data Management" icon={<Download className="w-5 h-5 text-white" />}>
            <div className="space-y-4">
              <SettingItem 
                label="Export Data" 
                description="Download all your fitness data as a JSON file"
              >
                <button
                  onClick={exportData}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white  transition-colors duration-200 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
              </SettingItem>

              <SettingItem 
                label="Import Data" 
                description="Import fitness data from a JSON file"
              >
                <button
                  onClick={() => {
                    // In a real app, this would open a file picker
                    showWarning('Data import is not implemented yet.');
                  }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white  transition-colors duration-200 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Import Data
                </button>
              </SettingItem>

              <SettingItem 
                label="Clear All Data" 
                description="Remove all your workout logs, goals, and progress data"
                warning={true}
              >
                <button
                  onClick={() => {
                    setShowClearDataConfirm(true);
                  }}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white  transition-colors duration-200 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Data
                </button>
              </SettingItem>
            </div>
          </SettingsSection>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPasswordChange(false)} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white dark:bg-gray-800  p-8 shadow-md w-full max-w-md border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Change Password</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600  bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600  bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type={showPasswords ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600  bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPasswordChange(false)}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300  transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={changePassword}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white  transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeleteConfirm(false)} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white dark:bg-gray-800  p-8 shadow-md w-full max-w-md border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12  bg-red-500 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">Delete Account</h3>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete your account? This action cannot be undone and will permanently remove:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                <li>â€¢ All your workout logs and progress</li>
                <li>â€¢ Your goals and achievements</li>
                <li>â€¢ Your schedule and preferences</li>
                <li>â€¢ Your profile information</li>
              </ul>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800  p-4">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                  âš ï¸ This action is permanent and cannot be reversed.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300  transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white  transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <ConfirmDialog
        open={showClearDataConfirm}
        title="Clear All Data"
        message="Are you sure you want to clear all your data? This action cannot be undone."
        confirmText="Clear Data"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          showWarning('Data clearing is not implemented yet.');
          setShowClearDataConfirm(false);
        }}
        onCancel={() => setShowClearDataConfirm(false)}
      />
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data."
        confirmText="Delete Account"
        cancelText="Cancel"
        variant="danger"
        onConfirm={deleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
