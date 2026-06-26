import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import StatsChart from './StatsChart';
import { useToast } from '../providers/toast-provider';

interface DetailedStatsModalProps {
  onClose: () => void;
  labels: string[];
  weightData?: { week: string; weight: number }[];
  onUpdateWeight?: (weight: number) => void;
  currentWeight?: number;
  isUpdating?: boolean;
  isSuccess?: boolean;
  units?: 'metric' | 'imperial';
}

export default function DetailedStatsModal({
  onClose,
  labels,
  weightData,
  onUpdateWeight,
  currentWeight,
  isUpdating = false,
  isSuccess = false,
  units = 'metric'
}: DetailedStatsModalProps) {
  const [newWeight, setNewWeight] = useState("");
  const modalRef = useRef<HTMLDivElement | null>(null);
  const { showError } = useToast();

  // Clear form when update is successful
  useEffect(() => {
    if (isSuccess) {
      setNewWeight("");
    }
  }, [isSuccess]);

  // Focus trap and Escape to close
  useEffect(() => {
    const root = modalRef.current;
    if (!root) return;

    const getFocusable = () =>
      Array.from(
        root.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled'));

    const focusable = getFocusable();
    (focusable[0] ?? root).focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const items = getFocusable();
        if (items.length === 0) return;
        const activeIndex = items.findIndex((el) => el === document.activeElement);
        if (e.shiftKey) {
          if (activeIndex <= 0) {
            e.preventDefault();
            const lastItem = items[items.length - 1];
            if (lastItem) lastItem.focus();
          }
        } else {
          if (activeIndex === -1 || activeIndex >= items.length - 1) {
            e.preventDefault();
            const firstItem = items[0];
            if (firstItem) firstItem.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleWeightUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newWeight || newWeight.trim().length === 0) {
      showError('Please enter a weight value');
      return;
    }

    const weight = parseFloat(newWeight);
    
    if (isNaN(weight)) {
      showError('Please enter a valid number');
      return;
    }

    if (weight <= 0) {
      showError('Weight must be greater than 0');
      return;
    }

    if (weight > 1000) {
      showError('Weight must be less than 1000 kg');
      return;
    }

    if (!onUpdateWeight) {
      console.error('onUpdateWeight callback is not provided');
      return;
    }

    if (isUpdating) {
      return; // Prevent duplicate submissions
    }

    try {
      await onUpdateWeight(weight);
    } catch (error: any) {
      console.error("Failed to update weight:", error);
      const errorMessage = error?.message || 'Failed to update weight. Please try again.';
      showError(errorMessage);
    }
  };

  // Stop propagation to prevent closing the modal when clicking inside
  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center" onClick={onClose}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Weight progress details"
        className="bg-card  p-6 shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto outline-none"
        onClick={handleModalContentClick}
        tabIndex={-1}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Weight Progress</h2>
          <button onClick={onClose} className="px-4 py-2  bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Close</button>
        </div>
        <div className="mt-4 text-sm text-gray-100 dark:text-gray-300 mb-4">
          Track your weight progress over the last 3 months. Update your weight to see real-time changes in your chart.
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            {/* Weight Update Section */}
            {onUpdateWeight && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800  border border-green-200 dark:border-green-800">
                <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">Update Weight</h4>
                <div className="mb-2">
                  <span className="text-sm text-green-700 dark:text-green-300">Current Weight: </span>
                  <span className="font-bold text-green-800 dark:text-green-200">{currentWeight || 'N/A'} kg</span>
                </div>
                <form onSubmit={handleWeightUpdate} className="space-y-3">
                  <div>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      className="w-full px-3 py-2 border border-green-300 dark:border-green-600  bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-green-500"
                      placeholder="Enter new weight (kg)"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      disabled={isUpdating}
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={isUpdating || !newWeight}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold  transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? "Updating..." : isSuccess ? "âœ“ Updated!" : "Update Weight"}
                  </motion.button>
                </form>
              </div>
            )}
          </div>
          <div className="lg:col-span-2 h-[60vh]">
            <StatsChart labels={labels} weightData={weightData} units={units} />
          </div>
        </div>
      </div>
    </div>
  );
}
