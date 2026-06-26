import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ExerciseGifModal from '../components/exercises/ExerciseGifModal';
import { exerciseCategories, type Exercise, type ExerciseCategory } from '../lib/exercise-categories';
import { Search, X, AlertCircle } from 'lucide-react';

interface SearchError {
  message: string;
  type: 'invalid_input' | 'no_results' | 'search_too_long' | 'network_error' | null;
}

export default function ExercisesPage({ onBack }: { onBack?: () => void }) {
  const [showGifModal, setShowGifModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState<SearchError>({ message: '', type: null });
  const [hasSearched, setHasSearched] = useState(false);

  // Maximum search query length to prevent performance issues
  const MAX_SEARCH_LENGTH = 100;

  // Validate search input
  const validateSearchQuery = useCallback((query: string): { valid: boolean; error?: string } => {
    if (!query || query.trim().length === 0) {
      return { valid: true }; // Empty query is valid (shows all exercises)
    }

    const trimmedQuery = query.trim();

    if (trimmedQuery.length > MAX_SEARCH_LENGTH) {
      return {
        valid: false,
        error: `Search query must be less than ${MAX_SEARCH_LENGTH} characters`
      };
    }

    // Check for invalid characters (basic sanitization)
    const invalidChars = /[<>{}[\]]/g;
    if (invalidChars.test(trimmedQuery)) {
      return {
        valid: false,
        error: 'Search query contains invalid characters'
      };
    }

    return { valid: true };
  }, []);

  // Handle search input change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Clear previous errors
    setSearchError({ message: '', type: null });

    // Validate input
    const validation = validateSearchQuery(value);
    
    if (!validation.valid && validation.error) {
      setSearchError({
        message: validation.error,
        type: 'invalid_input'
      });
      return;
    }

    setSearchQuery(value);
    
    // Mark as searched if user has typed something
    if (value.trim().length > 0) {
      setHasSearched(true);
    } else {
      setHasSearched(false);
    }
  }, [validateSearchQuery]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchError({ message: '', type: null });
    setHasSearched(false);
  }, []);

  // Filter exercises based on search query
  const filteredCategories = useMemo(() => {
    try {
      // If no search query, return all categories
      if (!searchQuery || searchQuery.trim().length === 0) {
        return exerciseCategories;
      }

      const query = searchQuery.trim().toLowerCase();
      
      // Filter categories and exercises
      const filtered: ExerciseCategory[] = exerciseCategories
        .map(category => {
          const matchingExercises = category.exercises.filter(exercise => {
            try {
              const exerciseName = exercise.name.toLowerCase();
              const categoryName = category.category.toLowerCase();
              
              // Search in exercise name and category name
              return exerciseName.includes(query) || categoryName.includes(query);
            } catch (error) {
              console.error('Error filtering exercise:', error);
              return false;
            }
          });

          // Only include category if it has matching exercises
          if (matchingExercises.length > 0) {
            return {
              ...category,
              exercises: matchingExercises
            };
          }

          return null;
        })
        .filter((category): category is ExerciseCategory => category !== null);

      // Check if any results found
      if (filtered.length === 0 && hasSearched) {
        setSearchError({
          message: `No exercises found for "${searchQuery}"`,
          type: 'no_results'
        });
      } else {
        setSearchError({ message: '', type: null });
      }

      return filtered;
    } catch (error: any) {
      console.error('Error filtering exercises:', error);
      setSearchError({
        message: 'An error occurred while searching. Please try again.',
        type: 'network_error'
      });
      return exerciseCategories; // Return all categories as fallback
    }
  }, [searchQuery, hasSearched]);

  // Calculate total filtered exercises count
  const totalFilteredExercises = useMemo(() => {
    return filteredCategories.reduce((total, category) => total + category.exercises.length, 0);
  }, [filteredCategories]);

  return (
    <div className="min-h-screen gradient-clean-light dark:gradient-clean-dark">
      <div className="max-w-7xl mx-auto py-12 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-6 mb-6">
            {onBack && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="p-3  bg-white/80 dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </motion.button>
            )}
            <div className="flex-1">
              <h1 className="text-5xl font-black text-gray-900 dark:text-white">
                Exercise Library
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2 font-medium">
                Click on any exercise to start exercising
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-8"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search exercises by name or category..."
                maxLength={MAX_SEARCH_LENGTH}
                className="w-full pl-12 pr-12 py-4 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700  text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-lg hover:shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Search Results Count */}
            {hasSearched && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-1"
              >
                {totalFilteredExercises > 0 ? (
                  `Found ${totalFilteredExercises} exercise${totalFilteredExercises !== 1 ? 's' : ''}`
                ) : (
                  'No results found'
                )}
              </motion.p>
            )}

            {/* Error Display */}
            <AnimatePresence>
              {searchError.message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-3 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 "
                >
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-800 dark:text-red-200">{searchError.message}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Display filtered categories with 4 GIFs per row */}
        {filteredCategories.length > 0 ? (
        <div className="space-y-16">
            {filteredCategories.map((category, categoryIndex) => (
            <motion.div 
              key={category.category}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
            >
              <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                {category.category}
              </h2>
              <div className="grid grid-cols-4 gap-8">
                {category.exercises.map((exercise, exerciseIndex) => (
                  <motion.button
                    key={exercise.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: (categoryIndex * 0.1) + (exerciseIndex * 0.05) }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      try {
                      setSelectedExercise(exercise);
                      setShowGifModal(true);
                      } catch (error) {
                        console.error('Error opening exercise modal:', error);
                        setSearchError({
                          message: 'Failed to open exercise. Please try again.',
                          type: 'network_error'
                        });
                      }
                    }}
                    className="group relative overflow-hidden  bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-all duration-300 aspect-square shadow-lg hover:shadow-md"
                  >
                    <img
                      src={exercise.imageUrl}
                      alt={exercise.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        console.error('Error loading exercise image:', exercise.imageUrl);
                        // Set a fallback or placeholder
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage%3C/text%3E%3C/svg%3E';
                        target.alt = `${exercise.name} (image unavailable)`;
                      }}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <span className="text-white font-bold text-lg block group-hover:text-white transition-colors duration-300">{exercise.name}</span>
                    </div>
                    <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                      </svg>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
        ) : (
          /* No Results State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-white/80 dark:bg-gray-800/80  p-12 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                No exercises found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                We couldn't find any exercises matching "{searchQuery}". Try searching with different keywords or browse all exercises.
              </p>
              <button
                onClick={clearSearch}
                className="px-6 py-3 bg-blue-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium  transition-all duration-200 shadow-lg hover:shadow-sm"
              >
                Clear Search & Show All
              </button>
            </div>
          </motion.div>
        )}
        </div>

      {/* Use ExerciseGifModal component which has workout logging built in */}
      {showGifModal && selectedExercise && (
        <ExerciseGifModal
          exercise={selectedExercise}
          onClose={() => {
            setShowGifModal(false);
            setSelectedExercise(null);
          }}
        />
      )}
    </div>
  );
}
