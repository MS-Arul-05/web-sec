import { useEffect, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { scansApi, apiErrorMessage } from '@/lib/api';
import type { ScanRecord, ScanSummary } from '@/types';
import { Spinner } from '@/components/ui/Spinner';
import { ScanResultView } from '@/components/scanner/ScanResultView';

const riskColor: Record<string, string> = {
  Safe: 'text-risk-safe',
  Moderate: 'text-risk-moderate',
  'High Risk': 'text-risk-high',
  Unknown: 'text-slate-400',
};

export default function Scanner() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [current, setCurrent] = useState<ScanRecord | null>(null);
  const [history, setHistory] = useState<ScanSummary[]>([]);

  const loadHistory = () => {
    scansApi.list().then(setHistory).catch(() => undefined);
  };
  useEffect(loadHistory, []);

  const handleScan = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return setError('Please enter a URL to scan');
    setError('');
    setLoading(true);
    setCurrent(null);
    try {
      const scan = await scansApi.create(url.trim());
      setCurrent(scan);
      loadHistory();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const openHistory = async (id: string) => {
    setError('');
    setLoading(true);
    try {
      setCurrent(await scansApi.get(id));
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Website Security Scanner</h1>
        <p className="mt-1 text-slate-400">
          Run DNS, WHOIS, SSL, port, header, and reputation analysis with AI risk scoring.
        </p>
      </div>

      {/* Scan input */}
      <motion.form
        onSubmit={handleScan}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong flex flex-col gap-3 p-4 sm:flex-row"
      >
        <div className="relative flex-1">
          <svg className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            placeholder="https://example.com"
            className="input pl-12"
            aria-label="Website URL to scan"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary sm:w-40">
          {loading ? <Spinner /> : 'Scan Website'}
        </button>
      </motion.form>

      {error && (
        <p className="rounded-lg bg-risk-high/10 px-4 py-3 text-sm text-risk-high" role="alert">{error}</p>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        {/* Result area */}
        <div className="order-2 lg:order-1">
          {loading && !current && (
            <div className="glass-strong flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
              <Spinner className="h-8 w-8 text-cyber-indigo" />
              <p>Running security analysis…</p>
            </div>
          )}
          {current && <ScanResultView record={current} />}
          {!loading && !current && (
            <div className="glass flex flex-col items-center justify-center gap-2 py-20 text-center text-slate-400">
              <p className="text-lg">Enter a URL above to start a scan</p>
              <p className="text-sm text-slate-500">Real DNS, SSL, ports, headers and risk scoring.</p>
            </div>
          )}
        </div>

        {/* History sidebar */}
        <aside className="order-1 lg:order-2">
          <div className="glass-strong p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Recent Scans</h3>
            {history.length === 0 ? (
              <p className="text-sm text-slate-500">No scans yet.</p>
            ) : (
              <ul className="space-y-1">
                {history.map((h) => (
                  <li key={h.id}>
                    <button
                      type="button"
                      onClick={() => openHistory(h.id)}
                      className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5"
                    >
                      <span className="truncate text-slate-200">{h.target}</span>
                      <span className={`font-bold ${riskColor[h.riskLevel] ?? ''}`}>{h.riskScore}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
