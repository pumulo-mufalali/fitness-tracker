import React, { useState } from 'react';
import HeaderBar from '../HeaderBar';
import ExerciseBrowser from '../exercises/ExerciseBrowser';
import TodaysSchedule from '../TodaysSchedule';
import WeightProgressSection from './WeightProgressSection';
import { MotivationCard } from '../MotivationCard';
import type { Exercise } from '../../lib/exercise-categories';

interface DashboardPageProps {
  labels: string[];
  weightData: { week: string; weight: number }[];
  units: 'metric' | 'imperial';
  onUpdateWeight: () => void;
  onNav?: (page: string) => void;
  onOpenExercise?: (exercise: Exercise) => void;
}

export default function DashboardPage({
  labels,
  weightData,
  units,
  onUpdateWeight,
  onNav,
  onOpenExercise
}: DashboardPageProps) {
  return (
    <>
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl  p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
        <HeaderBar title="FITNESS TRACKER" onNav={onNav} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ExerciseBrowser onOpenExercise={onOpenExercise} />
        </div>

        <div className="lg:col-span-1">
          <TodaysSchedule onNav={onNav} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WeightProgressSection
            labels={labels}
            weightData={weightData}
            units={units}
            onUpdateWeight={onUpdateWeight}
          />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <MotivationCard />
        </div>
      </div>
    </>
  );
}
