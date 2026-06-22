import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../src/app';

// Vercel turns this file into a serverless function. We reuse the same Express
// app used for local dev (src/app.ts) — no app.listen() in serverless.
const app = createApp();

// The backend service is mounted under this prefix (see root vercel.json
// experimentalServices.backend.routePrefix). Strip it so the Express routes
// (/api/*) match regardless of whether the platform pre-strips it.
const PREFIX = '/_/backend';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.url && req.url.startsWith(PREFIX)) {
    req.url = req.url.slice(PREFIX.length) || '/';
  }
  // An Express app is itself a (req, res) request listener.
  return (app as unknown as (req: VercelRequest, res: VercelResponse) => void)(req, res);
}
