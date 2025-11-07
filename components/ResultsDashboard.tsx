import React, { useState } from 'react';

// FIX: Changed JSX.Element to React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
const StatCard: React.FC<{ title: string; value: string; icon: React.ReactElement }> = ({ title, value, icon }) => (
    <div className="bg-sky-100 p-6 rounded-lg flex items-center space-x-4 shadow-sm border border-slate-200">
        <div className="bg-sky-500 p-3 rounded-full text-white">
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

interface DashboardPageProps {
    onScan: (url: string) => void;
    isLoading: boolean;
    error: string | null;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onScan, isLoading, error }) => {
    const [url, setUrl] = useState('');
    
    const handleScanClick = () => {
        onScan(url);
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-slate-800">welcome to secure-web</h1>
                <p className="text-slate-600 mt-2">Your central hub for security operations.</p>
            </div>

            <div className="max-w-3xl mx-auto">
                <div className="flex items-center space-x-2">
                    <div className="relative flex-grow">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                         </div>
                        <input 
                            type="search" 
                            placeholder="Enter a URL to scan, e.g., https://google.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={isLoading}
                            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100"
                        />
                    </div>
                     <button 
                        onClick={handleScanClick}
                        disabled={isLoading}
                        className="px-8 py-3 bg-sky-500 text-white font-semibold rounded-full shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Scanning...' : 'Scan'}
                    </button>
                </div>
                {error && <p className="text-center text-red-600 mt-4">{error}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <StatCard 
                    title="User Count" 
                    value="1,287" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0012 13a5.975 5.975 0 003-1.197z" /></svg>}
                />
                 <StatCard 
                    title="Successfully User Count" 
                    value="1,250" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
            </div>
        </div>
    );
};