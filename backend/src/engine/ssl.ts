import tls from 'node:tls';
import type { SslInfo } from './types';

/** Connects over TLS and inspects the peer certificate. Never throws. */
export function checkSsl(hostname: string, timeoutMs = 7000): Promise<SslInfo> {
  return new Promise((resolve) => {
    let settled = false;
    const done = (result: SslInfo) => {
      if (settled) return;
      settled = true;
      try {
        socket.destroy();
      } catch {
        /* ignore */
      }
      resolve(result);
    };

    const socket = tls.connect(
      { host: hostname, port: 443, servername: hostname, rejectUnauthorized: false, timeout: timeoutMs },
      () => {
        const cert = socket.getPeerCertificate();
        if (!cert || Object.keys(cert).length === 0) {
          return done({ valid: false, error: 'No certificate presented' });
        }
        const validTo = cert.valid_to ? new Date(cert.valid_to) : undefined;
        const daysUntilExpiry = validTo
          ? Math.floor((validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : undefined;

        const str = (v: string | string[] | undefined): string | undefined =>
          Array.isArray(v) ? v[0] : v;

        done({
          valid: socket.authorized || daysUntilExpiry !== undefined,
          issuer: str(cert.issuer?.O) ?? str(cert.issuer?.CN),
          subject: str(cert.subject?.CN),
          validFrom: cert.valid_from,
          validTo: cert.valid_to,
          daysUntilExpiry,
          protocol: socket.getProtocol() ?? undefined,
        });
      },
    );

    socket.on('error', (err) => done({ valid: false, error: err.message }));
    socket.on('timeout', () => done({ valid: false, error: 'TLS connection timed out' }));
  });
}
