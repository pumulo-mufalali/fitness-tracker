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
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm  p-6 shadow-xl border border-white/20 dark:border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
