import { Router } from 'express';
import * as controller from './auth.controller';
import { registerSchema, loginSchema } from './auth.schema';
import { validateBody } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { authLimiter } from '../../middleware/rateLimit';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.post('/register', authLimiter, validateBody(registerSchema), asyncHandler(controller.register));
router.post('/login', authLimiter, validateBody(loginSchema), asyncHandler(controller.login));
router.get('/me', authenticate, asyncHandler(controller.me));

export default router;
