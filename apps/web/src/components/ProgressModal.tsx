import React from 'react';
import { motion } from 'framer-motion';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ArcElement,
} from 'chart.js';
import type { WorkoutLog } from '../lib/firebase-data-service';
import type { Exercise } from '@myfitness/shared';
import { exerciseService } from '../lib/firebase-data-service';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ArcElement,
);

const getLastNDays = (n: number) => {
  const result = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }
  return result;
};

interface ExerciseData extends WorkoutLog {
  exercise?: Exercise;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  cardio: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  strength: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
  stretching: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
  full_body: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
};

const intensityColors: Record<string, { bg: string; text: string; ring: string }> = {
  low: { 
    bg: 'bg-green-100 dark:bg-green-900/30', 
    text: 'text-green-700 dark:text-green-300',
    ring: 'ring-green-500/20'
  },
  medium: { 
    bg: 'bg-yellow-100 dark:bg-yellow-900/30', 
    text: 'text-yellow-700 dark:text-yellow-300',
    ring: 'ring-yellow-500/20'
  },
  high: { 
    bg: 'bg-red-100 dark:bg-red-900/30', 
    text: 'text-red-700 dark:text-red-300',
    ring: 'ring-red-500/20'
  },
};

export default function ProgressModal({
  open,
  title,
  progress,
  data,
  isExercise,
  onClose,
  onOpenGif,
}: {
  open: boolean;
  title: string;
  progress?: { value: number; total: number } | null;
  data?: { date: string; value: number }[] | WorkoutLog[];
  isExercise?: boolean;
  onClose: () => void;
  onOpenGif?: (exerciseId: string) => void;
}) {
  if (!open) return null;

  const pct = React.useMemo(() => 
    progress ? Math.round((progress.value / Math.max(1, progress.total)) * 100) : 0,
    [progress]
  );
  const labels = React.useMemo(() => getLastNDays(7), []);

  // Fetch exercises from Firebase
  const [exercises, setExercises] = React.useState<Exercise[]>([]);
  const [exercisesLoading, setExercisesLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchExercises = async () => {
      if (!isExercise) {
        setExercisesLoading(false);
        return;
      }

      try {
        setExercisesLoading(true);
        const fetchedExercises = await exerciseService.getExercises();
        setExercises(fetchedExercises);
      } catch (error) {
        console.error('Error fetching exercises:', error);
      } finally {
        setExercisesLoading(false);
      }
    };

    fetchExercises();
  }, [isExercise]);

  // Process exercise data
  const exerciseData = React.useMemo(() => {
    if (!isExercise || !data || exercisesLoading) return null;
    const logs = (data as WorkoutLog[]).map(log => ({
      ...log,
      exercise: exercises.find(ex => ex.id === (log as any).exerciseId)
    }));

    const byCategory = logs.reduce((acc, log) => {
      const category = log.exercise?.category || 'other';
      acc[category] = (acc[category] || 0) + ((log as any).durationMinutes ?? 0);
      return acc;
    }, {} as Record<string, number>);

    return {
      logs,
      categories: byCategory
    };
  }, [data, isExercise, exercises, exercisesLoading]);

  // selected exercise id for showing a main GIF / focus
  const [selectedExerciseId, setSelectedExerciseId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (exerciseData && exerciseData.logs.length > 0 && exerciseData.logs[0]?.exercise?.id) {
      // default to the most recent exercise's exercise id
      setSelectedExerciseId(exerciseData.logs[0].exercise.id);
    } else {
      setSelectedExerciseId(null);
    }
  }, [exerciseData]);

    const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data: isExercise 
          ? labels.map(label => {
              const dayLogs = (data as WorkoutLog[]).filter((log: any) => (log.date ?? '').includes(label.split(' ')[1] ?? '')) || [];
              return dayLogs.reduce((sum: number, log: any) => sum + (log.durationMinutes ?? 0), 0);
            })
          : data?.slice(-7).map(d => (d as any).value) ?? labels.map(() => Math.round(Math.random() * 50 + 50)),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: 'easeInOutQuart' as const
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgb(17 24 39 / 0.8)',
        titleColor: 'rgb(243 244 246)',
        bodyColor: 'rgb(243 244 246)',
        borderColor: 'rgb(75 85 99)',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: '#666',
          font: { size: 11 },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#666',
          font: { size: 11 },
        },
      },
    },
  };

  // Accessibility: Escape to close and focus trap
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const getFocusable = () =>
      Array.from(
        root.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled'));
    const focusable = getFocusable();
    (focusable[0] ?? root).focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const items = getFocusable();
        if (items.length === 0) return;
        const idx = items.findIndex((el) => el === document.activeElement);
        if (e.shiftKey) {
          if (idx <= 0) {
            e.preventDefault();
            const lastItem = items[items.length - 1];
            if (lastItem) lastItem.focus();
          }
        } else {
          if (idx === -1 || idx >= items.length - 1) {
            e.preventDefault();
            const firstItem = items[0];
            if (firstItem) firstItem.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="relative z-10 w-full max-w-lg bg-white dark:bg-neutral-800  p-6 shadow-lg max-h-[90vh] overflow-y-auto outline-none"
        role="dialog"
        aria-modal="true"
        aria-label={`${title} details`}
        ref={containerRef}
        tabIndex={-1}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-black dark:text-white">{title}</h3>
            <div className="text-sm text-muted-foreground">Detailed progress</div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-black dark:hover:text-white">âœ•</button>
        </div>

        {/* If exercise modal, show a header area with main GIF and quick stats */}
        {isExercise && exerciseData && (
          (() => {
            const logs = exerciseData.logs ?? [];
            return (
              <div className="mt-6 grid grid-cols-1 gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Exercises</div>
                    <div className="text-2xl font-bold">{logs.length} Workouts</div>
                  </div>
                  <div className="w-28 h-28  overflow-hidden bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                    {selectedExerciseId ? (
                      <img src={logs.find(l => l.exercise?.id === selectedExerciseId)?.exercise?.imageUrl as string | undefined} alt="exercise gif" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-sm text-muted-foreground">No image</div>
                    )}
                  </div>
                </div>

                {/* Thumbnails row */}
                <div className="grid grid-cols-3 gap-3">
                  {logs.map((log) => (
                    <button
                      key={(log as any).id}
                      onClick={() => {
                        const exId = log.exercise?.id ?? null;
                        if (exId && onOpenGif) {
                          onOpenGif(exId);
                        } else {
                          setSelectedExerciseId(log.exercise?.id ?? null);
                        }
                      }}
                      className={` overflow-hidden border ${selectedExerciseId === log.exercise?.id ? 'ring-2 ring-blue-400' : 'border-transparent'}`}
                      title={`${log.exercise?.name} â€¢ ${(log as any).durationMinutes} mins`}
                    >
                      <img src={log.exercise?.imageUrl} alt={log.exercise?.name} className="w-full h-20 object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })()
        )}

        <div className="mt-6 grid grid-cols-1 gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-28 h-28 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold">{pct}%</div>
            <div>
              <div className="text-sm text-muted-foreground">Progress</div>
              <div className="text-xl font-semibold">{progress?.value ?? 0}/{progress?.total ?? 0}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {progress?.total && progress?.value
                  ? `${progress.total - progress.value} remaining`
                  : 'No target set'}
              </div>
            </div>
          </div>

          {isExercise && exerciseData && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <h4 className="font-medium">Exercise Categories</h4>
                <div className="space-y-2">
                  {Object.entries(exerciseData.categories).map(([category, duration]) => (
                    <div key={category} className={`flex items-center justify-between p-2  ${categoryColors[category]?.bg || 'bg-gray-100'}`}>
                      <span className={`capitalize ${categoryColors[category]?.text || 'text-gray-700'}`}>{category}</span>
                      <span className="font-medium">{duration}min</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Exercise Distribution</h4>
                <div className="h-48">
                  <Doughnut
                    data={{
                      labels: Object.keys(exerciseData.categories).map(c => c.charAt(0).toUpperCase() + c.slice(1)),
                      datasets: [{
                        data: Object.values(exerciseData.categories),
                        backgroundColor: ['#3B82F6', '#EF4444', '#10B981', '#8B5CF6'],
                        borderWidth: 0,
                      }],
                    }}
                    options={{
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: { boxWidth: 10, padding: 10 },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Progress History</h4>
              <select className="text-sm bg-transparent border-gray-200 dark:border-gray-700 ">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 3 months</option>
              </select>
            </div>
            <div className="h-64">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {isExercise && exerciseData ? (() => {
            const logs = exerciseData.logs ?? [];
            const totalCalories = logs.reduce((sum, log: any) => sum + (log.caloriesBurned ?? 0), 0);
            const avgDuration = logs.length ? Math.round(logs.reduce((sum, log: any) => sum + (log.durationMinutes ?? 0), 0) / logs.length) : 0;
            return (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4  text-center">
                    <div className="text-sm text-muted-foreground mb-1">Total Calories</div>
                    <div className="text-2xl font-bold">{totalCalories}</div>
                    <div className="text-sm text-muted-foreground">kcal burned</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4  text-center">
                    <div className="text-sm text-muted-foreground mb-1">Avg. Duration</div>
                    <div className="text-2xl font-bold">{avgDuration}</div>
                    <div className="text-sm text-muted-foreground">mins/session</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4  text-center">
                    <div className="text-sm text-muted-foreground mb-1">Intensity Split</div>
                    <div className="flex justify-center items-center gap-1 mt-2">
                      {(['low', 'medium', 'high'] as const).map(level => {
                        const count = logs.filter((log: any) => (log.intensity === level)).length;
                        return (
                          <div
                            key={level}
                            className={`h-8 w-3 rounded-full ${intensityColors[level]?.bg || 'bg-gray-300'} ${count > 0 ? 'opacity-100' : 'opacity-30'}`}
                            style={{ height: `${logs?.length ? (count / logs.length) * 32 : 0}px` }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Recent Workouts</h4>
                  <div className="space-y-3">
                    {logs.slice(0, 3).map((log: any) => (
                      <div key={log.id} className="bg-gray-50 dark:bg-gray-900/50 p-4 ">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="font-medium">{log.exercise?.name || 'Unknown Exercise'}</div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${intensityColors[log.intensity]?.bg || 'bg-gray-300'} ${intensityColors[log.intensity]?.text || 'text-gray-700'}`}>
                                {log.intensity?.charAt(0).toUpperCase() + (log.intensity?.slice(1) ?? '')}
                              </span>
                              <span className="text-sm text-muted-foreground">{log.date ? new Date(log.date).toLocaleDateString() : 'Unknown date'}</span>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="flex items-center gap-2 justify-end">
                              <span className="font-medium">{log.durationMinutes} mins</span>
                              <span className="text-sm text-muted-foreground">â€¢</span>
                              <span className="font-medium">{log.caloriesBurned} kcal</span>
                            </div>
                            {log.notes && (
                              <div className="text-sm text-muted-foreground italic">{log.notes}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })() : (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 ">
                <div className="text-sm text-muted-foreground">Average</div>
                <div className="font-semibold mt-1">
                  {data
                    ? Math.round(data.reduce((acc: any, curr: any) => acc + curr.value, 0) / data.length)
                    : '-'}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 ">
                <div className="text-sm text-muted-foreground">Best</div>
                <div className="font-semibold mt-1">
                  {data
                    ? Math.max(...data.map((d: any) => d.value))
                    : '-'}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 ">
                <div className="text-sm text-muted-foreground">Recent</div>
                <div className="font-semibold mt-1">
                  {data
                    ? (data[data.length - 1] as any).value
                    : '-'}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
