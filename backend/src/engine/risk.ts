import type { ScanResult, RiskBreakdownItem, RiskLevel } from './types';

type RiskInputs = Pick<ScanResult, 'ssl' | 'securityHeaders' | 'http' | 'ports' | 'blacklist' | 'whois'>;

/**
 * Risk scoring algorithm (0-100, higher = safer).
 * Starts from a neutral baseline and adds/subtracts per the spec'd components.
 */
export function computeRisk(inputs: RiskInputs): { score: number; level: RiskLevel; breakdown: RiskBreakdownItem[] } {
  const breakdown: RiskBreakdownItem[] = [];
  let score = 50; // neutral baseline

  // SSL valid certificate: +20
  if (inputs.ssl.valid) {
    score += 20;
    breakdown.push({ label: 'Valid SSL Certificate', points: +20, note: inputs.ssl.issuer ? `Issued by ${inputs.ssl.issuer}` : 'Certificate present' });
  } else {
    score -= 10;
    breakdown.push({ label: 'Invalid / Missing SSL', points: -10, note: inputs.ssl.error ?? 'No valid certificate' });
  }

  // HTTPS supported: +10
  if (inputs.http.httpsSupported) {
    score += 10;
    breakdown.push({ label: 'HTTPS Supported', points: +10, note: 'Site reachable over HTTPS' });
  } else {
    score -= 10;
    breakdown.push({ label: 'No HTTPS', points: -10, note: 'Site not reachable over HTTPS' });
  }

  // Security headers: scaled up to +20
  const headerPoints = Math.round((inputs.securityHeaders.score / 100) * 20);
  score += headerPoints;
  breakdown.push({
    label: 'Security Headers',
    points: +headerPoints,
    note: `${inputs.securityHeaders.headers.filter((h) => h.present).length}/${inputs.securityHeaders.headers.length} recommended headers present`,
  });

  // Open risky ports: -20 (if any risky port is open)
  const riskyOpen = inputs.ports.filter((p) => p.risky);
  if (riskyOpen.length > 0) {
    score -= 20;
    breakdown.push({
      label: 'Exposed Risky Ports',
      points: -20,
      note: riskyOpen.map((p) => `${p.port}/${p.service}`).join(', '),
    });
  }

  // Domain reputation / age: +20 for established domains (> 1 year)
  if (inputs.whois.domainAgeDays !== undefined) {
    if (inputs.whois.domainAgeDays > 365) {
      score += 20;
      breakdown.push({ label: 'Established Domain', points: +20, note: `~${Math.floor(inputs.whois.domainAgeDays / 365)} year(s) old` });
    } else {
      score -= 10;
      breakdown.push({ label: 'Newly Registered Domain', points: -10, note: `${inputs.whois.domainAgeDays} days old` });
    }
  }

  // Blacklist presence: -30
  if (inputs.blacklist.checked && inputs.blacklist.listed) {
    score -= 30;
    breakdown.push({ label: 'Blacklisted', points: -30, note: inputs.blacklist.sources.join(', ') });
  }

  // Clamp to 0-100.
  score = Math.max(0, Math.min(100, score));

  let level: RiskLevel;
  if (score >= 80) level = 'Safe';
  else if (score >= 50) level = 'Moderate';
  else level = 'High Risk';

  return { score, level, breakdown };
}

export function buildSummary(result: Pick<ScanResult, 'target' | 'riskScore' | 'riskLevel'>): string {
  switch (result.riskLevel) {
    case 'Safe':
      return `${result.target} scored ${result.riskScore}/100 — well configured with strong security posture. No critical issues detected.`;
    case 'Moderate':
      return `${result.target} scored ${result.riskScore}/100 — generally acceptable but with security gaps that should be addressed.`;
    case 'High Risk':
      return `${result.target} scored ${result.riskScore}/100 — significant security weaknesses detected. Immediate remediation recommended.`;
    default:
      return `${result.target} could not be fully assessed.`;
  }
}
