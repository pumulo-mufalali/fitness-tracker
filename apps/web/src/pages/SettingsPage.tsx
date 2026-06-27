import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../providers/auth-provider';
import { useSettings } from '../providers/settings-provider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../providers/toast-provider';
import { getUserFromFirestore, updateUserProfile } from '../lib/firebase-user-service';
import type { User } from '@myfitness/shared';

const Row = ({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 py-4 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
    <div>
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
      )}
    </div>
    <div className="sm:ml-6 flex-shrink-0">{children}</div>
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
    {children}
  </p>
);

export default function SettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const settings = useSettings();
  const { showSuccess } = useToast();

  const { data: profile } = useQuery<User | null>({
    queryKey: ['user', 'profile', user?.uid],
    queryFn: () => getUserFromFirestore(user!.uid),
    enabled: !!user?.uid,
  });

  const currentUser = profile || user;

  const updateProfileMutation = useMutation({
    mutationFn: (updates: Partial<User>) => updateUserProfile(user!.uid, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile', user?.uid] });
      showSuccess('Settings updated successfully!');
    },
  });

  const selectClass =
    'px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm';

  return (
    <div className="min-h-[70vh] p-4 sm:p-6">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your account and app preferences
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md"
      >
        {/* Account */}
        <div className="px-4 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-gray-200 dark:border-gray-700">
          <SectionTitle>Account</SectionTitle>
          <Row
            label="Email Address"
            description="Your login email â€” cannot be changed here"
          >
            <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
              {currentUser?.email || 'Not set'}
            </span>
          </Row>
          <Row
            label="Display Name"
            description="Shown in the sidebar and profile header"
          >
            <input
              type="text"
              defaultValue={currentUser?.name || ''}
              onBlur={(e) => {
                if (e.target.value !== currentUser?.name) {
                  updateProfileMutation.mutate({ name: e.target.value });
                }
              }}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Enter your name"
            />
          </Row>
        </div>

        {/* App Preferences */}
        <div className="px-4 sm:px-8 py-4 pb-6 sm:pb-8">
          <SectionTitle>App Preferences</SectionTitle>
          <Row
            label="Theme"
            description="Applies immediately across the entire app"
          >
            <select
              value={settings.theme}
              onChange={(e) => settings.setTheme(e.target.value as 'light' | 'dark' | 'system')}
              className={selectClass}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System default</option>
            </select>
          </Row>
          <Row
            label="Units"
            description="Used for weight and height displays throughout the app"
          >
            <select
              value={settings.units}
              onChange={(e) => settings.setUnits(e.target.value as 'metric' | 'imperial')}
              className={selectClass}
            >
              <option value="metric">Metric (kg, cm)</option>
              <option value="imperial">Imperial (lbs, ft)</option>
            </select>
          </Row>
        </div>
      </motion.div>
    </div>
  );
}