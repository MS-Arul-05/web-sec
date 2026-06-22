import { URL } from 'node:url';
import { lookupDns, reverseLookup } from './dns';
import { lookupWhois } from './whois';
import { checkSsl } from './ssl';
import { scanPorts } from './ports';
import { analyzeHttp, analyzeSecurityHeaders } from './http';
import { checkBlacklist } from './blacklist';
import { computeRisk, buildSummary } from './risk';
import { AppError } from '../utils/AppError';
import type { ScanResult } from './types';

/** Normalizes user input into a { url, hostname } pair, validating it. */
function normalizeTarget(input: string): { url: string; hostname: string } {
  let raw = input.trim();
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw AppError.badRequest('Invalid URL. Use a format like https://example.com');
  }
  if (!parsed.hostname || !parsed.hostname.includes('.')) {
    throw AppError.badRequest('Invalid hostname in URL');
  }
  // Block obvious SSRF targets (localhost / private ranges).
  const host = parsed.hostname.toLowerCase();
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.endsWith('.local') ||
    /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)
  ) {
    throw AppError.badRequest('Scanning private / local addresses is not allowed');
  }
  return { url: parsed.toString(), hostname: parsed.hostname };
}

/** Runs the full website security scan pipeline. */
export async function runWebsiteScan(input: string): Promise<ScanResult> {
  const started = Date.now();
  const { url, hostname } = normalizeTarget(input);

  // Run independent analyzers concurrently.
  const [dns, whois, ssl, httpRaw, blacklist] = await Promise.all([
    lookupDns(hostname),
    lookupWhois(hostname),
    checkSsl(hostname),
    analyzeHttp(hostname),
    checkBlacklist(url),
  ]);

  const primaryIp = dns.ipv4[0] ?? dns.ipv6[0] ?? null;
  // Ports + reverse DNS need an IP; run after DNS resolves.
  const [ports, hostingProvider] = await Promise.all([
    primaryIp ? scanPorts(primaryIp) : Promise.resolve([]),
    primaryIp ? reverseLookup(primaryIp) : Promise.resolve(null),
  ]);

  const securityHeaders = analyzeSecurityHeaders(httpRaw.headers);

  const { score, level, breakdown } = computeRisk({
    ssl,
    securityHeaders,
    http: httpRaw,
    ports,
    blacklist,
    whois,
  });

  const result: ScanResult = {
    target: hostname,
    url,
    scanDate: new Date().toISOString(),
    durationMs: Date.now() - started,
    ipAddress: primaryIp,
    hostingProvider: hostingProvider ?? whois.organization ?? null,
    country: whois.country ?? null,
    riskScore: score,
    riskLevel: level,
    riskBreakdown: breakdown,
    dns,
    whois,
    ssl,
    http: httpRaw,
    securityHeaders,
    ports,
    blacklist,
    summary: '',
  };
  result.summary = buildSummary(result);
  return result;
}
