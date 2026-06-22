export type RiskLevel = 'Safe' | 'Moderate' | 'High Risk' | 'Unknown';

export interface User {
  id: string;
  email: string;
  fullName: string;
  company: string | null;
  role: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface RiskBreakdownItem {
  label: string;
  points: number;
  note: string;
}

export interface PortInfo {
  port: number;
  service: string;
  state: 'open' | 'closed';
  risky: boolean;
}

export interface SecurityHeader {
  name: string;
  present: boolean;
  value?: string;
}

export interface ScanResult {
  target: string;
  url: string;
  scanDate: string;
  durationMs: number;
  ipAddress: string | null;
  hostingProvider: string | null;
  country: string | null;
  riskScore: number;
  riskLevel: RiskLevel;
  riskBreakdown: RiskBreakdownItem[];
  dns: {
    hostname: string;
    ipv4: string[];
    ipv6: string[];
    nameServers: string[];
    mxRecords: string[];
    resolved: boolean;
  };
  whois: {
    registrar?: string;
    createdDate?: string;
    expiresDate?: string;
    domainAgeDays?: number;
    country?: string;
    organization?: string;
    available: boolean;
  };
  ssl: {
    valid: boolean;
    issuer?: string;
    subject?: string;
    validFrom?: string;
    validTo?: string;
    daysUntilExpiry?: number;
    protocol?: string;
    error?: string;
  };
  http: {
    reachable: boolean;
    httpsSupported: boolean;
    statusCode?: number;
    server?: string;
    poweredBy?: string;
    cms?: string;
    technologies: string[];
    headers: Record<string, string>;
  };
  securityHeaders: {
    score: number;
    headers: SecurityHeader[];
  };
  ports: PortInfo[];
  blacklist: {
    checked: boolean;
    listed: boolean;
    sources: string[];
  };
  summary: string;
}

export interface ScanRecord {
  id: string;
  target: string;
  ipAddress: string | null;
  riskScore: number;
  riskLevel: RiskLevel;
  status: string;
  durationMs: number;
  createdAt: string;
  result: ScanResult;
}

export interface ScanSummary {
  id: string;
  target: string;
  ipAddress: string | null;
  riskScore: number;
  riskLevel: RiskLevel;
  durationMs: number;
  createdAt: string;
}

export interface PlatformStats {
  websitesScanned: number;
  threatsDetected: number;
  imagesAnalyzed: number;
  videosAnalyzed: number;
  users: number;
}
