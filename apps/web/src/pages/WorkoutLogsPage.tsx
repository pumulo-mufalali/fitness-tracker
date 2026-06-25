import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../providers/auth-provider';
import { workoutService } from '../lib/firebase-data-service';
import { exerciseCategories } from '../lib/exercise-categories';
import type { WorkoutLog } from '../lib/firebase-data-service';
import { motion } from 'framer-motion';
import { Calendar, Clock, Flame, Activity, Filter } from 'lucide-react';

const intensityColors: Record<'low' | 'medium' | 'high', { bg: string; text: string; border: string }> = {
  low: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800'
  },
  medium: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800'
  },
  high: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800'
  }
};

export default function WorkoutLogsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filterIntensity, setFilterIntensity] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch workout logs
  const { data: workoutLogs = [], isLoading } = useQuery<WorkoutLog[]>({
    queryKey: ['workouts', 'logs', user?.uid],
    queryFn: () => workoutService.getLogs(user!.uid),
    enabled: !!user?.uid,
    staleTime: 0, // Always consider data stale to allow immediate refetch
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  // Set up a subscription to refetch when queries are invalidated
  useEffect(() => {
    if (user?.uid) {
      // Refetch immediately when component mounts to ensure fresh data
      queryClient.refetchQueries({ queryKey: ['workouts', 'logs', user.uid] });
    }
  }, [user?.uid, queryClient]);

  // Get exercise name from exerciseId - memoized with useCallback
  const getExerciseName = useCallback((exerciseId: string): string => {
    for (const category of exerciseCategories) {
      const exercise = category.exercises.find(ex => ex.id === exerciseId);
      if (exercise) return exercise.name;
    }
    return 'Unknown Exercise';
  }, []);

  // Get exercise image from exerciseId - memoized with useCallback
  const getExerciseImage = useCallback((exerciseId: string): string | null => {
    for (const category of exerciseCategories) {
      const exercise = category.exercises.find(ex => ex.id === exerciseId);
      if (exercise) return exercise.imageUrl;
    }
    return null;
  }, []);

  // Filter and sort workout logs - memoized
  const filteredLogs = useMemo(() => {
    let filtered = workoutLogs;

    // Filter by intensity
    if (filterIntensity !== 'all') {
      filtered = filtered.filter(log => log.intensity === filterIntensity);
    }

    // Filter by search term (exercise name)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(log => {
        const exerciseName = getExerciseName(log.exerciseId);
        return exerciseName.toLowerCase().includes(searchLower);
      });
    }

    // Sort by date (most recent first)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  }, [workoutLogs, filterIntensity, searchTerm, getExerciseName]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalWorkouts = workoutLogs.length;
    const totalMinutes = workoutLogs.reduce((sum, log) => sum + log.durationMinutes, 0);
    const totalCalories = workoutLogs.reduce((sum, log) => sum + log.caloriesBurned, 0);
    const avgIntensity = workoutLogs.length > 0
      ? workoutLogs.reduce((sum, log) => {
          const intensityValue = log.intensity === 'low' ? 1 : log.intensity === 'medium' ? 2 : 3;
          return sum + intensityValue;
        }, 0) / workoutLogs.length
      : 0;
    const intensityLabel = avgIntensity < 1.5 ? 'Low' : avgIntensity < 2.5 ? 'Medium' : 'High';

    return {
      totalWorkouts,
      totalMinutes: Math.round(totalMinutes),
      totalCalories,
      avgIntensity: intensityLabel
    };
  }, [workoutLogs]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Workout Logs
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            View all your completed workout sessions
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4  border border-blue-200/50 dark:border-blue-700/50"
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Workouts</div>
          </div>
          <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.totalWorkouts}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4  border border-purple-200/50 dark:border-purple-700/50"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total Minutes</div>
          </div>
          <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">{stats.totalMinutes}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-4  border border-orange-200/50 dark:border-orange-700/50"
        >
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">Total Calories</div>
          </div>
          <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">{stats.totalCalories}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4  border border-green-200/50 dark:border-green-700/50"
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">Avg Intensity</div>
          </div>
          <div className="text-3xl font-bold text-green-700 dark:text-green-300">{stats.avgIntensity}</div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search workouts by exercise name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10  border-2 border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-300"
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <select
            value={filterIntensity}
            onChange={(e) => setFilterIntensity(e.target.value as 'all' | 'low' | 'medium' | 'high')}
            className="px-4 py-2  border-2 border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-300"
          >
            <option value="all">All Intensities</option>
            <option value="low">Low Intensity</option>
            <option value="medium">Medium Intensity</option>
            <option value="high">High Intensity</option>
          </select>
        </div>
      </div>

      {/* Workout Logs List */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 bg-white/50 dark:bg-gray-800/50  border border-gray-200 dark:border-gray-700">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
              {workoutLogs.length === 0 ? 'No workouts logged yet' : 'No workouts match your filters'}
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
              {workoutLogs.length === 0 ? 'Complete a timer workout to see it here!' : 'Try adjusting your search or filter'}
            </p>
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            const exerciseName = getExerciseName(log.exerciseId);
            const exerciseImage = getExerciseImage(log.exerciseId);
            const intensity = intensityColors[log.intensity];
            const date = new Date(log.date);
            const formattedDate = date.toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm  p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  {/* Exercise Image */}
                  {exerciseImage && (
                    <div className="flex-shrink-0">
                      <img
                        src={exerciseImage}
                        alt={exerciseName}
                        className="w-20 h-20  object-cover border-2 border-gray-200 dark:border-gray-700"
                      />
                    </div>
                  )}

                  {/* Workout Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                          {exerciseName}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formattedDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{log.durationMinutes.toFixed(1)} mins</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Flame className="w-4 h-4" />
                            <span>{log.caloriesBurned} kcal</span>
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${intensity.bg} ${intensity.text} border ${intensity.border}`}>
                        {log.intensity.charAt(0).toUpperCase() + log.intensity.slice(1)}
                      </div>
                    </div>

                    {log.notes && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-900/50  p-2">
                        {log.notes}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
