import React, { useEffect, useState } from 'react';
import { exerciseService } from '../lib/firebase-data-service';
import type { Exercise } from '@myfitness/shared';

export default function GifViewer({ exerciseId, onBack }: { exerciseId?: string | null; onBack?: () => void }) {
  const [exercise, setExercise] = useState<Exercise | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExercise = async () => {
      if (!exerciseId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const fetchedExercise = await exerciseService.getExerciseById(exerciseId);
        setExercise(fetchedExercise);
      } catch (error) {
        console.error('Error fetching exercise:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercise();
  }, [exerciseId]);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-sm px-3 py-2  bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
        >
          â† Back
        </button>
        <h1 className="text-2xl font-semibold">{exercise?.name ?? 'Exercise GIF'}</h1>
        <div />
      </div>

      <div className="bg-white dark:bg-gray-900 p-6  shadow">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">Loading exercise...</div>
        ) : exercise?.imageUrl ? (
          <img src={exercise.imageUrl} alt={exercise.name} className="w-full h-[60vh] object-contain mx-auto" />
        ) : (
          <div className="text-center text-muted-foreground">No GIF available</div>
        )}

        {exercise && !isLoading && (
          <div className="mt-4">
            <h3 className="font-medium">{exercise.name}</h3>
            <p className="text-sm text-muted-foreground">{exercise.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
