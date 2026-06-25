import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../providers/auth-provider';
import { workoutService } from '../../lib/firebase-data-service';
import type { Exercise } from '../../lib/exercise-categories';
import type { WorkoutLog } from '../../lib/firebase-data-service';

interface ExerciseGifModalProps {
  exercise: Exercise;
  onClose: () => void;
}

export default function ExerciseGifModal({ exercise, onClose }: ExerciseGifModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [timerMinutes, setTimerMinutes] = useState(1);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const initialTimerMinutes = useRef<number>(0); // Use 0 as sentinel to detect if not set
  const initialTimerSeconds = useRef<number>(0);
  const hasLoggedWorkout = useRef<boolean>(false);
  const wasPaused = useRef<boolean>(false);
  const [workoutLogged, setWorkoutLogged] = useState(false);
  const [timerCompleted, setTimerCompleted] = useState(false);
  
  // Zoom functionality state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isImageDragging, setIsImageDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Workout logging mutation
  const logWorkoutMutation = useMutation({
    mutationFn: async (data: {
      exerciseId: string;
      exerciseName: string;
      durationMinutes: number;
      date: string;
      intensity: 'low' | 'medium' | 'high';
      caloriesBurned: number;
      notes?: string;
    }) => {
      if (!user?.uid) throw new Error('User not authenticated');
      
      return workoutService.logWorkout(user.uid, {
        exerciseId: data.exerciseId,
        durationMinutes: Math.round(data.durationMinutes * 10) / 10,
        intensity: data.intensity,
        caloriesBurned: data.caloriesBurned,
        date: data.date,
        notes: data.notes || `Workout session: ${data.exerciseName} completed via timer`
      });
    },
    onSuccess: async (updatedLogs, variables) => {
      // The mutation returns the updated list of logs directly from Firebase
      // Immediately update the cache with the fresh data
      if (updatedLogs && Array.isArray(updatedLogs)) {
        queryClient.setQueryData<WorkoutLog[]>(
          ['workouts', 'logs', user?.uid],
          updatedLogs
        );
      }
      
      // Also invalidate to ensure all components are notified
      await queryClient.invalidateQueries({ queryKey: ['workouts', 'logs', user?.uid] });
      
      // Invalidate achievements since workout completion may unlock achievements
      await queryClient.invalidateQueries({ queryKey: ['achievements', user?.uid] });
      
      // Log activity to Firestore
      if (user?.uid) {
        const { logUserActivity } = await import('../../lib/firebase-user-preferences-service');
        logUserActivity(user.uid, {
          type: 'workout_completed',
          metadata: {
            exerciseId: variables.exerciseId,
            exerciseName: variables.exerciseName,
            durationMinutes: variables.durationMinutes,
            caloriesBurned: variables.caloriesBurned,
            intensity: variables.intensity,
          },
        });
      }
      
      setWorkoutLogged(true);
      setTimeout(() => {
        setWorkoutLogged(false);
      }, 3000);
    },
    onError: (error) => {
      console.error('Failed to log workout:', error);
      // Reset the logged flag on error so user can try again
      hasLoggedWorkout.current = false;
    }
  });

  // Timer logic - simplified to avoid closure issues
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        // Use functional updates to get latest state values
        setTimerSeconds((prevSeconds) => {
          if (prevSeconds > 0) {
            // Still have seconds left, just decrement
            return prevSeconds - 1;
          } else {
            // Seconds are 0, need to check and decrement minutes
            let newSecondsValue = 0;
            let shouldComplete = false;
            
            setTimerMinutes((prevMinutes) => {
              if (prevMinutes > 0) {
                // Still have minutes left, decrement and set seconds to 59
                newSecondsValue = 59;
                return prevMinutes - 1;
              } else {
                // Both are 0 - timer completed!
                console.log('âœ… Timer countdown finished - reached 0:00 inside interval');
                newSecondsValue = 0;
                shouldComplete = true;
                return 0;
              }
            });
            
            // If timer completed, stop it and set completion state
            if (shouldComplete) {
              // Clear interval first
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
              // Then update state
              setIsTimerRunning(false);
              setTimerCompleted(true);
              console.log('âœ… Timer completion state set');
            }
            
            return newSecondsValue;
          }
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isTimerRunning]);
  
  // Additional check: if timer reaches 0 while not running and wasn't paused, trigger completion
  useEffect(() => {
    if (!isTimerRunning && timerMinutes === 0 && timerSeconds === 0 && !timerCompleted && !wasPaused.current && initialTimerMinutes.current > 0) {
      console.log('âœ… Timer reached 0:00 via state check - triggering completion');
      setTimerCompleted(true);
    }
  }, [isTimerRunning, timerMinutes, timerSeconds, timerCompleted]);

  // Debug: Log when timer reaches 0:00 to help diagnose issues
  useEffect(() => {
    if (!isTimerRunning && timerMinutes === 0 && timerSeconds === 0) {
      console.log('ðŸ” Timer reached 0:00 - state check', {
        timerCompleted,
        hasLoggedWorkout: hasLoggedWorkout.current,
        wasPaused: wasPaused.current,
        hasUser: !!user?.uid,
        initialMinutes: initialTimerMinutes.current,
        initialSeconds: initialTimerSeconds.current,
        exercise: exercise.name
      });
    }
  }, [isTimerRunning, timerMinutes, timerSeconds, timerCompleted, exercise.name, user?.uid]);

  // Separate effect to trigger logging when timerCompleted state changes
  useEffect(() => {
    console.log('ðŸ” timerCompleted effect triggered', {
      timerCompleted,
      hasLoggedWorkout: hasLoggedWorkout.current,
      wasPaused: wasPaused.current,
      hasUser: !!user?.uid,
      initialMinutes: initialTimerMinutes.current,
      initialSeconds: initialTimerSeconds.current
    });
    
    if (timerCompleted && !hasLoggedWorkout.current && !wasPaused.current && user?.uid) {
      const hasInitialValue = initialTimerMinutes.current > 0 || (initialTimerMinutes.current === 0 && initialTimerSeconds.current > 0);
      
      console.log('ðŸ” Checking conditions for logging', { hasInitialValue });
      
      if (hasInitialValue) {
        hasLoggedWorkout.current = true;
        
        console.log('âœ… Timer completed (via timerCompleted state) - logging workout', {
          initialMinutes: initialTimerMinutes.current,
          initialSeconds: initialTimerSeconds.current,
          exercise: exercise.name
        });
        
        // Calculate total duration in minutes (including seconds as decimal)
        const totalMinutes = initialTimerMinutes.current + (initialTimerSeconds.current / 60);
        
        // Determine intensity based on duration
        let intensity: 'low' | 'medium' | 'high' = 'low';
        if (totalMinutes >= 30) {
          intensity = 'high';
        } else if (totalMinutes >= 15) {
          intensity = 'medium';
        }

        // Estimate calories burned (8-10 calories per minute depending on intensity)
        const caloriesPerMinute = intensity === 'high' ? 10 : intensity === 'medium' ? 9 : 8;
        const caloriesBurned = Math.round(totalMinutes * caloriesPerMinute);

        // Get current date in ISO format
        const dateStr = new Date().toISOString().split('T')[0]!;
        const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        // Log the workout
        console.log('Attempting to log workout:', {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          durationMinutes: totalMinutes,
          date: dateStr,
          intensity,
          caloriesBurned
        });
        
        logWorkoutMutation.mutate({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          durationMinutes: totalMinutes,
          date: dateStr,
          intensity,
          caloriesBurned,
          notes: `Workout session: ${exercise.name} completed via timer at ${timeStr}`
        });
      } else {
        console.warn('âš ï¸ Timer completed but no initial values captured - cannot log workout');
      }
    }
  }, [timerCompleted, exercise, user?.uid, logWorkoutMutation]);

  const handleStartTimer = () => {
    // Store initial timer values when starting for the FIRST time (not when resuming)
    // This links the timer count to the exercise name
    if (initialTimerMinutes.current === 0 && initialTimerSeconds.current === 0) {
      // Fresh start - capture initial values
      initialTimerMinutes.current = timerMinutes;
      initialTimerSeconds.current = timerSeconds;
      console.log('âœ… Fresh timer start - captured initial values', {
        minutes: timerMinutes,
        seconds: timerSeconds,
        exercise: exercise.name
      });
      // Fresh start - allow logging
      wasPaused.current = false;
    } else {
      // Resuming after pause or reset - check if timer values match initial
      // If they match, it's a fresh start after reset - allow logging
      // If they don't match, it's a resume after pause - don't allow logging
      if (timerMinutes === initialTimerMinutes.current && timerSeconds === initialTimerSeconds.current) {
        // Reset to same initial values - treat as fresh start
        console.log('âœ… Starting after reset with same initial values - will log on completion');
        wasPaused.current = false;
      } else {
        // Resuming after pause with different values - don't allow logging
        console.log('âš ï¸ Resuming timer after pause - will NOT log on completion');
        wasPaused.current = true;
      }
    }
    hasLoggedWorkout.current = false;
    setTimerCompleted(false);
    setWorkoutLogged(false);
    setIsTimerRunning(true);
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    wasPaused.current = true; // Mark as paused to prevent logging
    console.log('Timer paused/stopped - will not log on completion');
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerMinutes(1);
    setTimerSeconds(0);
    // Don't reset initial values on reset - keep them so we can still log if timer completes
    // Only reset initial values when actually starting a new session (done in handleStartTimer)
    hasLoggedWorkout.current = false;
    wasPaused.current = false;
    setTimerCompleted(false);
    setWorkoutLogged(false);
    console.log('Timer reset - initial values preserved:', {
      initialMinutes: initialTimerMinutes.current,
      initialSeconds: initialTimerSeconds.current
    });
  };

  // Zoom functionality
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleWheelZoom = (e: React.WheelEvent) => {
    if (zoomLevel > 1) {
      e.preventDefault();
    }
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsImageDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isImageDragging && zoomLevel > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsImageDragging(false);
  };

  // Accessibility: focus trap and Escape to close
  useEffect(() => {
    const root = dialogRef.current;
    if (!root) return;

    const getFocusable = () =>
      Array.from(
        root.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled'));

    const focusable = getFocusable();
    (focusable[0] ?? root).focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const items = getFocusable();
        if (items.length === 0) return;
        const activeIndex = items.findIndex((el) => el === document.activeElement);
        if (e.shiftKey) {
          if (activeIndex <= 0) {
            e.preventDefault();
            const lastItem = items[items.length - 1];
            if (lastItem) lastItem.focus();
          }
        } else {
          if (activeIndex === -1 || activeIndex >= items.length - 1) {
            e.preventDefault();
            const firstItem = items[0];
            if (firstItem) firstItem.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 bg-white dark:bg-gray-800  p-6 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/20 dark:border-gray-700/50 my-4 outline-none"
        role="dialog"
        aria-modal="true"
        aria-label={`${exercise.name} details`}
        ref={dialogRef}
        tabIndex={-1}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
          {exercise.name}
        </h2>

        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900  overflow-hidden mb-4 max-h-[50vh] border border-gray-200/50 dark:border-gray-700/50">
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleZoomIn}
              className="w-10 h-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl  flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200/50 dark:border-gray-700/50"
              aria-label="Zoom in"
            >
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleZoomOut}
              className="w-10 h-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl  flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200/50 dark:border-gray-700/50"
              aria-label="Zoom out"
            >
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
              </svg>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleResetZoom}
              className="w-10 h-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl  flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200/50 dark:border-gray-700/50"
              aria-label="Reset zoom"
            >
              <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </motion.button>
          </div>

          <div className="absolute top-4 left-4 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl  px-3 py-2 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {Math.round(zoomLevel * 100)}%
            </span>
          </div>

          <div className="absolute bottom-4 left-4 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl  px-3 py-2 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Scroll to zoom â€¢ Drag to pan
            </span>
          </div>

          <div 
            className="w-full h-full min-h-[40vh] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
            onWheel={handleWheelZoom}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isImageDragging ? 'grabbing' : 'grab' }}
          >
            <img
              src={exercise.imageUrl}
              alt={exercise.name}
              className="transition-transform duration-200 ease-out"
              style={{
                transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
                transformOrigin: 'center center',
                maxWidth: 'none',
                maxHeight: 'none',
                width: 'auto',
                height: 'auto'
              }}
              draggable={false}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20  p-4 border border-blue-200/50 dark:border-blue-700/50">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 text-center">
            Exercise Timer
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
            {exercise.name}
          </p>
          
          {/* Workout logged notification */}
          {workoutLogged && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-green-500/10 border border-green-500/30  text-center"
            >
              <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Workout session saved!</span>
              </div>
            </motion.div>
          )}
          
          <div className="text-center mb-4">
            <div className={`text-4xl font-mono font-bold transition-colors duration-300 ${
              timerMinutes === 0 && timerSeconds === 0 && timerCompleted 
                ? 'text-red-600 dark:text-red-400 animate-pulse' 
                : 'text-blue-600 dark:text-blue-400'
            }`}>
              {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
            </div>
            {timerMinutes === 0 && timerSeconds === 0 && timerCompleted && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-medium text-red-600 dark:text-red-400 mt-2"
              >
                Timer completed!
              </motion.p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-700  px-4 py-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Minutes:</label>
              <input
                type="number"
                min="0"
                max="99"
                value={timerMinutes}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  if (val >= 0 && val <= 99) {
                    setTimerMinutes(val);
                  }
                }}
                disabled={isTimerRunning}
                className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-gray-700  px-4 py-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Seconds:</label>
              <input
                type="number"
                min="0"
                max="59"
                value={timerSeconds}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  if (val >= 0 && val <= 59) {
                    setTimerSeconds(val);
                  }
                }}
                disabled={isTimerRunning}
                className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-center mt-4">
            {!isTimerRunning ? (
              <button
                onClick={handleStartTimer}
                disabled={timerMinutes === 0 && timerSeconds === 0}
                className="px-6 py-3  bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
                Start
              </button>
            ) : (
              <button
                onClick={handleStopTimer}
                className="px-6 py-3  bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-2 0v6a1 1 0 102 0V7z" clipRule="evenodd" />
                </svg>
                Pause
              </button>
            )}
            
            <button
              onClick={handleResetTimer}
              className="px-6 py-3  bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium transition-all duration-200 border border-gray-300 dark:border-gray-600 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Reset
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
