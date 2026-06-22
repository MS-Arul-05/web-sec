import { z } from 'zod';

export const createScanSchema = z.object({
  url: z.string().min(3, 'URL is required').max(2048),
});

export type CreateScanInput = z.infer<typeof createScanSchema>;
