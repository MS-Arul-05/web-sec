import { prisma } from '../../db/prisma';
import { runWebsiteScan } from '../../engine/scanner';
import { AppError } from '../../utils/AppError';
import type { ScanResult } from '../../engine/types';

export interface ScanRecord {
  id: string;
  target: string;
  ipAddress: string | null;
  riskScore: number;
  riskLevel: string;
  status: string;
  durationMs: number;
  createdAt: Date;
  result: ScanResult;
}

function parseRecord(row: {
  id: string;
  target: string;
  ipAddress: string | null;
  riskScore: number;
  riskLevel: string;
  status: string;
  durationMs: number;
  createdAt: Date;
  resultJson: string;
}): ScanRecord {
  return {
    id: row.id,
    target: row.target,
    ipAddress: row.ipAddress,
    riskScore: row.riskScore,
    riskLevel: row.riskLevel,
    status: row.status,
    durationMs: row.durationMs,
    createdAt: row.createdAt,
    result: JSON.parse(row.resultJson) as ScanResult,
  };
}

export async function createScan(userId: string, url: string): Promise<ScanRecord> {
  const result = await runWebsiteScan(url);
  const row = await prisma.scan.create({
    data: {
      userId,
      target: result.target,
      ipAddress: result.ipAddress,
      riskScore: result.riskScore,
      riskLevel: result.riskLevel,
      status: 'completed',
      durationMs: result.durationMs,
      resultJson: JSON.stringify(result),
    },
  });
  await prisma.auditLog.create({
    data: { userId, action: 'scan.create', meta: JSON.stringify({ target: result.target, score: result.riskScore }) },
  });
  return parseRecord(row);
}

export async function listScans(userId: string, limit = 50): Promise<ScanRecord[]> {
  const rows = await prisma.scan.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return rows.map(parseRecord);
}

export async function getScan(userId: string, id: string): Promise<ScanRecord> {
  const row = await prisma.scan.findUnique({ where: { id } });
  if (!row || row.userId !== userId) throw AppError.notFound('Scan not found');
  return parseRecord(row);
}

export async function deleteScan(userId: string, id: string): Promise<void> {
  const row = await prisma.scan.findUnique({ where: { id } });
  if (!row || row.userId !== userId) throw AppError.notFound('Scan not found');
  await prisma.scan.delete({ where: { id } });
}
