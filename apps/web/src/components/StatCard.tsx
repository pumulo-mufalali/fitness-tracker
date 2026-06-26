import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export interface StatCardProps {
  title: string;
  main: string;
  sub?: string;
  progress?: { value: number; total: number } | null;
  gradientClass?: string;
  icon?: React.ReactNode;
  onOpen?: () => void;
}

function StatCardComponent({ title, main, sub, progress, gradientClass = 'bg-blue-600', icon, onOpen }: StatCardProps) {
  const progressPct = useMemo(() => 
    progress ? Math.round((progress.value / Math.max(1, progress.total)) * 100) : 0,
    [progress]
  );
  
  const { radius, stroke, normalizedRadius, circumference, offset } = useMemo(() => {
    const r = 32;
    const s = 6;
    const normRadius = r - s / 2;
    const circ = 2 * Math.PI * normRadius;
    const off = progress ? circ * (1 - progress.value / Math.max(1, progress.total)) : circ;
    return {
      radius: r,
      stroke: s,
      normalizedRadius: normRadius,
      circumference: circ,
      offset: off
    };
  }, [progress]);

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      onClick={onOpen}
      className=" p-0 shadow-sm hover:shadow-md text-black dark:text-white w-[320px] flex-shrink-0 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 transform hover:-translate-y-1 transition-all duration-300"
      style={{ background: undefined }}
    >
      <div className={`p-6  ${gradientClass} text-white border border-white/10`}>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="text-sm font-medium opacity-90">{title}</div>
            <div className="text-3xl font-bold">{main}</div>
            {sub && <div className="text-sm opacity-90">{sub}</div>}
          </div>
          <div className="ml-4">{icon}</div>
        </div>

        {progress && (
          <div className="mt-4 flex items-center">
            <div
              aria-label={`Open ${title} details`}
              className="relative w-20 h-20 p-0 m-0 bg-transparent border-0"
            >
              <svg className="w-20 h-20" viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
                <circle
                  cx={radius}
                  cy={radius}
                  r={normalizedRadius}
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth={stroke}
                  fill="none"
                />
                <motion.circle
                  cx={radius}
                  cy={radius}
                  r={normalizedRadius}
                  stroke="white"
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">{progress.value}/{progress.total}</div>
            </div>
            <div className="ml-4 text-sm opacity-90">{sub}</div>
          </div>
        )}
      </div>
    </motion.button>
  );
}

export const StatCard = React.memo(StatCardComponent);
export default StatCard;
