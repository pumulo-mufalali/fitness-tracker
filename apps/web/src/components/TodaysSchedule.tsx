import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../providers/auth-provider';
import { getUserSchedule } from '../lib/firebase-schedule-service';
import type { Schedule, ScheduleItem } from '@myfitness/shared';
import { Clock, Activity, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

const COLLAPSED_LIMIT = 3;

interface TodaysScheduleProps {
  onNav?: (page: string) => void;
}

export default function TodaysSchedule({ onNav }: TodaysScheduleProps) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const { data: schedule, isLoading } = useQuery<Schedule | null>({
    queryKey: ['schedule', user?.uid],
    queryFn: () => getUserSchedule(user!.uid),
    enabled: !!user?.uid,
  });

  // Get today's day name
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayKey = today.toLowerCase() as keyof Schedule;
  const todaySchedule: ScheduleItem[] = (schedule?.[todayKey] as ScheduleItem[]) || [];

  const visibleItems = expanded ? todaySchedule : todaySchedule.slice(0, COLLAPSED_LIMIT);
  const hasMore = todaySchedule.length > COLLAPSED_LIMIT;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 shadow-md rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="text-base font-semibold text-gray-900 dark:text-white mb-4">Today's Schedule</div>
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 shadow-md rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="text-base font-semibold text-gray-900 dark:text-white">
          Today's Schedule
          {todaySchedule.length > 0 && (
            <span className="ml-2 text-xs font-normal text-gray-400 dark:text-gray-500">{today}</span>
          )}
        </div>
        <button
          onClick={(e) => { e.preventDefault(); onNav?.('schedule'); }}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors flex items-center gap-1"
        >
          <Calendar className="w-4 h-4" />
          View All
        </button>
      </div>

      {todaySchedule.length === 0 ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">No activities for today</p>
          <button
            onClick={(e) => { e.preventDefault(); onNav?.('schedule'); }}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
          >
            Create Schedule
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {visibleItems.map((item: ScheduleItem, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2.5 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="rounded-lg bg-blue-500/10 p-1.5 shrink-0">
                        <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0">{item.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Activity className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span className="text-xs font-medium text-gray-800 dark:text-white truncate">{item.activity}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {hasMore && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="mt-3 w-full flex items-center justify-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1"
            >
              {expanded ? (
                <><ChevronUp className="w-3.5 h-3.5" /> Show less</>
              ) : (
                <><ChevronDown className="w-3.5 h-3.5" /> {todaySchedule.length - COLLAPSED_LIMIT} more</>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}