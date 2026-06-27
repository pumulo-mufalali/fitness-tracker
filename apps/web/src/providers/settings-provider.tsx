import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './auth-provider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserFromFirestore, updateUserProfile } from '../lib/firebase-user-service';
import type { User } from '@myfitness/shared';

interface SettingsContextType {
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Units
  units: 'metric' | 'imperial';
  setUnits: (units: 'metric' | 'imperial') => void;
  
  // Language
  language: 'en' | 'es' | 'fr' | 'de';
  setLanguage: (language: 'en' | 'es' | 'fr' | 'de') => void;
  
  // Privacy
  privacy: 'private' | 'friends' | 'public';
  setPrivacy: (privacy: 'private' | 'friends' | 'public') => void;
  
  // Notifications
  notifications: {
    workoutReminders: boolean;
    goalAchievements: boolean;
    weeklyProgress: boolean;
  };
  setNotifications: (notifications: Partial<SettingsContextType['notifications']>) => void;
  
  // Data sharing
  dataSharing: boolean;
  setDataSharing: (enabled: boolean) => void;
  
  // Activity tracking
  activityTracking: boolean;
  setActivityTracking: (enabled: boolean) => void;
  
  // Loading states
  isUpdating: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch user profile with settings
  const { data: profile } = useQuery<User | null>({
    queryKey: ['user', 'profile', user?.uid],
    queryFn: () => getUserFromFirestore(user!.uid),
    enabled: !!user?.uid,
  });

  // Use profile from Firestore if available, otherwise fallback to user from auth
  // Profile will have all User properties including settings
  const currentUser = profile || (user ? {
    ...user,
    units: 'metric' as const,
    language: 'en' as const,
    privacy: 'private' as const,
    notifications: {
      workoutReminders: true,
      goalAchievements: true,
      weeklyProgress: false,
    },
    dataSharing: true,
    activityTracking: true,
  } : null);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (updates: Partial<User>) => updateUserProfile(user!.uid, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile', user?.uid] });
    },
  });

  // Theme management with DOM updates
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem("theme") as 'light' | 'dark' | 'system';
    return saved || currentUser?.theme || 'light';
  });

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem("theme", newTheme);
    }
    
    // Update DOM
    const root = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = newTheme === "dark" || (newTheme === "system" && prefersDark);
    root.classList.toggle("dark", isDark);
    
    // Update user profile and log activity
    if (user?.uid) {
      updateProfileMutation.mutate({ theme: newTheme });
      import('../lib/firebase-user-preferences-service').then(({ logUserActivity }) => {
        logUserActivity(user.uid, {
          type: 'settings_changed',
          metadata: { setting: 'theme', value: newTheme },
        }).catch((err: any) => console.error('Error logging theme activity:', err));
      });
    }
  };

  // Units management
  const units = currentUser?.units || 'metric';
  const setUnits = (newUnits: 'metric' | 'imperial') => {
    if (user?.uid) {
      updateProfileMutation.mutate({ units: newUnits });
      // Log activity
      import('../lib/firebase-user-preferences-service').then(({ logUserActivity }) => {
        logUserActivity(user.uid, {
          type: 'settings_changed',
          metadata: { setting: 'units', value: newUnits },
        }).catch((err: any) => console.error('Error logging units activity:', err));
      });
    }
  };

  // Language management
  const language = currentUser?.language || 'en';
  const setLanguage = (newLanguage: 'en' | 'es' | 'fr' | 'de') => {
    if (user?.uid) {
      updateProfileMutation.mutate({ language: newLanguage });
      // Log activity
      import('../lib/firebase-user-preferences-service').then(({ logUserActivity }) => {
        logUserActivity(user.uid, {
          type: 'settings_changed',
          metadata: { setting: 'language', value: newLanguage },
        }).catch((err: any) => console.error('Error logging language activity:', err));
      });
    }
  };

  // Privacy management
  const privacy = currentUser?.privacy || 'private';
  const setPrivacy = (newPrivacy: 'private' | 'friends' | 'public') => {
    if (user?.uid) {
      updateProfileMutation.mutate({ privacy: newPrivacy });
      // Log activity
      import('../lib/firebase-user-preferences-service').then(({ logUserActivity }) => {
        logUserActivity(user.uid, {
          type: 'settings_changed',
          metadata: { setting: 'privacy', value: newPrivacy },
        }).catch((err: any) => console.error('Error logging privacy activity:', err));
      });
    }
  };

  // Notifications management
  const notifications = currentUser?.notifications || {
    workoutReminders: true,
    goalAchievements: true,
    weeklyProgress: false,
  };
  const setNotifications = (newNotifications: Partial<SettingsContextType['notifications']>) => {
    if (user?.uid) {
      updateProfileMutation.mutate({ 
        notifications: { ...notifications, ...newNotifications }
      });
      // Log activity
      import('../lib/firebase-user-preferences-service').then(({ logUserActivity }) => {
        logUserActivity(user.uid, {
          type: 'settings_changed',
          metadata: { setting: 'notifications', value: newNotifications },
        }).catch((err: any) => console.error('Error logging notifications activity:', err));
      });
    }
  };

  // Data sharing management
  const dataSharing = currentUser?.dataSharing ?? true;
  const setDataSharing = (enabled: boolean) => {
    if (user?.uid) {
      updateProfileMutation.mutate({ dataSharing: enabled });
      // Log activity
      import('../lib/firebase-user-preferences-service').then(({ logUserActivity }) => {
        logUserActivity(user.uid, {
          type: 'settings_changed',
          metadata: { setting: 'dataSharing', value: enabled },
        }).catch((err: any) => console.error('Error logging dataSharing activity:', err));
      });
    }
  };

  // Activity tracking management
  const activityTracking = currentUser?.activityTracking ?? true;
  const setActivityTracking = (enabled: boolean) => {
    if (user?.uid) {
      updateProfileMutation.mutate({ activityTracking: enabled });
      // Log activity
      import('../lib/firebase-user-preferences-service').then(({ logUserActivity }) => {
        logUserActivity(user.uid, {
          type: 'settings_changed',
          metadata: { setting: 'activityTracking', value: enabled },
        }).catch((err: any) => console.error('Error logging activityTracking activity:', err));
      });
    }
  };

  // Apply theme on mount and when theme changes
  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = theme === "dark" || (theme === "system" && prefersDark);
    root.classList.toggle("dark", isDark);
  }, [theme]);

  const value: SettingsContextType = {
    theme,
    setTheme,
    units,
    setUnits,
    language,
    setLanguage,
    privacy,
    setPrivacy,
    notifications,
    setNotifications,
    dataSharing,
    setDataSharing,
    activityTracking,
    setActivityTracking,
    isUpdating: updateProfileMutation.isPending,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
