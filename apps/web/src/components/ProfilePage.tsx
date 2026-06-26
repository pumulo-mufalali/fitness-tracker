import { UserProfileCard } from './UserProfileCard';
import { ThemeToggle } from './theme-toggle';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserFromFirestore, updateUserProfile, createInitialUserProfile } from '../lib/firebase-user-service';
import type { User } from '@myfitness/shared';
import { useAuth } from '../providers/auth-provider';
import { useToast } from '../providers/toast-provider';
import { useEffect } from 'react';

export function ProfilePage({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const { user, login } = useAuth();
  const { showSuccess, showError } = useToast();

  // Always fetch user profile from Firestore if user ID available
  const { data: profile, isLoading: profileLoading, error } = useQuery<User | null>({
    queryKey: ['user', 'profile', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return null;
      
      // Try to get existing profile
      const existingProfile = await getUserFromFirestore(user.uid);
      if (existingProfile) return existingProfile;
      
      // If no profile exists, create one
      const newProfile = await createInitialUserProfile(user.uid, user.email, user.name);
      return newProfile;
    },
    enabled: !!user?.uid,
    retry: 1, // Only retry once
    staleTime: 0, // Always consider data stale to allow refetch after updates
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: true, // Refetch when component mounts
    refetchOnReconnect: true, // Refetch when reconnecting
  });

  // Update profile mutation (write to Firestore and sync context)
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<User>) => {
      console.log('ProfilePage - updateProfileMutation called with:', updates);
      if (!user?.uid) {
        console.log('ProfilePage - No user UID, returning');
        return;
      }
      console.log('ProfilePage - Calling updateUserProfile...');
      await updateUserProfile(user.uid, updates);
      console.log('ProfilePage - updateUserProfile completed');
    },
    onSuccess: async () => {
      console.log('ProfilePage - Mutation success, updating auth context...');
      if (user?.uid) {
        // Invalidate and refetch to ensure fresh data
        await queryClient.invalidateQueries({ queryKey: ['user', 'profile', user.uid] });
        await queryClient.refetchQueries({ queryKey: ['user', 'profile', user.uid] });
        
        const updatedProfile = await getUserFromFirestore(user.uid);
        console.log('ProfilePage - Got updated profile:', updatedProfile);
        if (updatedProfile) {
          console.log('ProfilePage - Updating auth context with:', updatedProfile);
          login({ ...updatedProfile, fitnessGoal: updatedProfile.fitnessGoal ?? "" });
        }
      }
      // Show success message
      showSuccess('Profile updated successfully!');
    },
    onError: (error) => {
      console.error('ProfilePage - Mutation error:', error);
      showError('Failed to update profile. Please try again.');
    }
  });

  // Use user from auth context as fallback if profile is still loading
  const currentProfile = profile || (user ? {
    uid: user.uid,
    name: user.name,
    email: user.email,
    age: 0,
    weightKg: 0,
    heightCm: 0,
    fitnessGoal: "",
    theme: (user.theme as "light" | "dark" | "system") || "system",
    units: "metric" as const,
    language: "en" as const,
    privacy: "private" as const,
    notifications: {
      workoutReminders: true,
      goalAchievements: true,
      weeklyProgress: false,
    },
    dataSharing: true,
    activityTracking: true,
  } : null);

  return (
    <div className="min-h-[70vh] p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Profile</h1>
        </div>
      </div>

      {/* Show error if there's a problem */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800  p-6">
          <p className="text-red-600 dark:text-red-400">Error loading profile. Please try again.</p>
        </div>
      )}

      {/* Show loading only if we don't have any profile data */}
      {profileLoading && !currentProfile ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Setting up your profile...</p>
          </div>
        </div>
      ) : currentProfile ? (
        <>
          {/* Show helpful message for new users */}
          {(!currentProfile.age || currentProfile.age === 0 || !currentProfile.weightKg || currentProfile.weightKg === 0 || !currentProfile.heightCm || currentProfile.heightCm === 0) && (
            <div className="mb-6 bg-gray-50 dark:bg-gray-800 border border-blue-200 dark:border-blue-700  p-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Complete Your Profile</h3>
                  <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                    Please fill in your age, weight, height, and fitness goals to get personalized insights and track your progress.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white/50 dark:bg-gray-800/50  p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <UserProfileCard
              profile={currentProfile}
              onUpdateProfile={(updates) => updateProfileMutation.mutate(updates)}
              isUpdating={updateProfileMutation.isPending}
            />
          </div>
        </>
      ) : (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800  p-6 text-center">
          <p className="text-red-600 dark:text-red-400">No profile data available.</p>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;