import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../providers/auth-provider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../providers/toast-provider';
import { ConfirmDialog } from './ConfirmDialog';
import { weightService, type WeightEntry } from '../lib/firebase-data-service';
import { getUserGoals } from '../lib/firebase-goal-service';
import { getUserSchedule, createUserSchedule, deleteUserSchedule } from '../lib/firebase-schedule-service';
import type { Goal, Schedule, ScheduleItem } from '@myfitness/shared';

import MyGoalsPage from '../pages/MyGoalsPage';
import ProfilePage from './ProfilePage';
import SchedulePage from '../pages/SchedulePage';
import CreateScheduleForm from './CreateScheduleForm';
import AchievementsPage from '../pages/AchievementsPage';
import DetailedStatsModal from './DetailedStatsModal';
import SettingsPage from '../pages/SettingsPage';
import WorkoutLogsPage from '../pages/WorkoutLogsPage';
import ProgressModal from './ProgressModal';
import { MotivationCard } from './MotivationCard';
import { useSettings } from '../providers/settings-provider';
import { convertWeightData } from '../lib/unit-conversion';
import type { WorkoutLog } from '../lib/firebase-data-service';
import type { Exercise } from '../lib/exercise-categories';

// Sidebar components
import GoalInsightsSidebar from './sidebars/GoalInsightsSidebar';
import ScheduleActionsSidebar from './sidebars/ScheduleActionsSidebar';
import AccountDetailsSidebar from './sidebars/AccountDetailsSidebar';

// Dashboard components
import DashboardPage from './dashboard/DashboardPage';

