import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import type { WeightEntry } from "../lib/firebase-data-service";
import { useState } from "react";
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
  ChartOptions,
  ChartData
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface WeightChartProps {
  weightHistory: WeightEntry[];
  currentWeight: number;
  onAddWeight: (weight: number) => void;
  isAdding: boolean;
}

export function WeightChart({ weightHistory, currentWeight, onAddWeight, isAdding }: WeightChartProps) {
  const [newWeight, setNewWeight] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weight = parseFloat(newWeight);
    if (!isNaN(weight) && weight > 0) {
      onAddWeight(weight);
      setNewWeight("");
    }
  };

  const chartData: ChartData<"line"> = {
    labels: weightHistory.map(entry => entry.date),
    datasets: [{
      label: "Weight (kg)",
      data: weightHistory.map(entry => entry.weight),
      borderColor: "rgb(59, 130, 246)",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      tension: 0.3,
      fill: true
    }]
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgb(17 24 39 / 0.8)',
        titleColor: 'rgb(243 244 246)',
        bodyColor: 'rgb(243 244 246)',
        borderColor: 'rgb(75 85 99)',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: "rgba(107, 114, 128, 0.1)"
        },
        ticks: {
          color: "#666",
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: "#666",
          font: {
            size: 11
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white dark:bg-gray-800  shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="bg-emerald-600 rounded-full p-3">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Weight Tracking</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Current: {currentWeight} kg</p>
          </div>
        </div>
      </div>

      <div className="h-64 mb-6">
        {weightHistory.length > 0 ? (
          <Line data={chartData} options={chartOptions} key="weight-chart" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            No weight entries yet. Add your first entry below.
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="number"
          step="0.1"
          className="flex-1  border-gray-300 dark:border-gray-700 shadow-sm focus:border-green-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
          placeholder="Enter weight in kg"
          value={newWeight}
          onChange={(e) => setNewWeight(e.target.value)}
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium  shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={isAdding || !newWeight}
        >
          {isAdding ? "Adding..." : "Add Entry"}
        </motion.button>
      </form>
    </motion.div>
  );
}