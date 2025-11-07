import React, { useState } from 'react';
import type { User, ScanResult } from './types';
import { LoginPage } from './components/ScanForm';
import { DashboardPage } from './components/ResultsDashboard';
import { Header } from './components/Header';
import { ReportPage } from './components/ReportPage';
import { runScan } from './services/scannerService';


const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [view, setView] = useState<'login' | 'dashboard' | 'report'>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [error, setError] = useState<string | null>(null);


    const handleLogin = (loggedInUser: User) => {
        setUser(loggedInUser);
        setView('dashboard');
    };

    const handleLogout = () => {
        setUser(null);
        setScanResult(null);
        setView('login');
    };
    
    const handleScan = async (url: string) => {
        if (!url) {
            setError("Please enter a URL to scan.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = await runScan(url);
            setScanResult(result);
            setView('report');
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleBackToDashboard = () => {
        setScanResult(null);
        setError(null);
        setView('dashboard');
    };

    const renderContent = () => {
        switch(view) {
            case 'dashboard':
                return <DashboardPage onScan={handleScan} isLoading={isLoading} error={error} />;
            case 'report':
                if (scanResult) {
                    return <ReportPage result={scanResult} onBack={handleBackToDashboard} />;
                }
                // Fallback to dashboard if no result
                handleBackToDashboard();
                return null;
            default:
                 return <LoginPage onLogin={handleLogin} />;
        }
    };

    if (!user) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return (
        <div className="bg-white min-h-screen">
            <Header user={user} onLogout={handleLogout} />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                 {renderContent()}
            </main>
        </div>
    );
};

export default App;