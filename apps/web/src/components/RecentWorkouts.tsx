import { motion } from "framer-motion";
import type { Exercise } from "@myfitness/shared";
import type { WorkoutLog } from "../lib/firebase-data-service";
import { useState } from "react";

interface RecentWorkoutsProps {
  workouts: WorkoutLog[];
  exercises: Exercise[];
}

export function RecentWorkouts({ workouts, exercises }: RecentWorkoutsProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredWorkouts = workouts.filter(workout => {
    const exercise = exercises.find(e => e.id === workout.exerciseId);
    const searchLower = searchTerm.toLowerCase();
    return (
      exercise?.name.toLowerCase().includes(searchLower) ||
      workout.notes?.toLowerCase().includes(searchLower) ||
      workout.date.includes(searchLower)
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white dark:bg-gray-800  shadow-lg p-4 sm:p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Workouts</h2>
      
      <div className="relative mb-4">
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2  border-gray-300 dark:border-gray-700 rounded-xl shadow-md focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          placeholder="Search workouts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="space-y-4">
        {filteredWorkouts.slice().reverse().map(workout => {
          const exercise = exercises.find(e => e.id === workout.exerciseId);
          return (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50  hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${
                exercise?.category === 'cardio' ? 'bg-red-400' :
                exercise?.category === 'strength' ? 'bg-blue-400' :
                exercise?.category === 'stretching' ? 'bg-yellow-400' :
                'bg-purple-400'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {exercise?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {workout.date}
                  </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {workout.durationMinutes} minutes
                </p>
                {workout.notes && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {workout.notes}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}