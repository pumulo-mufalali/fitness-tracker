import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    watch: {
      // Don't let the dev watcher hold handles on the build output.
      // On Windows this causes EBUSY when `vite build` tries to empty dist/.
      ignored: ['**/dist/**'],
    },
  },
});
