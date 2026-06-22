import type { Request, Response } from 'express';
import * as authService from './auth.service';
import { AppError } from '../../utils/AppError';

export async function register(req: Request, res: Response): Promise<void> {
  const result = await authService.register(req.body);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response): Promise<void> {
  const result = await authService.login(req.body);
  res.json(result);
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const user = await authService.getMe(req.user.sub);
  res.json({ user });
}
