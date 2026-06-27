import React, { useState } from 'react';
import HeaderBar from '../HeaderBar';
import ExerciseBrowser from '../exercises/ExerciseBrowser';
import TodaysSchedule from '../TodaysSchedule';
import WeightProgressSection from './WeightProgressSection';
import { MotivationCard } from '../MotivationCard';

interface DashboardPageProps {
  labels: string[];
  weightData: { week: string; weight: number }[];
  units: 'metric' | 'imperial';
  onUpdateWeight: () => void;
  onNav?: (page: string) => void;
}

export default function DashboardPage({
  labels,
  weightData,
  units,
  onUpdateWeight,
  onNav,
}: DashboardPageProps) {
  return (
    <>
      <div className="bg-white dark:bg-gray-900  p-4 sm:p-6 lg:p-8 shadow-md rounded-xl border border-gray-200 dark:border-gray-700">
        <HeaderBar title="FITNESS TRACKER" onNav={onNav} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6 lg:gap-8">
          <ExerciseBrowser />
          <div className="flex-1">
            <WeightProgressSection
              labels={labels}
              weightData={weightData}
              units={units}
              onUpdateWeight={onUpdateWeight}
            />
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-4">
          <TodaysSchedule onNav={onNav} />
          <MotivationCard />
        </div>
      </div>
    </>
  );
}
