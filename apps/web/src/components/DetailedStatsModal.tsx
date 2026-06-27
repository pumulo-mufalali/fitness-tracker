﻿import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';
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
  const unitLabel = units === 'imperial' ? 'lbs' : 'kg';

  useEffect(() => {
    if (isSuccess) setNewWeight("");
  }, [isSuccess]);

  useEffect(() => {
    const root = modalRef.current;
    if (!root) return;

    const getFocusable = () =>
      Array.from(
        root.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled'));

    (getFocusable()[0] ?? root).focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key === 'Tab') {
        const items = getFocusable();
        if (!items.length) return;
        const idx = items.findIndex((el) => el === document.activeElement);
        if (e.shiftKey) {
          if (idx <= 0) { e.preventDefault(); items[items.length - 1]?.focus(); }
        } else {
          if (idx === -1 || idx >= items.length - 1) { e.preventDefault(); items[0]?.focus(); }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleWeightUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight.trim()) { showError('Please enter a weight value'); return; }
    const weight = parseFloat(newWeight);
    if (isNaN(weight)) { showError('Please enter a valid number'); return; }
    if (weight <= 0) { showError('Weight must be greater than 0'); return; }
    if (weight > 1000) { showError(`Weight must be less than 1000 ${unitLabel}`); return; }
    if (!onUpdateWeight || isUpdating) return;
    try {
      await onUpdateWeight(weight);
    } catch (error: any) {
      showError(error?.message || 'Failed to update weight. Please try again.');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-50"
      />

      {/* Panel */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label="Weight progress details"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md w-full max-w-4xl outline-none pointer-events-auto overflow-hidden max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Weight Progress</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left — update form */}
            {onUpdateWeight && (
              <div className="lg:col-span-1 space-y-4">
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Update Weight</h4>

                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Current weight</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {currentWeight ?? 'N/A'} {unitLabel}
                    </span>
                  </div>

                  <form onSubmit={handleWeightUpdate} className="space-y-3">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
                      placeholder={`New weight (${unitLabel})`}
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      disabled={isUpdating}
                    />
                    <button
                      type="submit"
                      disabled={isUpdating || !newWeight}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isUpdating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          Updating...
                        </>
                      ) : isSuccess ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Updated
                        </>
                      ) : 'Update Weight'}
                    </button>
                  </form>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Track your weight over the last 3 months. Updates reflect in real time on the chart.
                </p>
              </div>
            )}

            {/* Right — chart */}
            <div className={`${onUpdateWeight ? 'lg:col-span-2' : 'lg:col-span-3'} h-72`}>
              <StatsChart labels={labels} weightData={weightData} units={units} />
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}