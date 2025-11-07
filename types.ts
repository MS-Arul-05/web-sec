export interface User {
    name: string;
    email: string;
}

// FIX: Add missing type definitions for ScanResult, PortInfo, Vulnerability, RiskLevel, and ChartData.
export enum RiskLevel {
    None = 'None',
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    Critical = 'Critical',
}

export interface PortInfo {
    port: number;
    protocol: string;
    state: string;
    service: string;
    version: string;
}

export interface Vulnerability {
    id: string;
    name: string;
    severity: RiskLevel;
    description: string;
    cve?: string;
}

export interface ScanResult {
    target: string;
    scanDate: string;
    overallScore: number;
    riskLevel: RiskLevel;
    aiConfidence: number;
    summary: string;
    osDetection: string;
    openPorts: PortInfo[];
    vulnerabilities: Vulnerability[];
}

export interface ChartData {
    name: RiskLevel;
    count: number;
}
