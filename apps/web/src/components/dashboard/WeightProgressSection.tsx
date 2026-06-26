import React from 'react';
import StatsChart from '../StatsChart';
import { getWeightUnit } from '../../lib/unit-conversion';

interface WeightProgressSectionProps {
  labels: string[];
  weightData: { week: string; weight: number }[];
  units: 'metric' | 'imperial';
  onUpdateWeight: () => void;
}

export default function WeightProgressSection({
  labels,
  weightData,
  units,
  onUpdateWeight
}: WeightProgressSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-800  p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="text-lg font-bold text-gray-900 dark:text-white">
          Weight progress for 3 months ({getWeightUnit(units)})
        </div>
        <button 
          onClick={onUpdateWeight}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
        >
          Update weight â†’
        </button>
      </div>
      <StatsChart labels={labels} weightData={weightData} units={units} />
    </div>
  );
}
