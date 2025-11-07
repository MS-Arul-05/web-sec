import React from 'react';

interface SummaryCardProps {
    title: string;
    value: string | number;
    subtext?: string;
    color?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, subtext, color = 'text-slate-800' }) => {
    return (
        <div className="bg-white p-6 rounded-lg border border-slate-200 transition-all duration-300 hover:border-sky-500 hover:shadow-lg">
            <h4 className="text-sm font-medium text-slate-500">{title}</h4>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
            {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
        </div>
    );
};