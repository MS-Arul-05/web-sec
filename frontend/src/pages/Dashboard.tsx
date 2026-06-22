import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { scansApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { ScanSummary } from '@/types';

const riskColor: Record<string, string> = {
  Safe: 'text-risk-safe',
  Moderate: 'text-risk-moderate',
  'High Risk': 'text-risk-high',
  Unknown: 'text-slate-400',
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass-strong p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-white">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [scans, setScans] = useState<ScanSummary[]>([]);

  useEffect(() => {
    scansApi.list().then(setScans).catch(() => undefined);
  }, []);

  const avgScore = scans.length
    ? Math.round(scans.reduce((a, s) => a + s.riskScore, 0) / scans.length)
    : 0;
  const highRisk = scans.filter((s) => s.riskLevel === 'High Risk').length;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Welcome back, {user?.fullName?.split(' ')[0]}</h1>
        <p className="mt-1 text-slate-400">Your security overview at a glance.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Scans" value={scans.length} />
        <StatCard label="Average Score" value={avgScore} />
        <StatCard label="High-Risk Sites" value={highRisk} />
        <StatCard label="Plan" value="Free" />
      </div>

      <div className="glass-strong p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Scans</h2>
          <Link to="/app/scanner" className="btn-primary text-sm">New Scan</Link>
        </div>
        {scans.length === 0 ? (
          <p className="py-8 text-center text-slate-500">No scans yet. Run your first scan to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-2">Target</th>
                  <th className="py-2">IP</th>
                  <th className="py-2">Score</th>
                  <th className="py-2">Risk</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((s) => (
                  <tr key={s.id} className="border-t border-cyber-border/50">
                    <td className="py-3 font-medium text-slate-200">{s.target}</td>
                    <td className="py-3 text-slate-400">{s.ipAddress ?? '—'}</td>
                    <td className={`py-3 font-bold ${riskColor[s.riskLevel] ?? ''}`}>{s.riskScore}</td>
                    <td className={`py-3 ${riskColor[s.riskLevel] ?? ''}`}>{s.riskLevel}</td>
                    <td className="py-3 text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
