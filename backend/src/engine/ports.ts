import net from 'node:net';
import type { PortInfo } from './types';

interface PortDef {
  port: number;
  service: string;
  risky: boolean;
}

// Common ports to probe. "risky" flags services that shouldn't be publicly exposed.
const COMMON_PORTS: PortDef[] = [
  { port: 21, service: 'FTP', risky: true },
  { port: 22, service: 'SSH', risky: false },
  { port: 23, service: 'Telnet', risky: true },
  { port: 25, service: 'SMTP', risky: false },
  { port: 53, service: 'DNS', risky: false },
  { port: 80, service: 'HTTP', risky: false },
  { port: 110, service: 'POP3', risky: true },
  { port: 143, service: 'IMAP', risky: false },
  { port: 443, service: 'HTTPS', risky: false },
  { port: 445, service: 'SMB', risky: true },
  { port: 3306, service: 'MySQL', risky: true },
  { port: 3389, service: 'RDP', risky: true },
  { port: 5432, service: 'PostgreSQL', risky: true },
  { port: 6379, service: 'Redis', risky: true },
  { port: 8080, service: 'HTTP-Proxy', risky: false },
  { port: 27017, service: 'MongoDB', risky: true },
];

function probePort(host: string, port: number, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let open = false;
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => {
      open = true;
      socket.destroy();
    });
    socket.once('timeout', () => socket.destroy());
    socket.once('error', () => socket.destroy());
    socket.once('close', () => resolve(open));
    socket.connect(port, host);
  });
}

/** Probes a curated list of common ports against an IP/host. */
export async function scanPorts(host: string, timeoutMs = 1500): Promise<PortInfo[]> {
  const results = await Promise.all(
    COMMON_PORTS.map(async (def) => {
      const open = await probePort(host, def.port, timeoutMs);
      return {
        port: def.port,
        service: def.service,
        state: open ? ('open' as const) : ('closed' as const),
        risky: def.risky,
      };
    }),
  );
  // Only return open ports (closed ports are noise).
  return results.filter((r) => r.state === 'open');
}
