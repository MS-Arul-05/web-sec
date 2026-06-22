export type RiskLevel = 'Safe' | 'Moderate' | 'High Risk' | 'Unknown';

export interface DnsInfo {
  hostname: string;
  ipv4: string[];
  ipv6: string[];
  nameServers: string[];
  mxRecords: string[];
  resolved: boolean;
}

export interface WhoisInfo {
  registrar?: string;
  createdDate?: string;
  expiresDate?: string;
  updatedDate?: string;
  domainAgeDays?: number;
  country?: string;
  organization?: string;
  available: boolean;
}

export interface SslInfo {
  valid: boolean;
  issuer?: string;
  subject?: string;
  validFrom?: string;
  validTo?: string;
  daysUntilExpiry?: number;
  protocol?: string;
  error?: string;
}

export interface PortInfo {
  port: number;
  service: string;
  state: 'open' | 'closed';
  risky: boolean;
}

export interface HttpInfo {
  reachable: boolean;
  httpsSupported: boolean;
  statusCode?: number;
  server?: string;
  poweredBy?: string;
  cms?: string;
  technologies: string[];
  headers: Record<string, string>;
}

export interface SecurityHeader {
  name: string;
  present: boolean;
  value?: string;
}

export interface SecurityHeadersInfo {
  score: number; // 0-100 (% of recommended headers present)
  headers: SecurityHeader[];
}

export interface BlacklistInfo {
  checked: boolean;
  listed: boolean;
  sources: string[];
}

export interface RiskBreakdownItem {
  label: string;
  points: number;
  note: string;
}

export interface ScanResult {
  target: string;
  url: string;
  scanDate: string;
  durationMs: number;
  ipAddress: string | null;
  hostingProvider: string | null;
  country: string | null;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  riskBreakdown: RiskBreakdownItem[];
  dns: DnsInfo;
  whois: WhoisInfo;
  ssl: SslInfo;
  http: HttpInfo;
  securityHeaders: SecurityHeadersInfo;
  ports: PortInfo[];
  blacklist: BlacklistInfo;
  summary: string;
}
