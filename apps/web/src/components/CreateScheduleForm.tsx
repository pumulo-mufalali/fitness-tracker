import React, { useState } from 'react';
import { useToast } from '../providers/toast-provider';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface ScheduleItem {
  time: string;
  activity: string;
}

export default function CreateScheduleForm({ onClose, onSave }: { onClose: () => void; onSave: (schedule: Record<string, ScheduleItem[]>) => void }) {
  const { showError } = useToast();
  const [schedule, setSchedule] = useState<Record<string, ScheduleItem[]>>({
    monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
  });

  const handleAddItem = (day: string) => {
    const dayKey = day.toLowerCase();
    setSchedule(prev => ({ ...prev, [dayKey]: [...(prev[dayKey] || []), { time: '', activity: '' }] }));
  };

  const handleItemChange = (day: string, index: number, field: 'time' | 'activity', value: string) => {
    const dayKey = day.toLowerCase();
    const items = schedule[dayKey] || [];
    setSchedule(prev => ({
      ...prev,
      [dayKey]: items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  };

  const handleRemoveItem = (day: string, index: number) => {
    const dayKey = day.toLowerCase();
    setSchedule(prev => ({
      ...prev,
      [dayKey]: (prev[dayKey] || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all schedule items
    const errors: string[] = [];
    Object.entries(schedule).forEach(([day, items]) => {
      items.forEach((item, index) => {
        if (!item.time || item.time.trim().length === 0) {
          errors.push(`${day.charAt(0).toUpperCase() + day.slice(1)}, Item ${index + 1}: Time is required`);
        }
        if (!item.activity || item.activity.trim().length === 0) {
          errors.push(`${day.charAt(0).toUpperCase() + day.slice(1)}, Item ${index + 1}: Activity is required`);
        }
        if (item.activity && item.activity.trim().length > 200) {
          errors.push(`${day.charAt(0).toUpperCase() + day.slice(1)}, Item ${index + 1}: Activity name must be less than 200 characters`);
        }
      });
    });

    if (errors.length > 0) {
      const errorMessage = errors.slice(0, 3).join(', ') + (errors.length > 3 ? ` and ${errors.length - 3} more errors` : '');
      showError(`Please fix the following errors: ${errorMessage}`);
      return;
    }

    // Filter out invalid items before saving
    const validSchedule: Record<string, ScheduleItem[]> = {};
    Object.entries(schedule).forEach(([day, items]) => {
      validSchedule[day] = items.filter(
        item => item.time.trim().length > 0 && item.activity.trim().length > 0
      );
    });

    onSave(validSchedule);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <div className="bg-card  p-6 shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Create Weekly Schedule</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {days.map(day => (
              <div key={day} className="bg-gray-50 dark:bg-gray-900/50 p-4 ">
                <h3 className="font-bold text-lg mb-2">{day}</h3>
                {(schedule[day.toLowerCase()] || []).map((item, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder="Time"
                      value={item.time}
                      onChange={e => handleItemChange(day, index, 'time', e.target.value)}
                      className="w-1/3 p-2 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                    />
                    <input
                      type="text"
                      placeholder="Activity"
                      value={item.activity}
                      onChange={e => handleItemChange(day, index, 'activity', e.target.value)}
                      className="w-2/3 p-2 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                    />
                    <button type="button" onClick={() => handleRemoveItem(day, index)} className="text-red-500">âœ•</button>
                  </div>
                ))}
                <button type="button" onClick={() => handleAddItem(day)} className="w-full text-sm py-1 px-2 rounded bg-blue-500/20 hover:bg-blue-500/30 transition-colors">
                  + Add Item
                </button>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2  bg-gray-200 dark:bg-gray-700">Cancel</button>
            <button type="submit" className="px-4 py-2  bg-blue-600 text-white">Save Schedule</button>
          </div>
        </form>
      </div>
    </div>
  );
}
