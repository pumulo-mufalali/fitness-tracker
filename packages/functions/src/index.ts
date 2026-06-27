import { onRequest } from 'firebase-functions/v2/https';
import { appRouter } from './routers';
import { createContext } from './context';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const trpcMiddleware = createExpressMiddleware({
  router: appRouter,
  createContext: ({ req, res }) => createContext(req as any, res),
  onError: ({ error, path }) => {
    console.error(`tRPC Error on path "${path}":`, error);
  },
});

export const trpc = onRequest(
  { cors: true, region: 'us-central1' },
  (req, res) => {
    trpcMiddleware(req as any, res as any, (err) => {
      if (err) {
        console.error('Error in tRPC handler:', err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
  }
);

