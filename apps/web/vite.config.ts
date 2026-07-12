import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const browserLogsEnabled =
    env.VITE_ENABLE_BROWSER_LOGS !== undefined
      ? env.VITE_ENABLE_BROWSER_LOGS === 'true'
      : mode !== 'production';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Toggle browser console calls with one env var:
    // `VITE_ENABLE_BROWSER_LOGS=true` keeps them, otherwise production strips them.
    esbuild: browserLogsEnabled ? undefined : { drop: ['console', 'debugger'] },
    server: {
      watch: {
        // Don't let the dev watcher hold handles on the build output.
        // On Windows this causes EBUSY when `vite build` tries to empty dist/.
        ignored: ['**/dist/**'],
      },
    },
  };
});
