import dns from 'node:dns/promises';
import type { DnsInfo } from './types';

/** Resolves A/AAAA/NS/MX records for a hostname. Never throws — returns partial data. */
export async function lookupDns(hostname: string): Promise<DnsInfo> {
  const info: DnsInfo = {
    hostname,
    ipv4: [],
    ipv6: [],
    nameServers: [],
    mxRecords: [],
    resolved: false,
  };

  const [a, aaaa, ns, mx] = await Promise.allSettled([
    dns.resolve4(hostname),
    dns.resolve6(hostname),
    dns.resolveNs(hostname),
    dns.resolveMx(hostname),
  ]);

  if (a.status === 'fulfilled') info.ipv4 = a.value;
  if (aaaa.status === 'fulfilled') info.ipv6 = aaaa.value;
  if (ns.status === 'fulfilled') info.nameServers = ns.value;
  if (mx.status === 'fulfilled') info.mxRecords = mx.value.map((r) => r.exchange);

  info.resolved = info.ipv4.length > 0 || info.ipv6.length > 0;
  return info;
}

/** Best-effort reverse DNS / hosting hint for an IP. */
export async function reverseLookup(ip: string): Promise<string | null> {
  try {
    const names = await dns.reverse(ip);
    return names[0] ?? null;
  } catch {
    return null;
  }
}
