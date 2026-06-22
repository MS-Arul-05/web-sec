import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { globalLimiter } from './middleware/rateLimit';
import { notFound, errorHandler } from './middleware/error';
import { asyncHandler } from './utils/asyncHandler';
import { prisma } from './db/prisma';
import authRoutes from './modules/auth/auth.routes';
import scanRoutes from './modules/scans/scans.routes';

export function createApp(): Application {
  const app = express();

  // Security & infra middleware
  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  if (!env.isProd) app.use(morgan('dev'));
  app.use('/api', globalLimiter);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'secure-web-api', time: new Date().toISOString() });
  });

  // Public platform stats (for landing-page counters)
  app.get(
    '/api/stats',
    asyncHandler(async (_req, res) => {
      const [websitesScanned, threatsDetected, users] = await Promise.all([
        prisma.scan.count(),
        prisma.scan.count({ where: { riskLevel: 'High Risk' } }),
        prisma.user.count(),
      ]);
      res.json({
        websitesScanned,
        threatsDetected,
        imagesAnalyzed: 0, // populated once the AI image service is online
        videosAnalyzed: 0, // populated once the AI video service is online
        users,
      });
    }),
  );

  // Feature routes
  app.use('/api/auth', authRoutes);
  app.use('/api/scans', scanRoutes);

  // 404 + error handling (must be last)
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
