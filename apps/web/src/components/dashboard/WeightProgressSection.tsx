import React from 'react';
import { ArrowRight } from 'lucide-react';
import { getWeightUnit } from '../../lib/unit-conversion';

interface WeightProgressSectionProps {
  labels: string[];
  weightData: { week: string; weight: number }[];
  units: 'metric' | 'imperial';
  onUpdateWeight: () => void;
}

export default function WeightProgressSection({
  units,
  onUpdateWeight
}: WeightProgressSectionProps) {
  return (
    <div className="h-full bg-white dark:bg-gray-900 px-4 sm:px-6 lg:px-8 py-4 shadow-md rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
        Weight progress for 3 months ({getWeightUnit(units)})
      </span>
      <button
        onClick={onUpdateWeight}
        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors flex items-center gap-1"
      >
        View <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
