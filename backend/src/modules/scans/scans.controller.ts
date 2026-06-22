import type { Request, Response } from 'express';
import * as scansService from './scans.service';
import { generateScanPdf } from '../../reports/pdf';
import { AppError } from '../../utils/AppError';

function userId(req: Request): string {
  if (!req.user) throw AppError.unauthorized();
  return req.user.sub;
}

export async function create(req: Request, res: Response): Promise<void> {
  if (!req.user) throw AppError.unauthorized();
  const scan = await scansService.createScan(req.user, req.body.url);
  res.status(201).json({ scan });
}

export async function list(req: Request, res: Response): Promise<void> {
  const scans = await scansService.listScans(userId(req));
  // Return lightweight summaries for the history list.
  res.json({
    scans: scans.map((s) => ({
      id: s.id,
      target: s.target,
      ipAddress: s.ipAddress,
      riskScore: s.riskScore,
      riskLevel: s.riskLevel,
      durationMs: s.durationMs,
      createdAt: s.createdAt,
    })),
  });
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const scan = await scansService.getScan(userId(req), req.params.id);
  res.json({ scan });
}

export async function remove(req: Request, res: Response): Promise<void> {
  await scansService.deleteScan(userId(req), req.params.id);
  res.status(204).send();
}

export async function exportJson(req: Request, res: Response): Promise<void> {
  const scan = await scansService.getScan(userId(req), req.params.id);
  const safe = scan.target.replace(/[^a-z0-9.-]/gi, '_');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="secure-web-${safe}.json"`);
  res.send(JSON.stringify(scan.result, null, 2));
}

export async function exportPdf(req: Request, res: Response): Promise<void> {
  const scan = await scansService.getScan(userId(req), req.params.id);
  const safe = scan.target.replace(/[^a-z0-9.-]/gi, '_');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="secure-web-${safe}.pdf"`);
  const doc = generateScanPdf(scan.result);
  doc.pipe(res);
  doc.end();
}
