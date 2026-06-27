// Robustly remove the build output directory before building.
//
// vite's own `emptyDir` deletes files with a single `rmSync` and no retry, so on
// Windows any transient handle (Defender real-time scan, a dev-server file
// watcher, Explorer thumbnailing a .gif/.webp) makes `unlinkSync` throw EBUSY
// and aborts the whole build. Node's `rmSync` supports retry options that vite
// doesn't use, so we do the cleanup ourselves with backoff. By the time vite
// runs its own emptyDir, the directory is already gone -> nothing left to lock.
import { rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(here, '..', 'dist');

try {
  rmSync(dist, { recursive: true, force: true, maxRetries: 50, retryDelay: 100 });
  console.log(`[clean] removed ${dist}`);
} catch (err) {
  console.error(`[clean] failed to remove ${dist} after retries: ${err.message}`);
  console.error('[clean] close anything holding a file in dist/ (browser tab, file explorer) and retry.');
  process.exit(1);
}
