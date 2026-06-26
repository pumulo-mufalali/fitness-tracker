import React from 'react';
import type { Goal } from '@myfitness/shared';

interface GoalInsightsSidebarProps {
  goals: Goal[];
}

export default function GoalInsightsSidebar({ goals }: GoalInsightsSidebarProps) {
  const goalsInProgress = goals.filter(goal => {
    const progress = (goal.current / goal.target) * 100;
    return progress > 0 && progress < 100;
  }).length;

  const completedGoals = goals.filter(goal => {
    const progress = (goal.current / goal.target) * 100;
    return progress >= 100;
  }).length;

  const averageCompletion = goals.length > 0
    ? Math.round(goals.reduce((sum, goal) => sum + Math.min(100, (goal.current / goal.target) * 100), 0) / goals.length)
    : 0;

  return (
    <div className="bg-white dark:bg-gray-800  p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
      <div className="text-xl font-bold text-gray-900 dark:text-white">
        Goal Insights
      </div>
      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-4  border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Goals in progress</div>
          <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-2">{goalsInProgress}</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-4  border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">Completed goals</div>
          <div className="text-3xl font-bold text-green-700 dark:text-green-300 mt-2">{completedGoals}</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-4  border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Average completion</div>
          <div className="text-3xl font-bold text-purple-700 dark:text-purple-300 mt-2">{averageCompletion}%</div>
        </div>
      </div>
    </div>
  );
}
