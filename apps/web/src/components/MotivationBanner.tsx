import React from 'react';

export default function MotivationBanner({ quote = 'Push yourself because no one else is going to do it for you.' }: { quote?: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800  p-4 shadow-sm">
      <div className="text-sm text-muted-foreground">Motivation of the day</div>
      <div className="mt-2 text-lg font-semibold text-black dark:text-white">{quote}</div>
    </div>
  );
}
