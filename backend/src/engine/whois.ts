import { domain as whoisDomain } from 'whoiser';
import type { WhoisInfo } from './types';

function firstValue(obj: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (Array.isArray(v) && v.length && typeof v[0] === 'string') return String(v[0]).trim();
  }
  return undefined;
}

function daysSince(dateStr?: string): number | undefined {
  if (!dateStr) return undefined;
  const t = Date.parse(dateStr);
  if (Number.isNaN(t)) return undefined;
  return Math.floor((Date.now() - t) / (1000 * 60 * 60 * 24));
}

/** WHOIS lookup via whoiser. Never throws — returns { available:false } on failure. */
export async function lookupWhois(domain: string): Promise<WhoisInfo> {
  try {
    const raw = await whoisDomain(domain, { follow: 1, timeout: 6000 });
    // whoiser returns a map keyed by WHOIS server; pick the first record with data.
    const record = Object.values(raw).find(
      (r) => r && typeof r === 'object' && Object.keys(r).length > 0,
    ) as Record<string, unknown> | undefined;

    if (!record) return { available: false };

    const createdDate = firstValue(record, ['Created Date', 'Creation Date', 'created']);
    const expiresDate = firstValue(record, ['Expiry Date', 'Registry Expiry Date', 'expires']);
    const updatedDate = firstValue(record, ['Updated Date', 'updated']);

    return {
      registrar: firstValue(record, ['Registrar', 'registrar']),
      createdDate,
      expiresDate,
      updatedDate,
      domainAgeDays: daysSince(createdDate),
      country: firstValue(record, ['Registrant Country', 'Country', 'country']),
      organization: firstValue(record, ['Registrant Organization', 'Registrar Organization', 'org']),
      available: true,
    };
  } catch {
    return { available: false };
  }
}
