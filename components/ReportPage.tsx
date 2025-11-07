import React from 'react';
import type { ScanResult, ChartData, Vulnerability } from '../types';
import { RiskLevel } from '../types';
import { SummaryCard } from './SummaryCard';
import { VulnerabilityChart } from './VulnerabilityChart';
import { PortTable } from './PortTable';
import { ReportGenerator } from './ReportGenerator';

interface ReportPageProps {
    result: ScanResult;
    onBack: () => void;
}

const getRiskColor = (level: RiskLevel) => {
    switch (level) {
        case RiskLevel.Critical: return 'text-red-600';
        case RiskLevel.High: return 'text-orange-500';
        case RiskLevel.Medium: return 'text-yellow-500';
        case RiskLevel.Low: return 'text-green-500';
        default: return 'text-slate-800';
    }
}

const VulnerabilityDetails: React.FC<{ vulnerabilities: Vulnerability[] }> = ({ vulnerabilities }) => (
    <div className="bg-white p-6 rounded-lg border border-slate-200">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">Vulnerability Details</h3>
        <div className="space-y-4">
            {vulnerabilities.length > 0 ? vulnerabilities.map(vuln => (
                <div key={vuln.id} className="border-b border-slate-200 pb-3 last:border-b-0">
                    <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-slate-800">{vuln.name}</h4>
                        <span className={`text-sm font-bold px-2 py-1 rounded-full ${getRiskColor(vuln.severity)} bg-opacity-10 ${getRiskColor(vuln.severity).replace('text-', 'bg-')}`}>{vuln.severity}</span>
                    </div>
                    {vuln.cve && <p className="text-xs text-slate-500 font-mono mt-1">{vuln.cve}</p>}
                    <p className="text-sm text-slate-600 mt-2">{vuln.description}</p>
                </div>
            )) : (
                 <p className="text-slate-500">No vulnerabilities detected.</p>
            )}
        </div>
    </div>
);

export const ReportPage: React.FC<ReportPageProps> = ({ result, onBack }) => {

    const chartData: ChartData[] = Object.values(RiskLevel).map(level => ({
        name: level,
        count: result.vulnerabilities.filter(v => v.severity === level).length
    })).filter(item => item.count > 0);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                 <div>
                    <h1 className="text-3xl font-bold text-slate-800">Scan Report</h1>
                    <p className="text-slate-600 mt-1">Results for <span className="font-semibold text-sky-700">{result.target}</span></p>
                </div>
                <div className="flex items-center space-x-4">
                    <ReportGenerator result={result} />
                    <button onClick={onBack} className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md hover:bg-slate-300 transition-colors">
                        &larr; Back to Dashboard
                    </button>
                </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard title="Overall Score" value={result.overallScore} color={getRiskColor(result.riskLevel)} subtext="0-100 Scale (Lower is better)" />
                <SummaryCard title="Risk Level" value={result.riskLevel} color={getRiskColor(result.riskLevel)} />
                <SummaryCard title="AI Confidence" value={`${(result.aiConfidence * 100).toFixed(0)}%`} />
                <SummaryCard title="Detected OS" value={result.osDetection} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg border border-slate-200 min-h-[300px]">
                     <h3 className="text-lg font-semibold mb-4 text-slate-800">Vulnerabilities by Severity</h3>
                     {chartData.length > 0 ? <VulnerabilityChart data={chartData} /> : <p className="text-slate-500 flex items-center justify-center h-full">No vulnerability data to display.</p>}
                </div>
                <VulnerabilityDetails vulnerabilities={result.vulnerabilities} />
            </div>

            <div>
                <PortTable ports={result.openPorts} />
            </div>
        </div>
    );
};
