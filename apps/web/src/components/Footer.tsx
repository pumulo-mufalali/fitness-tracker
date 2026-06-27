import React from 'react';
import { APP_NAME } from '../lib/constants';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{APP_NAME}</span>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-400 dark:text-gray-500">
          <span>© {year} {APP_NAME}. All rights reserved.</span>
          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Privacy</a>
          <a href="/terms" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
}
