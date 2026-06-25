import React, { useState } from 'react';
import { useToast } from '../providers/toast-provider';

interface ScheduleItem {
  time: string;
  activity: string;
}

interface EditDayScheduleFormProps {
  day: string;
  initialItems: ScheduleItem[];
  onClose: () => void;
  onSave: (items: ScheduleItem[]) => void;
}

export default function EditDayScheduleForm({ day, initialItems, onClose, onSave }: EditDayScheduleFormProps) {
  const { showError } = useToast();
  const [items, setItems] = useState<ScheduleItem[]>(initialItems);

  const handleAddItem = () => {
    setItems([...items, { time: '', activity: '' }]);
  };

  const handleItemChange = (index: number, field: 'time' | 'activity', value: string) => {
    const newItems = [...items];
    const item = newItems[index];
    if (item) {
      item[field] = value;
      setItems(newItems);
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all items before saving
    const errors: string[] = [];
    items.forEach((item, index) => {
      if (!item.time || item.time.trim().length === 0) {
        errors.push(`Item ${index + 1}: Time is required`);
      }
      if (!item.activity || item.activity.trim().length === 0) {
        errors.push(`Item ${index + 1}: Activity is required`);
      }
      if (item.activity && item.activity.trim().length > 200) {
        errors.push(`Item ${index + 1}: Activity name must be less than 200 characters`);
      }
    });

    if (errors.length > 0) {
      const errorMessage = errors.slice(0, 3).join(', ') + (errors.length > 3 ? ` and ${errors.length - 3} more errors` : '');
      showError(`Please fix the following errors: ${errorMessage}`);
      return;
    }

    // Filter out any items with empty time or activity as a safety measure
    const validItems = items.filter(
      item => item.time.trim().length > 0 && item.activity.trim().length > 0
    );

    onSave(validItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <div className="bg-card  p-6 shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Edit Schedule for {day}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Time"
                  value={item.time}
                  onChange={e => handleItemChange(index, 'time', e.target.value)}
                  className="w-1/3 p-2 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                />
                <input
                  type="text"
                  placeholder="Activity"
                  value={item.activity}
                  onChange={e => handleItemChange(index, 'activity', e.target.value)}
                  className="w-2/3 p-2 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
                />
                <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500">âœ•</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={handleAddItem} className="w-full text-sm py-2 px-2 mt-4 rounded bg-blue-500/20 hover:bg-blue-500/30 transition-colors">
            + Add Item
          </button>
          <div className="mt-6 flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2  bg-gray-200 dark:bg-gray-700">Cancel</button>
            <button type="submit" className="px-4 py-2  bg-blue-600 text-white">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
