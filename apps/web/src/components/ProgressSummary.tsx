import React, { useMemo } from "react";
import { motion } from "framer-motion";
import type { WorkoutLog } from "../lib/firebase-data-service";

export interface ProgressSummaryProps {
  workouts: WorkoutLog[];
  weightChange: number;
}

function ProgressSummaryComponent({ workouts, weightChange }: ProgressSummaryProps) {
  const { thisWeeksWorkouts, totalDuration, workoutDays } = useMemo(() => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const weeksWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= weekStart;
    });

    const duration = weeksWorkouts.reduce((sum, workout) => sum + workout.durationMinutes, 0);
    const days = new Set(weeksWorkouts.map(w => w.date)).size;

    return {
      thisWeeksWorkouts: weeksWorkouts,
      totalDuration: duration,
      workoutDays: days
    };
  }, [workouts]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {/* Weekly Workouts */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-blue-600  p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Weekly Workouts</p>
          <svg className="h-8 w-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <p className="mt-2 text-3xl font-bold">{thisWeeksWorkouts.length}</p>
        <p className="text-blue-200">Active Days: {workoutDays}</p>
      </motion.div>

      {/* Total Time */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-slate-700 dark:bg-slate-600  p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Total Time</p>
          <svg className="h-8 w-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="mt-2 text-3xl font-bold">{totalDuration}m</p>
        <p className="text-slate-300">This Week</p>
      </motion.div>

      {/* Weight Change */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-emerald-600  p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Weight Change</p>
          <svg className="h-8 w-8 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <p className="mt-2 text-3xl font-bold">{weightChange > 0 ? "+" : ""}{weightChange.toFixed(1)}kg</p>
        <p className="text-emerald-100">Last 7 Days</p>
      </motion.div>
    </motion.div>
  );
}

export const ProgressSummary = React.memo(ProgressSummaryComponent);