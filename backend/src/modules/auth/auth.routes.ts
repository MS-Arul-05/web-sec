import { Router } from 'express';
import * as controller from './auth.controller';
import { authenticate } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

// Registration & login happen client-side via Supabase Auth.
// This endpoint syncs/returns the local profile for the authenticated user.
router.get('/me', authenticate, asyncHandler(controller.me));
router.post('/me', authenticate, asyncHandler(controller.me));

export default router;
