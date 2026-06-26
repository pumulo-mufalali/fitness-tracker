import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../providers/auth-provider';
import EditDayScheduleForm from '../components/EditDayScheduleForm';
import { motion } from 'framer-motion';
import { Clock, Activity } from 'lucide-react';
import { getUserSchedule, updateUserSchedule } from '../lib/firebase-schedule-service';
import type { Schedule, ScheduleItem } from '@myfitness/shared';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function SchedulePage() {
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

  const defaultSchedule: Schedule = {
    id: 'weekly',
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  };

  const currentSchedule = schedule || defaultSchedule;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Workout Schedule</h1>
      </div>

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {days.map((day, index) => {
          const dayKey = day.toLowerCase() as keyof Schedule;
          const daySchedule = Array.isArray(currentSchedule[dayKey]) 
            ? (currentSchedule[dayKey] as ScheduleItem[])
            : [];
          
          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800  p-6 shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transform hover:-translate-y-1 transition-all duration-300"
              onClick={() => setEditingDay(day)}
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{day}</h2>
                <div className="w-12 h-1 bg-blue-600 rounded-full mx-auto"></div>
              </div>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {daySchedule.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                    No activities scheduled
                  </div>
                ) : (
                  daySchedule.map((item, itemIndex) => (
                    <motion.div
                      key={itemIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: itemIndex * 0.1 }}
                      className="bg-gray-50 dark:bg-gray-800 p-3  border border-gray-200/50 dark:border-gray-600/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-500/10 p-1.5  shrink-0">
                            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">{item.time}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Activity className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
                          <span className="font-semibold text-sm text-gray-800 dark:text-white break-words break-all line-clamp-2 leading-tight">{item.activity}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              
              <div className="mt-4 text-center">
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  Click to edit
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {editingDay && (
        <EditDayScheduleForm
          day={editingDay}
          initialItems={Array.isArray(currentSchedule[editingDay.toLowerCase() as keyof Schedule])
            ? (currentSchedule[editingDay.toLowerCase() as keyof Schedule] as ScheduleItem[])
            : []}
          onClose={() => setEditingDay(null)}
          onSave={(items) => handleSaveDay(editingDay, items)}
        />
      )}
    </div>
  );
}
