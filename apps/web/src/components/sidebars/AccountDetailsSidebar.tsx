import React from 'react';
import { MotivationCard } from '../MotivationCard';

interface User {
  weightKg?: number;
  heightCm?: number;
}

interface AccountDetailsSidebarProps {
  currentUser: User | null;
}

export default function AccountDetailsSidebar({ currentUser }: AccountDetailsSidebarProps) {
  const calculateBMI = () => {
    if (!currentUser?.weightKg || !currentUser?.heightCm) return null;
    if (currentUser.weightKg <= 0 || currentUser.heightCm <= 0) return null;
    const heightInMeters = currentUser.heightCm / 100;
    return (currentUser.weightKg / (heightInMeters * heightInMeters)).toFixed(1);
  };
  
  const bmi = calculateBMI();
  const getHealthStatus = () => {
    if (!bmi) return null;
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return { status: 'Underweight', text: 'text-blue-600 dark:text-blue-400' };
    if (bmiValue < 25) return { status: 'Normal', text: 'text-emerald-600 dark:text-emerald-400' };
    if (bmiValue < 30) return { status: 'Overweight', text: 'text-yellow-600 dark:text-yellow-400' };
    return { status: 'Obese', text: 'text-red-600 dark:text-red-400' };
  };
  
  const healthStatus = getHealthStatus();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800  p-6 shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
        <div className="text-xl font-bold text-gray-900 dark:text-white">
          Account Details
        </div>
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4  border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Member Since</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4  border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Last Active</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">Today</div>
          </div>
          {!bmi || !healthStatus ? (
            <div className="bg-gray-50 dark:bg-gray-800 p-4  border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Health Status</div>
              <div className="text-lg font-bold text-gray-700 dark:text-gray-300 mt-2">Complete profile to see BMI</div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 p-4  border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Health Status</div>
              <div className={`text-2xl font-bold mt-2 ${healthStatus.text}`}>{healthStatus.status}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">BMI: {bmi}</div>
            </div>
          )}
        </div>
      </div>
      <MotivationCard />
    </div>
  );
}
