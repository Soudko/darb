import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { aiStatus } from './ai';
import { assistantRouter } from './assistant';
import { communityRouter, listCommunityPlaces } from './community';
import { errorBody, HttpError } from './errors';
import { getPlaces } from './places';
import { listenHost } from './host';

const here = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();
  if (listenHost() !== 'localhost') app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use('/api/community', communityRouter()); // reads its own, larger JSON body (photos)
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (_req, res) => {
    const s = aiStatus();
    res.json(s.status === 'ready' ? { ok: true, ai: 'ready', model: s.model } : { ok: true, ai: 'not_set_up' });
  });
  app.get('/api/places', async (_req, res) => res.json({ places: [...getPlaces(), ...(await listCommunityPlaces())] }));
  app.use('/api/assistant', assistantRouter());
  app.use('/api', (_req, res) => res.status(404).json(errorBody('not_found', 'Not found.')));

  // In production the built screens are served from dist/, with a fallback to index.html.
  if (process.env.NODE_ENV === 'production') {
    const dist = path.resolve(here, '../dist');
    app.use(express.static(dist));
    app.get('*', (_req, res, next) => {
      const index = path.join(dist, 'index.html');
      fs.existsSync(index) ? res.sendFile(index) : next();
    });
  }

  app.use((_req, res) => res.status(404).json(errorBody('not_found', 'Not found.')));

  // Every error leaves in the same shape, with no stack trace, path or key.
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) return void res.status(err.status).json(errorBody(err.code, err.message));
    if (err?.type === 'entity.too.large') return void res.status(400).json(errorBody('too_long', 'The request is too large.'));
    if (err?.type === 'entity.parse.failed' || err?.status === 400) return void res.status(400).json(errorBody('bad_request', 'The request is not valid.'));
    res.status(500).json(errorBody('server_error', 'Something went wrong.'));
  });

  return app;
}
