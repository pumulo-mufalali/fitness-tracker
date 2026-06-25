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
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm  p-6 shadow-xl border border-white/20 dark:border-gray-700/50 space-y-6">
      <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Goal Insights
      </div>
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4  border border-blue-200/50 dark:border-blue-700/50">
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">Goals in progress</div>
          <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-2">{goalsInProgress}</div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4  border border-green-200/50 dark:border-green-700/50">
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">Completed goals</div>
          <div className="text-3xl font-bold text-green-700 dark:text-green-300 mt-2">{completedGoals}</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4  border border-purple-200/50 dark:border-purple-700/50">
          <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Average completion</div>
          <div className="text-3xl font-bold text-purple-700 dark:text-purple-300 mt-2">{averageCompletion}%</div>
        </div>
      </div>
    </div>
  );
}
