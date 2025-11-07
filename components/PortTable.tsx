import React from 'react';
import type { PortInfo } from '../types';

interface PortTableProps {
    ports: PortInfo[];
}

export const PortTable: React.FC<PortTableProps> = ({ ports }) => {
    return (
        <div className="bg-white p-6 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Open Ports Analysis</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-sky-700 uppercase bg-sky-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">Port</th>
                            <th scope="col" className="px-6 py-3">Protocol</th>
                            <th scope="col" className="px-6 py-3">State</th>
                            <th scope="col" className="px-6 py-3">Service</th>
                            <th scope="col" className="px-6 py-3">Version</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ports.map((port) => (
                            <tr key={port.port} className="border-b border-slate-200 hover:bg-sky-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{port.port}</td>
                                <td className="px-6 py-4">{port.protocol}</td>
                                <td className="px-6 py-4 text-green-600 font-semibold capitalize">{port.state}</td>
                                <td className="px-6 py-4">{port.service}</td>
                                <td className="px-6 py-4 text-slate-500">{port.version}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};