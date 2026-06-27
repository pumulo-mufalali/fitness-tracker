import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getWeightUnit } from '../lib/unit-conversion';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface WeightData {
  week: string;
  weight: number;
}

export default function StatsChart({ 
  labels, 
  datasets, 
  weightData,
  units = 'metric'
}: { 
  labels: string[]; 
  datasets?: any[];
  weightData?: WeightData[];
  units?: 'metric' | 'imperial';
}) {

  const weightUnit = getWeightUnit(units);

  const hasWeightData = weightData && weightData.length > 0;

  // Check if all weights are the same (straight line scenario)
  const allWeightsSame = hasWeightData
    ? weightData!.every(d => d.weight === weightData![0]?.weight)
    : false;

  const data = {
    labels: hasWeightData ? weightData!.map(d => d.week) : labels,
    datasets: hasWeightData ? [
      {
        label: `Weight (${weightUnit})`,
        data: weightData!.map(d => d.weight),
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        tension: allWeightsSame ? 0 : 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ] : (datasets ?? [
      {
        label: 'Exercise',
        data: labels.map((_, i) => Math.round(Math.sin(i / 4) * 10 + 20)),
        borderColor: 'rgba(59,130,246,1)',
        backgroundColor: 'rgba(59,130,246,0.15)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Meals',
        data: labels.map((_, i) => Math.round(Math.cos(i / 6) * 8 + 14)),
        borderColor: 'rgba(239,68,68,1)',
        backgroundColor: 'rgba(239,68,68,0.12)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Sleep',
        data: labels.map((_, i) => Math.round(6 + Math.abs(Math.sin(i / 8)) * 2)),
        borderColor: 'rgba(16,185,129,1)',
        backgroundColor: 'rgba(16,185,129,0.12)',
        tension: 0.4,
        fill: true,
      },
    ]),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom' as const,
        labels: {
          color: weightData ? '#22c55e' : undefined,
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#22c55e',
        borderWidth: 1,
        callbacks: hasWeightData ? {
          label: function(context: any) {
            return `Weight: ${context.parsed.y} ${weightUnit}`;
          }
        } : undefined
      }
    },
    scales: {
      x: { 
        grid: { display: false }, 
        ticks: { maxTicksLimit: 12 },
        title: {
          display: weightData ? true : false,
          text: weightData ? 'Week of 3 Months' : undefined,
          color: '#666',
          font: { size: 12 }
        }
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ...(hasWeightData ? { min: 20 } : {}),
        title: {
          display: !!hasWeightData,
          text: hasWeightData ? `Weight (${weightUnit})` : undefined,
          color: '#666',
          font: { size: 12 }
        },
        ticks: hasWeightData ? {
          callback: function(value: any) {
            return value + ` ${weightUnit}`;
          },
          stepSize: 5,
        } : undefined,
      },
    },
  };

  if (weightData && !hasWeightData) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 text-center p-6">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No weight data yet</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">Log in and record your weight to see your progress here</p>
      </div>
    );
  }

  return (
    <div className="bg-card p-4 shadow-md rounded-xl h-full">
      <Line data={data} options={options as any} />
    </div>
  );
}
