import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Star, Zap, Award, Flame, Target, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../providers/auth-provider';
import { workoutService } from '../lib/firebase-data-service';
import { getUserAchievements, type Achievement } from '../lib/firebase-achievement-service';

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Trophy,
  Star,
  Zap,
  Award,
  Flame,
  Target,
};

export default function AchievementsPage() {
  const { user } = useAuth();

  // Fetch workout logs
  const { data: workoutLogs = [] } = useQuery({
    queryKey: ['workouts', 'logs', user?.uid],
    queryFn: () => workoutService.getLogs(user!.uid),
    enabled: !!user?.uid,
  });

  // Fetch achievements - depends on workout logs
  const { data: achievements = [], isLoading } = useQuery<Achievement[]>({
    queryKey: ['achievements', user?.uid, workoutLogs.length],
    queryFn: () => getUserAchievements(user!.uid, workoutLogs),
    enabled: !!user?.uid,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Achievements</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
        </div>
      </div>
    );
  }

  const IconComponent = (iconName: string) => iconMap[iconName] || Trophy;
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Achievements</h1>
      </div>
      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {achievements.map((ach, index) => {
          const Icon = IconComponent(ach.icon);
          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-white dark:bg-gray-800  p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transform hover:-translate-y-1 transition-all duration-300 ${
                !ach.achieved ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-4  shadow-lg ${
                  ach.achieved 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-gray-400 text-white'
                }`}>
                  <Icon size={28} />
                </div>
                
                <div className="flex-1">
                  <h2 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{ach.title}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{ach.description}</p>
                  
                  {ach.achieved && ach.achievedDate ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Unlocked on {new Date(ach.achievedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{ach.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div 
                          className="bg-blue-600 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${ach.progress}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {ach.achieved && ach.achievedDate && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center space-x-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                      Achievement Unlocked!
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
      
      {/* Stats Summary */}
      <div className="bg-white dark:bg-gray-800  p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-gray-50 dark:bg-gray-800 p-4  border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              {achievements.filter(a => a.achieved).length}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300 font-medium">Achievements Unlocked</div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4  border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {achievements.filter(a => !a.achieved).length}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">In Progress</div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4  border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
              {achievements.length > 0 
                ? Math.round((achievements.filter(a => a.achieved).length / achievements.length) * 100)
                : 0}%
            </div>
            <div className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">Completion Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}
