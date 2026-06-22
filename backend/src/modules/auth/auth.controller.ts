import type { Request, Response } from 'express';
import * as authService from './auth.service';
import { AppError } from '../../utils/AppError';

/**
 * Syncs and returns the local profile for the authenticated Supabase user.
 * The frontend calls this after login so a local User row always exists.
 */
export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const profile = req.body?.profile as { fullName?: string; company?: string } | undefined;
  const user = await authService.ensureUser(req.user, profile);
  res.json({ user });
}
