import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { exerciseCategories, type Exercise } from '../../lib/exercise-categories';
import ExerciseGifModal from './ExerciseGifModal';

function StaticGifFrame({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
    };
    img.src = src;
  }, [src]);

  return <canvas ref={canvasRef} className={className} aria-label={alt} />;
}

export default function ExerciseBrowser() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Cardio');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showGifModal, setShowGifModal] = useState(false);

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowGifModal(true);
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-900  p-4 sm:p-6 lg:p-8 shadow-md rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4 sm:mb-8 gap-4 sm:gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-2 h-10 bg-blue-600 rounded-full"></div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Browse Exercises
            </h2>
          </div>
          
          <div className="relative">
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pl-4 pr-10 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 shadow-sm font-semibold cursor-pointer"
              aria-label="Select exercise category"
            >
              {exerciseCategories.map((category) => (
                <option
                  key={category.category}
                  value={category.category}
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  {category.category}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
        </div>

        <div>
          <div
            className="grid grid-cols-2 gap-3 sm:gap-6 lg:gap-8"
            onKeyDown={(e) => {
              const container = e.currentTarget;
              const items = Array.from(
                container.querySelectorAll<HTMLButtonElement>('button')
              ).filter((el) => !el.disabled);
              if (items.length === 0) return;
              const cols = 2;
              const currentIndex = items.findIndex((el) => el === document.activeElement);
              const moveTo = (index: number) => {
                const clamped = Math.max(0, Math.min(items.length - 1, index));
                const item = items[clamped];
                if (item) item.focus();
              };
              switch (e.key) {
                case 'ArrowRight':
                  e.preventDefault();
                  moveTo(currentIndex >= 0 ? currentIndex + 1 : 0);
                  break;
                case 'ArrowLeft':
                  e.preventDefault();
                  moveTo(currentIndex >= 0 ? currentIndex - 1 : items.length - 1);
                  break;
                case 'ArrowDown':
                  e.preventDefault();
                  moveTo(currentIndex >= 0 ? currentIndex + cols : 0);
                  break;
                case 'ArrowUp':
                  e.preventDefault();
                  moveTo(currentIndex >= 0 ? currentIndex - cols : items.length - 1);
                  break;
                case 'Home':
                  e.preventDefault();
                  moveTo(0);
                  break;
                case 'End':
                  e.preventDefault();
                  moveTo(items.length - 1);
                  break;
                default:
                  break;
              }
            }}
            role="grid"
            aria-label={`${selectedCategory} exercises`}
          >
            {exerciseCategories
              .find((cat) => cat.category === selectedCategory)
              ?.exercises.map((exercise) => (
                <motion.button
                  key={exercise.id}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleExerciseClick(exercise)}
                  className="group relative overflow-hidden  bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500/50 dark:hover:border-blue-400/50 transition-all duration-300 aspect-square shadow-lg hover:shadow-md"
                  aria-label={`View ${exercise.name} exercise`}
                >
                  <StaticGifFrame
                    src={exercise.imageUrl}
                    alt={exercise.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="text-white font-semibold text-lg block group-hover:text-white transition-colors duration-300">{exercise.name}</span>
                  </div>
                  <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                    </svg>
                  </div>
                </motion.button>
              ))}
          </div>
        </div>
      </div>

      {showGifModal && selectedExercise && (
        <ExerciseGifModal
          exercise={selectedExercise}
          onClose={() => {
            setShowGifModal(false);
            setSelectedExercise(null);
          }}
        />
      )}
    </>
  );
}