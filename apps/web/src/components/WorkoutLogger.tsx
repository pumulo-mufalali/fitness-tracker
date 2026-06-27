import { motion } from "framer-motion";
import type { Exercise } from "@myfitness/shared";
import type { WorkoutLog } from "../lib/firebase-data-service";
import { useState } from "react";

interface WorkoutLoggerProps {
  exercises: Exercise[];
  onLogWorkout: (exerciseId: string, duration: number, notes?: string) => void;
  isLogging: boolean;
}

export function WorkoutLogger({ exercises, onLogWorkout, isLogging }: WorkoutLoggerProps) {
  const [selectedExercise, setSelectedExercise] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedExercise && duration) {
      const durationNum = parseInt(duration);
      if (!isNaN(durationNum) && durationNum > 0) {
        onLogWorkout(selectedExercise, durationNum, notes);
        setSelectedExercise("");
        setDuration("");
        setNotes("");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white dark:bg-gray-800  shadow-lg p-4 sm:p-6"
    >
      <div className="flex items-center space-x-4 mb-6">
        <div className="bg-blue-600 rounded-full p-3">
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Log Workout</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track your exercises</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Exercise
          </label>
          <select
            className="block w-full  border-gray-300 dark:border-gray-700 rounded-xl shadow-md focus:border-purple-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
          >
            <option value="">Select an exercise</option>
            {exercises.map(exercise => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Duration (minutes)
          </label>
          <input
            type="number"
            className="block w-full  border-gray-300 dark:border-gray-700 rounded-xl shadow-md focus:border-purple-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes
          </label>
          <textarea
            className="block w-full  border-gray-300 dark:border-gray-700 rounded-xl shadow-md focus:border-purple-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full flex items-center justify-center px-4 py-2 rounded-lg border border-transparent text-sm font-medium  shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={isLogging || !selectedExercise || !duration}
        >
          {isLogging ? "Logging..." : "Log Workout"}
        </motion.button>
      </form>
    </motion.div>
  );
}