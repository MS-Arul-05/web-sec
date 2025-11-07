import React from 'react';
import type { ScanResult } from '../types';

// Declaration to inform TypeScript about jspdf and its plugins on the window object
declare const jspdf: any;

interface ReportGeneratorProps {
    result: ScanResult;
}

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ result }) => {
    
    const downloadJson = () => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(result, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `secure-web-Report-${result.target}.json`;
        link.click();
    };

    const generatePdf = () => {
        const { jsPDF } = jspdf;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor('#0369a1'); // sky-700
        doc.text("secure-web Scan Report", 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor('#475569'); // slate-600
        doc.text(`Target: ${result.target}`, 105, 30, { align: 'center' });
        doc.text(`Date: ${new Date(result.scanDate).toLocaleString()}`, 105, 37, { align: 'center' });

        // Summary
        doc.setFontSize(16);
        doc.setTextColor('#1e293b'); // slate-800
        doc.text("Scan Summary", 14, 55);
        doc.autoTable({
            startY: 60,
            head: [['Metric', 'Value']],
            body: [
                ['Overall Score', result.overallScore],
                ['Risk Level', result.riskLevel],
                ['AI Confidence', `${(result.aiConfidence * 100).toFixed(0)}%`],
                ['Detected OS', result.osDetection],
            ],
            theme: 'grid',
            headStyles: { fillColor: '#0ea5e9' } // sky-500
        });

        // Open Ports
        let finalY = doc.autoTable.previous.finalY;
        if (finalY > 250) { // Check if new page is needed
             doc.addPage();
             finalY = 0;
        }
        doc.text("Open Ports", 14, finalY + 15);
        doc.autoTable({
            startY: finalY + 20,
            head: [['Port', 'Protocol', 'State', 'Service', 'Version']],
            body: result.openPorts.map(p => [p.port, p.protocol, p.state, p.service, p.version]),
            theme: 'grid',
            headStyles: { fillColor: '#0ea5e9' }
        });

        // Vulnerabilities
        finalY = doc.autoTable.previous.finalY;
         if (finalY > 250) {
             doc.addPage();
             finalY = 0;
        }
        doc.text("Vulnerabilities", 14, finalY + 15);
        doc.autoTable({
            startY: finalY + 20,
            head: [['Severity', 'Name', 'CVE', 'Description']],
            body: result.vulnerabilities.map(v => [v.severity, v.name, v.cve || 'N/A', v.description]),
            theme: 'grid',
            headStyles: { fillColor: '#0ea5e9' },
            columnStyles: { 3: { cellWidth: 'auto' } }
        });
        
        doc.save(`secure-web-Report-${result.target}.pdf`);
    };

    return (
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button 
                onClick={downloadJson}
                className="flex items-center px-4 py-2 bg-white border border-sky-500 text-sky-700 text-sm font-semibold rounded-md hover:bg-sky-500 hover:text-white transition-colors duration-300"
            >
                <DownloadIcon />
                JSON
            </button>
            <button 
                onClick={generatePdf}
                className="flex items-center px-4 py-2 bg-white border border-sky-500 text-sky-700 text-sm font-semibold rounded-md hover:bg-sky-500 hover:text-white transition-colors duration-300"
            >
                <DownloadIcon />
                PDF
            </button>
        </div>
    );
};