export default function DashboardLayout({
  onNav,
  onOpenGif,
  centerPage,
}: {
  onNav?: (page: string) => void;
  onOpenGif?: (exerciseId: string) => void;
  centerPage?: 'dashboard' | 'goals' | 'gifs' | string;
}) {
  const { showSuccess } = useToast();
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const settings = useSettings();
  const scrollPositionRef = useRef<number>(0);
  const previousCenterPage = useRef<string | undefined>(centerPage);
  
  // Handle scroll position on page navigation
  useEffect(() => {
    // Check if navigation came from sidebar - always scroll to top
    const isSidebarNav = sessionStorage.getItem('sidebar_nav') === 'true';
    
    if (previousCenterPage.current !== centerPage) {
      if (isSidebarNav) {
        // Sidebar navigation - always scroll to top and clear saved positions
        const scrollKey = `myfitness_scroll_${centerPage}`;
        sessionStorage.removeItem(scrollKey);
        sessionStorage.removeItem('sidebar_nav');
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      } else {
        // Other navigation - restore saved position or scroll to top
        const scrollKey = `myfitness_scroll_${centerPage}`;
        const savedScroll = sessionStorage.getItem(scrollKey);
        if (savedScroll) {
          const pos = parseInt(savedScroll, 10);
          if (!isNaN(pos) && pos > 0) {
            requestAnimationFrame(() => {
              window.scrollTo({ top: pos, behavior: 'instant' });
            });
          } else {
            requestAnimationFrame(() => {
              window.scrollTo({ top: 0, behavior: 'instant' });
            });
          }
        } else {
          requestAnimationFrame(() => {
            window.scrollTo({ top: 0, behavior: 'instant' });
          });
        }
      }
    }
    
    // Save scroll position as user scrolls (only if not from sidebar nav)
    const scrollKey = `myfitness_scroll_${centerPage}`;
    const handleScroll = () => {
      // Don't save scroll position if we just navigated from sidebar
      if (sessionStorage.getItem('sidebar_nav') !== 'true') {
        sessionStorage.setItem(scrollKey, String(window.scrollY));
      }
    };
    
    // Small delay before enabling scroll saving to avoid capturing initial scroll
    const timeoutId = setTimeout(() => {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }, 1000);
    
    previousCenterPage.current = centerPage;
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [centerPage]);
  
  // Fetch user profile from Firebase to ensure we have the latest data
  const { data: userProfile } = useQuery({
    queryKey: ['user', 'profile', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return null;
      const { getUserFromFirestore } = await import('../lib/firebase-user-service');
      return getUserFromFirestore(user.uid);
    },
    enabled: !!user?.uid,
    staleTime: 0, // Always consider data stale to allow refetch after updates
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Refetch when component mounts
  });
  
  // Use Firebase profile if available, otherwise fall back to auth context
  const currentUser = userProfile || (user ? {
    uid: user.uid,
    name: user.name,
    email: user.email,
    age: user.age,
    weightKg: user.weightKg,
    heightCm: user.heightCm,
    theme: user.theme as "light" | "dark" | "system",
    fitnessGoal: user.fitnessGoal,
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


  // Get weight history from Firebase
  const { data: weightHistory = [] } = useQuery<WeightEntry[]>({
    queryKey: ['weight', 'history', user?.uid],
    queryFn: () => weightService.getHistory(user!.uid),
    enabled: !!user?.uid
  });

  // Get goals from Firebase for Goal Insights
  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ['goals', user?.uid],
    queryFn: () => getUserGoals(user!.uid),
    enabled: !!user?.uid,
  });


  // Generate weekly weight data for the last 3 months (12 weeks) based on real Firestore data
  const generateWeeklyWeightData = useCallback((): { week: string; weight: number }[] => {
    const currentWeight = currentUser?.weightKg || 70;
    const weeks = [
      'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 
      'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12'
    ];
    
    // If we have weight history from Firestore, use it to generate realistic weekly data
    if (weightHistory.length > 0) {
      // Sort by date (oldest first) to get chronological progression
      const sortedHistory = weightHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Get the date range for the last 12 weeks (3 months)
      const now = new Date();
      const twelveWeeksAgo = new Date(now.getTime() - (12 * 7 * 24 * 60 * 60 * 1000));
      
      // Filter entries from the last 12 weeks
      const recentEntries = sortedHistory.filter(entry => 
        new Date(entry.date) >= twelveWeeksAgo
      );
      
      // If only one entry exists (initial weight), show straight line
      if (recentEntries.length === 1 || sortedHistory.length === 1) {
        const initialWeight = sortedHistory[0]?.weight || currentWeight;
        return weeks.map(week => ({ week, weight: initialWeight }));
      }
      
      if (recentEntries.length > 1) {
        // Group entries by week
        const weeklyData: { week: string; weight: number }[] = [];
        
        for (let weekIndex = 0; weekIndex < 12; weekIndex++) {
          const weekStart = new Date(twelveWeeksAgo.getTime() + (weekIndex * 7 * 24 * 60 * 60 * 1000));
          const weekEnd = new Date(weekStart.getTime() + (7 * 24 * 60 * 60 * 1000));
          
          // Find entries in this week
          const weekEntries = recentEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= weekStart && entryDate < weekEnd;
          });
          
          if (weekEntries.length > 0) {
            // Use the latest weight in this week
            const latestEntry = weekEntries[weekEntries.length - 1];
            if (latestEntry) {
              weeklyData.push({ week: weeks[weekIndex]!, weight: latestEntry.weight });
            } else {
              weeklyData.push({ week: weeks[weekIndex]!, weight: currentWeight });
            }
          } else {
            // If no entries for this week, interpolate or use previous week's weight
            if (weeklyData.length > 0) {
              const lastWeight = weeklyData[weeklyData.length - 1]?.weight || currentWeight;
              weeklyData.push({ 
                week: weeks[weekIndex]!, 
                weight: lastWeight 
              });
            } else {
              // First week with no data, use current weight
              weeklyData.push({ week: weeks[weekIndex]!, weight: currentWeight });
            }
          }
        }
        
        return weeklyData;
      }
    }
    
    // If no weight history exists, show straight line across all 12 weeks
    return weeks.map(week => ({ week, weight: currentWeight }));
  }, [weightHistory, currentUser?.weightKg]);

  const weeklyWeightData = useMemo(() => generateWeeklyWeightData(), [generateWeeklyWeightData]);
  const convertedWeightData = useMemo(() => 
    convertWeightData(weeklyWeightData, settings.units),
    [weeklyWeightData, settings.units]
  );
  const labels = useMemo(() => Array.from({ length: 12 }).map((_, i) => `W${i + 1}`), []);
  const [modalStat, setModalStat] = React.useState<null | {
    title: string;
    progress?: { value: number; total: number };
    data?: { date: string; value: number }[] | WorkoutLog[];
    isExercise?: boolean;
  }>(null);
  const [showCreateScheduleForm, setShowCreateScheduleForm] = React.useState(false);
  const [showDetailedStats, setShowDetailedStats] = React.useState(false);
  const [showEditInfoDialog, setShowEditInfoDialog] = React.useState(false);
  
  // Get schedule from Firebase
  const { data: schedule } = useQuery<Schedule | null>({
    queryKey: ['schedule', user?.uid],
    queryFn: () => getUserSchedule(user!.uid),
    enabled: !!user?.uid,
  });

  // Create schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: (scheduleData: Omit<Schedule, 'id'>) => createUserSchedule(user!.uid, scheduleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule', user?.uid] });
      setShowCreateScheduleForm(false);
    },
  });

  // Delete schedule mutation
  const deleteScheduleMutation = useMutation({
    mutationFn: () => deleteUserSchedule(user!.uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule', user?.uid] });
      showSuccess('Schedule deleted successfully!');
      setShowDeleteConfirmDialog(false);
    },
  });

  // Weight update mutation
  const weightUpdateMutation = useMutation({
    mutationFn: (weight: number) => weightService.addEntry(user!.uid, weight),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weight', 'history', user?.uid] });
      queryClient.invalidateQueries({ queryKey: ['user', 'profile', user?.uid] });
    },
  });



  return (
    <>
      <div className="min-h-screen gradient-elegant-light dark:gradient-elegant-dark">
        {/* Modern Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/10 dark:bg-blue-900/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-60 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200/10 dark:bg-indigo-900/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-60 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-40 left-1/2 w-96 h-96 bg-emerald-200/10 dark:bg-emerald-900/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-60 animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3">
            <Sidebar profile={currentUser} onNav={onNav} />
          </div>

          <div id="main-content" role="main" className="lg:col-span-9 space-y-8">
          {centerPage === 'goals' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <div className="bg-white dark:bg-gray-800  p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <MyGoalsPage />
                  </div>
                </div>
                <div className="lg:col-span-1">
                  <GoalInsightsSidebar goals={goals} />
                </div>
              </div>
            </div>
          ) : centerPage === 'profile' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800  shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <ProfilePage onClose={() => onNav?.('dashboard')} />
                </div>
              </div>
              <div className="lg:col-span-1">
                <AccountDetailsSidebar currentUser={currentUser} />
              </div>
            </div>
          ) : centerPage === 'schedule' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800  p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <SchedulePage />
                </div>
              </div>
              <div className="lg:col-span-1 space-y-6">
                <ScheduleActionsSidebar
                  schedule={schedule || null}
                  onCreateSchedule={() => setShowCreateScheduleForm(true)}
                  onEditSchedule={() => setShowEditInfoDialog(true)}
                  onDeleteSchedule={() => setShowDeleteConfirmDialog(true)}
                  isDeleting={deleteScheduleMutation.isPending}
                />
                <MotivationCard />
              </div>
            </div>
          ) : centerPage === 'achievements' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-white dark:bg-gray-800  p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <AchievementsPage />
                  </div>
                </div>
                <div className="lg:col-span-1 space-y-6">
                  <MotivationCard />
                </div>
              </div>
            </div>
          ) : centerPage === 'settings' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-white dark:bg-gray-800  p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <SettingsPage />
                  </div>
                </div>
                <div className="lg:col-span-1 space-y-6">
                  <MotivationCard />
                </div>
              </div>
            </div>
          ) : centerPage === 'workouts' || centerPage === 'workout-logs' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-white dark:bg-gray-800  p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <WorkoutLogsPage />
                  </div>
                </div>
                <div className="lg:col-span-1 space-y-6">
                  <MotivationCard />
                </div>
              </div>
            </div>

          ) : (
            <DashboardPage
              labels={labels}
              weightData={convertedWeightData}
              units={settings.units}
              onUpdateWeight={() => setShowDetailedStats(true)}
              onNav={onNav}
              onOpenExercise={(exercise) => onOpenGif?.(exercise.id)}
            />
          )}

          {modalStat && (
            <ProgressModal
              open={Boolean(modalStat)}
              title={modalStat.title}
              progress={modalStat.progress}
              data={modalStat.data}
              isExercise={modalStat.isExercise}
              onClose={() => setModalStat(null)}
              onOpenGif={(id: string) => { setModalStat(null); onOpenGif?.(id); }}
            />
          )}

          {showCreateScheduleForm && (
            <CreateScheduleForm
              onClose={() => setShowCreateScheduleForm(false)}
              onSave={(scheduleData: Record<string, ScheduleItem[]>) => {
                const formattedSchedule = {
                  monday: scheduleData.monday || [],
                  tuesday: scheduleData.tuesday || [],
                  wednesday: scheduleData.wednesday || [],
                  thursday: scheduleData.thursday || [],
                  friday: scheduleData.friday || [],
                  saturday: scheduleData.saturday || [],
                  sunday: scheduleData.sunday || [],
                };
                createScheduleMutation.mutate(formattedSchedule as Omit<Schedule, 'id'>);
              }}
            />
          )}

          {showDetailedStats && (
            <DetailedStatsModal
              onClose={() => setShowDetailedStats(false)}
              labels={labels}
              weightData={convertedWeightData}
              onUpdateWeight={(weight) => weightUpdateMutation.mutate(weight)}
              currentWeight={currentUser?.weightKg}
              isUpdating={weightUpdateMutation.isPending}
              isSuccess={weightUpdateMutation.isSuccess}
              units={settings.units}
            />
          )}

          {showEditInfoDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowEditInfoDialog(false)} />
              <div className="relative bg-white dark:bg-gray-800  p-8 shadow-md w-full max-w-md border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12  bg-blue-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Edit Schedule
                  </h2>
                </div>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    To edit your schedule, simply click on any day card in your weekly schedule. You can add, modify, or remove activities for each day.
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4  border border-blue-200 dark:border-blue-700">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      ðŸ’¡ Tip: You can click on any day (Monday through Sunday) to open the edit form for that specific day.
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowEditInfoDialog(false)}
                    className="px-6 py-3  bg-blue-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-sm"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </div>
          )}

          <ConfirmDialog
            open={showDeleteConfirmDialog}
            title="Delete Schedule"
            message="Are you sure you want to delete your entire workout schedule? This action cannot be undone and will remove all your scheduled activities for all days of the week."
            confirmText="Delete Schedule"
            cancelText="Cancel"
            variant="danger"
            onConfirm={() => deleteScheduleMutation.mutate()}
            onCancel={() => setShowDeleteConfirmDialog(false)}
          />

          </div>
        </div>
      </div>
    </>
  );
}