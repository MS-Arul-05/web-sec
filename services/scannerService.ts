
import type { ScanResult, PortInfo, Vulnerability } from '../types';
import { RiskLevel } from '../types';

const generateRandomPorts = (count: number): PortInfo[] => {
    const ports: PortInfo[] = [];
    const commonPorts: { [key: number]: { service: string, version: string } } = {
        21: { service: 'ftp', version: 'vsftpd 3.0.3' },
        22: { service: 'ssh', version: 'OpenSSH 8.2p1' },
        80: { service: 'http', version: 'Apache httpd 2.4.41' },
        443: { service: 'https', version: 'nginx 1.18.0' },
        3306: { service: 'mysql', version: 'MySQL 8.0.22' },
        5432: { service: 'postgresql', version: 'PostgreSQL 13.1' },
        8080: { service: 'http-proxy', version: 'Tomcat 9.0' },
    };

    const usedPorts = new Set<number>();
    while (ports.length < count) {
        const portKeys = Object.keys(commonPorts).map(Number);
        const randomPort = portKeys[Math.floor(Math.random() * portKeys.length)];
        if (!usedPorts.has(randomPort)) {
            usedPorts.add(randomPort);
            ports.push({
                port: randomPort,
                protocol: 'TCP',
                service: commonPorts[randomPort].service,
                version: commonPorts[randomPort].version,
                state: 'open',
            });
        }
    }
    return ports.sort((a, b) => a.port - b.port);
};

const generateVulnerabilities = (riskProfile: 'low' | 'medium' | 'high'): Vulnerability[] => {
    const vulns: Vulnerability[] = [];
    const lowRiskVulns: Vulnerability[] = [
        { id: 'VULN-001', name: 'Outdated Server Signature', severity: RiskLevel.Low, description: 'Server version is exposed in headers.', cve: 'CVE-2022-12345' },
        { id: 'VULN-002', name: 'Missing Security Headers', severity: RiskLevel.Low, description: 'Important security headers like CSP are not set.', cve: 'CVE-2021-54321' },
    ];
    const mediumRiskVulns: Vulnerability[] = [
        { id: 'VULN-101', name: 'Cross-Site Scripting (Reflected)', severity: RiskLevel.Medium, description: 'A potential reflected XSS vulnerability was found in a search parameter.', cve: 'CVE-2023-21212' },
        { id: 'VULN-102', name: 'Weak SSL/TLS Ciphers', severity: RiskLevel.Medium, description: 'The server supports weak cipher suites.', cve: 'CVE-2023-34343' },
    ];
    const highRiskVulns: Vulnerability[] = [
        { id: 'VULN-201', name: 'SQL Injection', severity: RiskLevel.High, description: 'A SQL injection vulnerability was detected in the login form.', cve: 'CVE-2024-11111' },
        { id: 'VULN-202', name: 'Outdated Framework Version', severity: RiskLevel.High, description: 'Running a vulnerable version of a known web framework.', cve: 'CVE-2024-22222' },
        { id: 'VULN-301', name: 'Remote Code Execution', severity: RiskLevel.Critical, description: 'A critical vulnerability allows for remote code execution.', cve: 'CVE-2024-99999' },
    ];

    if (riskProfile === 'low') {
        vulns.push(...lowRiskVulns.slice(0, Math.floor(Math.random() * lowRiskVulns.length) + 1));
    }
    if (riskProfile === 'medium') {
        vulns.push(...lowRiskVulns);
        vulns.push(...mediumRiskVulns.slice(0, Math.floor(Math.random() * mediumRiskVulns.length) + 1));
    }
    if (riskProfile === 'high') {
        vulns.push(...lowRiskVulns, ...mediumRiskVulns, ...highRiskVulns);
    }
    return vulns;
};


export const runScan = (url: string): Promise<ScanResult> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                const domain = new URL(url).hostname;
                let riskProfile: 'low' | 'medium' | 'high';
                let score, riskLevel, confidence, os, summary;

                if (domain.includes('google') || domain.includes('facebook') || domain.includes('github')) {
                    riskProfile = 'low';
                    score = Math.floor(Math.random() * 20) + 80; // 80-99
                    riskLevel = RiskLevel.Low;
                    confidence = Math.random() * 0.1 + 0.9; // 90-100%
                    os = 'Google Cloud Platform (Proprietary)';
                    summary = 'The target appears to be well-configured with minimal exposure. Standard hardening practices are in place.'
                } else if (domain.includes('demo') || domain.includes('test')) {
                    riskProfile = 'medium';
                    score = Math.floor(Math.random() * 30) + 40; // 40-69
                    riskLevel = RiskLevel.Medium;
                    confidence = Math.random() * 0.15 + 0.8; // 80-95%
                    os = 'Linux 5.4 (Ubuntu)';
                    summary = 'The target shows signs of misconfiguration and outdated components. Several medium-risk vulnerabilities require attention.'
                } else {
                    riskProfile = 'high';
                    score = Math.floor(Math.random() * 40); // 0-39
                    riskLevel = RiskLevel.Critical;
                    confidence = Math.random() * 0.2 + 0.75; // 75-95%
                    os = 'Windows Server 2012 R2 (Vulnerable)';
                    summary = 'The target is highly vulnerable and exposed to critical threats. Immediate remediation is required to prevent compromise.'
                }

                const vulnerabilities = generateVulnerabilities(riskProfile);
                if (vulnerabilities.some(v => v.severity === RiskLevel.Critical)) riskLevel = RiskLevel.Critical;
                else if (vulnerabilities.some(v => v.severity === RiskLevel.High)) riskLevel = RiskLevel.High;
                else if (vulnerabilities.some(v => v.severity === RiskLevel.Medium)) riskLevel = RiskLevel.Medium;
                else if (vulnerabilities.some(v => v.severity === RiskLevel.Low)) riskLevel = RiskLevel.Low;
                else riskLevel = RiskLevel.None;


                const result: ScanResult = {
                    target: domain,
                    scanDate: new Date().toISOString(),
                    overallScore: score,
                    riskLevel: riskLevel,
                    aiConfidence: parseFloat(confidence.toFixed(2)),
                    summary: summary,
                    osDetection: os,
                    openPorts: generateRandomPorts(Math.floor(Math.random() * 4) + 2),
                    vulnerabilities: vulnerabilities,
                };
                resolve(result);
            } catch (error) {
                reject(new Error('Invalid URL format. Please use a full URL like https://example.com'));
            }
        }, Math.random() * 2000 + 2000); // Simulate 2-4 second scan time
    });
};
