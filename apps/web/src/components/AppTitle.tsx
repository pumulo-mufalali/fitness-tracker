import React from 'react';

export default function AppTitle({ className = '' }: { className?: string }) {
  return (
    <span
      className={`text-gray-900 dark:text-white tracking-widest ${className}`}
      style={{ fontFamily: "'Syne Mono', monospace" }}
    >
      FITNESS TRACKER
    </span>
  );
}
