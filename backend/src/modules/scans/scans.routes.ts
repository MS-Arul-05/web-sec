import { Router } from 'express';
import * as controller from './scans.controller';
import { createScanSchema } from './scans.schema';
import { validateBody } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { scanLimiter } from '../../middleware/rateLimit';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate); // all scan routes require auth

router.post('/', scanLimiter, validateBody(createScanSchema), asyncHandler(controller.create));
router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getOne));
router.delete('/:id', asyncHandler(controller.remove));
router.get('/:id/export/json', asyncHandler(controller.exportJson));
router.get('/:id/export/pdf', asyncHandler(controller.exportPdf));

export default router;
