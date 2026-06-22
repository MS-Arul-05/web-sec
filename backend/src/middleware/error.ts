import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

export function notFound(_req: Request, _res: Response, next: NextFunction): void {
  next(AppError.notFound('Route not found'));
}

// Express error handler — must keep 4 args.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  // Prisma unique-constraint violation -> 409
  if (typeof err === 'object' && err !== null && 'code' in err && (err as { code?: string }).code === 'P2002') {
    res.status(409).json({ error: 'Resource already exists' });
    return;
  }

  console.error('[unhandled error]', err);
  res.status(500).json({
    error: 'Internal server error',
    ...(env.isProd ? {} : { detail: err instanceof Error ? err.message : String(err) }),
  });
}
