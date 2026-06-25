import React from 'react';
import { motion } from 'framer-motion';
import { Play, Timer } from 'lucide-react';

export default function HeaderBar({ title, weekLine, onNav }: { title: string; weekLine?: string; onNav?: (page: string) => void }) {
  return (
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-5xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent"
            >
              {title}
            </motion.h1>
          </div>

          <div className="flex items-center gap-6">
            {weekLine && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-4 py-2.5  border border-gray-200 dark:border-gray-700"
              >
                {weekLine}
              </motion.div>
            )}
            
            {onNav && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 40px -12px rgba(99, 102, 241, 0.5)",
                }}
                whileTap={{ scale: 0.97 }}
                onClick={(e) => {
                  e.preventDefault();
                  onNav?.('exercises');
                }}
                className="group relative px-7 py-4  bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-bold text-base tracking-wide transition-all duration-300 shadow-2xl hover:shadow-indigo-500/50 border border-white/20 overflow-hidden"
              >
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '200%' }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                />
                
                {/* Content */}
                <div className="relative flex items-center gap-2.5">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      repeatDelay: 3,
                      ease: "easeInOut"
                    }}
                  >
                    <Timer className="w-5 h-5" strokeWidth={2.5} />
                  </motion.div>
                  <span className="relative z-10">Exercise with Timer</span>
                  <motion.div
                    initial={{ x: -4, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ x: 2 }}
                  >
                    <Play className="w-4 h-4" strokeWidth={3} />
                  </motion.div>
                </div>
              </motion.button>
            )}
          </div>
        </div>
      </div>
  );
}
