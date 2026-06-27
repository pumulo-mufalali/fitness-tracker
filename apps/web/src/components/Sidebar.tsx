import React from 'react';
import { motion } from 'framer-motion';
import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { User } from '@myfitness/shared';
import { useAuth } from '../providers/auth-provider';
import { useSettings } from '../providers/settings-provider';
import { formatWeight, formatHeight } from '../lib/unit-conversion';
import { workoutService } from '../lib/firebase-data-service';
import { exerciseCategories } from '../lib/exercise-categories';
import type { WorkoutLog } from '../lib/firebase-data-service';
import { Home, Target, User as UserIcon, Calendar, Trophy, Settings, Activity, Clock, Flame, Lock } from 'lucide-react';

interface NavItemProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
}

const NavItem = ({ children, active, onClick, icon }: NavItemProps) => (
  <motion.li
    whileHover={{ x: 4 }}
    transition={{ duration: 0.2 }}
  >
    <button
      className={`w-full text-left px-4 py-3.5 rounded-lg transition-all duration-300 font-medium flex items-center space-x-3 group ${active
          ? 'bg-blue-600 text-white shadow-lg '
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:shadow-md hover:text-blue-600 dark:hover:text-blue-400'
        }`}
      onClick={(e) => {
        e.preventDefault();
        // Set a flag to indicate sidebar navigation - always scroll to top
        sessionStorage.setItem('sidebar_nav', 'true');
        if (onClick) onClick();
      }}
    >
      <div className={`transition-colors duration-200 ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>
        {icon}
      </div>
      <span>{children}</span>
    </button>
  </motion.li>
);

const LOCKED_PAGES: Record<string, string> = {
  workouts: 'Workout Logs',
  goals: 'My Goals',
  profile: 'Profile Settings',
  schedule: 'Schedule',
  achievements: 'Achievements',
};

export function Sidebar({ profile, onNav, onLoginRequired }: {
  profile?: any;
  onNav?: (page: string) => void;
  onLoginRequired?: (pageName: string) => void;
}) {
  const { user, isAuthenticated } = useAuth();

  const handleNav = (page: string) => {
    if (!isAuthenticated && LOCKED_PAGES[page]) {
      onLoginRequired?.(LOCKED_PAGES[page]!);
      return;
    }
    onNav?.(page);
  };
  const settings = useSettings();

  // Fetch latest workout
  const { data: workoutLogs = [] } = useQuery<WorkoutLog[]>({
    queryKey: ['workouts', 'logs', user?.uid],
    queryFn: () => workoutService.getLogs(user!.uid),
    enabled: !!user?.uid,
    select: (data) => data.slice(0, 1), // Only get the latest one
  });

  const latestWorkout = workoutLogs[0] || null;

  // Get exercise name from exerciseId - memoized with useCallback
  const getExerciseName = useCallback((exerciseId: string): string => {
    for (const category of exerciseCategories) {
      const exercise = category.exercises.find(ex => ex.id === exerciseId);
      if (exercise) return exercise.name;
    }
    return 'Unknown Exercise';
  }, []);

  // Calculate BMI if height and weight are available - memoized
  const bmi = useMemo(() => {
    if (profile?.weightKg && profile?.weightKg > 0 && profile?.heightCm && profile?.heightCm > 0) {
      const heightInMeters = profile.heightCm / 100;
      const bmiValue = profile.weightKg / (heightInMeters * heightInMeters);
      return bmiValue.toFixed(1);
    }
    return null;
  }, [profile?.weightKg, profile?.heightCm]);

  const bmiCategory = useMemo(() => {
    if (!bmi) return null;
    const bmiNum = Number(bmi);
    if (bmiNum < 18.5) return { category: "Underweight", color: "text-blue-600 dark:text-blue-400" };
    if (bmiNum < 25) return { category: "Normal", color: "text-green-600 dark:text-green-400" };
    if (bmiNum < 30) return { category: "Overweight", color: "text-yellow-600 dark:text-yellow-400" };
    return { category: "Obese", color: "text-red-600 dark:text-red-400" };
  }, [bmi]);

  return (
    <aside className="w-full">
      <div className="sticky top-8 space-y-6">
        {/* Profile Card */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => handleNav('profile')}
          className="w-full bg-white dark:bg-gray-900 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 relative group border border-gray-200 dark:border-gray-700"
        >
          {!isAuthenticated && (
            <div className="absolute inset-0 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-10">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <Lock className="w-7 h-7 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium text-center px-4">
                Sign in to view your profile
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); onLoginRequired?.('Profile'); }}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
              >
                Login
              </button>
            </div>
          )}
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16  rounded-xl bg-blue-600 flex items-center justify-center text-xl font-semibold text-white shadow-lg">
              {profile?.name?.charAt(0) ?? 'U'}
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{profile?.name ?? 'User'}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{profile?.age && profile.age > 0 ? `${profile.age} years old` : 'Age not set'}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800  p-4 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">Height</div>
              <div className="font-bold text-gray-900 dark:text-white mt-1">
                {profile?.heightCm && profile.heightCm > 0 ? formatHeight(profile.heightCm, settings.units) : 'Not set'}
              </div>
            </div>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-800  p-4 text-center border border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">Weight</div>
              <div className="font-bold text-gray-900 dark:text-white mt-1">
                {profile?.weightKg && profile.weightKg > 0 ? formatWeight(profile.weightKg, settings.units) : 'Not set'}
              </div>
            </div>
          </div>

          {/* BMI Display */}
          {bmi && bmiCategory && (
            <div className="mt-4 rounded-lg bg-gray-50 dark:bg-gray-800  p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide text-center">BMI</div>
              <div className="flex items-center justify-between mt-2">
                <div className="font-bold text-gray-900 dark:text-white text-lg">{bmi}</div>
                <div className={`text-xs font-semibold ${bmiCategory.color}`}>{bmiCategory.category}</div>
              </div>
            </div>
          )}

          {/* Fitness Goal Display */}
          {profile?.fitnessGoal && (
            <div className="mt-4 rounded-lg bg-gray-50 dark:bg-gray-800  p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">Fitness Goal</div>
              <div className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">{profile.fitnessGoal}</div>
            </div>
          )}

          <div className="absolute inset-0 rounded-xl border-2 border-blue-500/0 group-hover:border-blue-500/20 transition-all duration-300 pointer-events-none" />
        </motion.button>

        {/* Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-gray-900  p-6 shadow-md rounded-xl border border-gray-200 dark:border-gray-700"
          role="navigation"
          aria-label="Primary"
        >
          <ul
            className="space-y-2"
            role="listbox"
            aria-label="Primary navigation"
            onKeyDown={(e) => {
              const list = e.currentTarget;
              const focusable = Array.from(
                list.querySelectorAll<HTMLButtonElement>('button')
              ).filter((el) => !el.disabled);
              if (focusable.length === 0) return;

              const currentIndex = focusable.findIndex((el) => el === document.activeElement);

              const moveFocus = (nextIndex: number) => {
                const clamped = Math.max(0, Math.min(focusable.length - 1, nextIndex));
                const item = focusable[clamped];
                if (item) item.focus();
              };

              switch (e.key) {
                case 'ArrowDown':
                  e.preventDefault();
                  moveFocus(currentIndex >= 0 ? currentIndex + 1 : 0);
                  break;
                case 'ArrowUp':
                  e.preventDefault();
                  moveFocus(currentIndex >= 0 ? currentIndex - 1 : focusable.length - 1);
                  break;
                case 'Home':
                  e.preventDefault();
                  moveFocus(0);
                  break;
                case 'End':
                  e.preventDefault();
                  moveFocus(focusable.length - 1);
                  break;
                default:
                  break;
              }
            }}
          >
            <NavItem onClick={() => handleNav('dashboard')} icon={<Home className="w-5 h-5" />}>Home</NavItem>
            <NavItem onClick={() => handleNav('workouts')} icon={<Activity className="w-5 h-5" />}>Workout Logs</NavItem>
            <NavItem onClick={() => handleNav('goals')} icon={<Target className="w-5 h-5" />}>My Goals</NavItem>
            <NavItem onClick={() => handleNav('profile')} icon={<UserIcon className="w-5 h-5" />}>Profile Settings</NavItem>
            <NavItem onClick={() => handleNav('schedule')} icon={<Calendar className="w-5 h-5" />}>Schedule</NavItem>
            <NavItem onClick={() => handleNav('achievements')} icon={<Trophy className="w-5 h-5" />}>Achievements</NavItem>
            <NavItem onClick={() => handleNav('settings')} icon={<Settings className="w-5 h-5" />}>Settings</NavItem>
          </ul>
        </motion.nav>

        {/* Latest Workout Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-900  p-6 shadow-md rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <div className="mb-4 text-center">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Latest Workout</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Your most recent session</p>
          </div>

          {latestWorkout ? (
            <div className="space-y-3">
              <div className="bg-white dark:bg-gray-800  p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="font-semibold text-gray-900 dark:text-white mb-2">
                  {getExerciseName(latestWorkout.exerciseId)}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{latestWorkout.durationMinutes.toFixed(1)} min</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <Flame className="w-4 h-4" />
                    <span>{latestWorkout.caloriesBurned} kcal</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                  {new Date(latestWorkout.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  sessionStorage.setItem('sidebar_nav', 'true');
                  handleNav('workouts');
                }}
                className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-sm text-sm"
              >
                View All Workouts
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                No workouts yet
              </p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onNav?.('dashboard');
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium  transition-all duration-200 shadow-lg hover:shadow-sm text-sm"
              >
                Start Your First Workout
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </aside>
  );
}

export default Sidebar;