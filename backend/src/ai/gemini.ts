import axios from 'axios';
import { env } from '../config/env';
import type { ScanResult, ThreatFinding } from '../engine/types';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// Structured-output schema so Gemini returns clean JSON we can trust.
const THREAT_SCHEMA = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      type: { type: 'string' },
      severity: { type: 'string' }, // Critical | High | Medium | Low | Info
      description: { type: 'string' },
      recommendation: { type: 'string' },
    },
    required: ['name', 'type', 'severity', 'description'],
  },
} as const;

/** Condenses scan findings into a compact prompt for the model. */
function buildFindings(r: ScanResult): string {
  const headers = r.securityHeaders.headers;
  const present = headers.filter((h) => h.present).map((h) => h.name);
  const missing = headers.filter((h) => !h.present).map((h) => h.name);
  const ports = r.ports.map((p) => `${p.port}/${p.service}${p.risky ? ' (risky/exposed)' : ''}`);
  return [
    `Target: ${r.target}`,
    `IP: ${r.ipAddress ?? 'unknown'} | Hosting: ${r.hostingProvider ?? 'unknown'} | Country: ${r.country ?? 'unknown'}`,
    `HTTPS supported: ${r.http.httpsSupported} | HTTP status: ${r.http.statusCode ?? 'n/a'}`,
    `SSL valid: ${r.ssl.valid}${r.ssl.issuer ? ` (issuer: ${r.ssl.issuer})` : ''}${r.ssl.error ? ` | error: ${r.ssl.error}` : ''}`,
    `Security headers present (${present.length}/${headers.length}): ${present.join(', ') || 'none'}`,
    `Security headers MISSING: ${missing.join(', ') || 'none'}`,
    `Open ports: ${ports.join(', ') || 'none detected'}`,
    `Server: ${r.http.server ?? 'unknown'} | Technologies: ${r.http.technologies.join(', ') || 'unknown'} | CMS: ${r.http.cms ?? 'none'}`,
    `Domain age: ${r.whois.domainAgeDays ?? 'unknown'} days | Registrar: ${r.whois.registrar ?? 'unknown'}`,
    `Blacklisted: ${r.blacklist.checked ? (r.blacklist.listed ? `YES (${r.blacklist.sources.join(', ')})` : 'no') : 'not checked'}`,
    `Computed risk score: ${r.riskScore}/100 (${r.riskLevel})`,
  ].join('\n');
}

const PROMPT_HEADER =
  'You are a senior cybersecurity analyst. Based ONLY on the website scan findings below, ' +
  'identify the concrete security threats. For each threat give a precise name, a category/type ' +
  '(e.g. "Network Exposure", "Web Vulnerability", "TLS/SSL", "Reputation"), a severity ' +
  '(Critical | High | Medium | Low | Info), a short description, and a remediation recommendation. ' +
  'Do not invent findings that are not supported by the data. Return JSON only.\n\nFINDINGS:\n';

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
}

/**
 * Uses Google Gemini to identify named threats (name + type + severity) from a
 * completed scan. Never throws — returns [] if disabled, rate-limited, or on error,
 * so the scan always succeeds even when the AI layer is unavailable.
 */
export async function analyzeThreats(result: ScanResult): Promise<ThreatFinding[]> {
  if (!env.geminiApiKey) return [];

  try {
    const url = `${GEMINI_BASE}/${env.geminiModel}:generateContent?key=${env.geminiApiKey}`;
    const { data } = await axios.post<GeminiResponse>(
      url,
      {
        contents: [{ parts: [{ text: PROMPT_HEADER + buildFindings(result) }] }],
        generationConfig: {
          // Gemini 2.5 is a "thinking" model — disable thinking so tokens go to output.
          thinkingConfig: { thinkingBudget: 0 },
          maxOutputTokens: 2048,
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema: THREAT_SCHEMA,
        },
      },
      { timeout: 25000, headers: { 'Content-Type': 'application/json' } },
    );

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return [];

    const parsed: unknown = JSON.parse(text);
    if (!Array.isArray(parsed)) return [];

    return parsed.slice(0, 25).map((t): ThreatFinding => {
      const obj = t as Record<string, unknown>;
      return {
        name: String(obj.name ?? 'Unknown threat'),
        type: String(obj.type ?? 'Unknown'),
        severity: String(obj.severity ?? 'Info'),
        description: String(obj.description ?? ''),
        recommendation: obj.recommendation ? String(obj.recommendation) : undefined,
      };
    });
  } catch (err) {
    // Log once for diagnostics, but never fail the scan.
    console.warn('[gemini] threat analysis unavailable:', err instanceof Error ? err.message : err);
    return [];
  }
}
