import axios from 'axios';
import type { HttpInfo, SecurityHeadersInfo, SecurityHeader } from './types';

const RECOMMENDED_HEADERS = [
  'strict-transport-security',
  'content-security-policy',
  'x-frame-options',
  'x-content-type-options',
  'referrer-policy',
  'permissions-policy',
];

function detectTech(headers: Record<string, string>, body: string): { cms?: string; technologies: string[] } {
  const tech = new Set<string>();
  let cms: string | undefined;

  const server = headers['server']?.toLowerCase() ?? '';
  const poweredBy = headers['x-powered-by']?.toLowerCase() ?? '';
  const generator = /<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)["']/i.exec(body)?.[1];

  if (server.includes('nginx')) tech.add('Nginx');
  if (server.includes('apache')) tech.add('Apache');
  if (server.includes('cloudflare')) tech.add('Cloudflare');
  if (server.includes('iis')) tech.add('IIS');
  if (poweredBy.includes('php')) tech.add('PHP');
  if (poweredBy.includes('express')) tech.add('Express');
  if (poweredBy.includes('asp.net')) tech.add('ASP.NET');

  if (/wp-content|wp-includes/i.test(body) || /wordpress/i.test(generator ?? '')) cms = 'WordPress';
  else if (/drupal/i.test(body)) cms = 'Drupal';
  else if (/joomla/i.test(body)) cms = 'Joomla';
  else if (/shopify/i.test(body) || headers['x-shopify-stage']) cms = 'Shopify';
  else if (/_next\/static/i.test(body)) tech.add('Next.js');
  else if (/__nuxt/i.test(body)) tech.add('Nuxt');

  if (/react/i.test(body)) tech.add('React');
  if (generator) tech.add(generator.split(' ')[0]);
  if (cms) tech.add(cms);

  return { cms, technologies: [...tech] };
}

/** Fetches the site over HTTPS (falling back to HTTP) and analyzes headers + tech. */
export async function analyzeHttp(hostname: string, timeoutMs = 8000): Promise<HttpInfo> {
  const tryFetch = async (scheme: 'https' | 'http') => {
    return axios.get(`${scheme}://${hostname}`, {
      timeout: timeoutMs,
      maxRedirects: 5,
      validateStatus: () => true,
      responseType: 'text',
      headers: { 'User-Agent': 'SecureWeb-Scanner/1.0 (+https://secure-web.app)' },
      // Don't fail on bad certs — we report SSL separately.
      httpsAgent: new (require('node:https').Agent)({ rejectUnauthorized: false }),
    });
  };

  let httpsSupported = false;
  let response;
  try {
    response = await tryFetch('https');
    httpsSupported = true;
  } catch {
    try {
      response = await tryFetch('http');
    } catch {
      return {
        reachable: false,
        httpsSupported: false,
        technologies: [],
        headers: {},
      };
    }
  }

  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries(response.headers)) {
    headers[k.toLowerCase()] = Array.isArray(v) ? v.join(', ') : String(v);
  }

  const body = typeof response.data === 'string' ? response.data.slice(0, 200_000) : '';
  const { cms, technologies } = detectTech(headers, body);

  return {
    reachable: true,
    httpsSupported,
    statusCode: response.status,
    server: headers['server'],
    poweredBy: headers['x-powered-by'],
    cms,
    technologies,
    headers,
  };
}

/** Scores presence of recommended security headers. */
export function analyzeSecurityHeaders(headers: Record<string, string>): SecurityHeadersInfo {
  const result: SecurityHeader[] = RECOMMENDED_HEADERS.map((name) => ({
    name,
    present: Boolean(headers[name]),
    value: headers[name],
  }));
  const presentCount = result.filter((h) => h.present).length;
  const score = Math.round((presentCount / RECOMMENDED_HEADERS.length) * 100);
  return { score, headers: result };
}
