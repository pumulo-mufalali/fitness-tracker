import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../providers/auth-provider';
import { getUserSchedule, updateUserSchedule } from '../lib/firebase-schedule-service';
import type { Schedule, ScheduleItem } from '@myfitness/shared';
import { Clock, Activity, Calendar } from 'lucide-react';
import EditDayScheduleForm from './EditDayScheduleForm';

interface TodaysScheduleProps {
  onNav?: (page: string) => void;
}

export default function TodaysSchedule({ onNav }: TodaysScheduleProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingDay, setEditingDay] = useState<string | null>(null);

  // Fetch schedule from Firebase
  const { data: schedule, isLoading } = useQuery<Schedule | null>({
    queryKey: ['schedule', user?.uid],
    queryFn: () => getUserSchedule(user!.uid),
    enabled: !!user?.uid,
  });

  // Update schedule mutation
  const updateScheduleMutation = useMutation({
    mutationFn: (scheduleData: Partial<Omit<Schedule, 'id' | 'createdAt'>>) =>
      updateUserSchedule(user!.uid, scheduleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule', user?.uid] });
    },
  });

  const handleSaveDay = (day: string, items: ScheduleItem[]) => {
    const dayKey = day.toLowerCase() as keyof Schedule;
    updateScheduleMutation.mutate({ [dayKey]: items });
    setEditingDay(null);
  };

  // Get today's day name
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayKey = today.toLowerCase() as keyof Schedule;
  const todaySchedule: ScheduleItem[] = (schedule?.[todayKey] as ScheduleItem[]) || [];

  if (isLoading) {
    return (
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl  p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 h-full">
        <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">Today's Schedule</div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl  p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Today's Schedule
          </div>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            onNav?.('schedule');
          }}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors flex items-center gap-1"
        >
          <Calendar className="w-4 h-4" />
          View All
        </button>
      </div>

      <div className="space-y-4">
        {todaySchedule.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              No activities scheduled for today
            </p>
            <button
              onClick={(e) => {
                e.preventDefault();
                onNav?.('schedule');
              }}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium  transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Create Schedule
            </button>
          </div>
        ) : (
          Array.isArray(todaySchedule) && todaySchedule.map((item: ScheduleItem, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4  border border-blue-200/50 dark:border-blue-700/50 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-500/10 p-2 ">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{item.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="font-semibold text-sm text-gray-800 dark:text-white">{item.activity}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {todaySchedule.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"></div>
      )}
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 font-medium text-center">
        {today}
      </p>
    </div>
  );
}
