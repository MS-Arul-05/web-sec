import { motion } from 'framer-motion';
import type { ScanRecord } from '@/types';
import { RiskGauge } from './RiskGauge';
import { PortChart } from './PortChart';
import { scansApi, downloadAuthed } from '@/lib/api';

function severityStyle(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical': return 'bg-red-500/15 text-red-400 border-red-500/30';
    case 'high': return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
    case 'medium': return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    case 'low': return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
    default: return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
  }
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-cyber-border/50 py-2 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-right text-sm font-medium text-slate-100">{value || '—'}</span>
    </div>
  );
}

function Card({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass-strong p-5 ${className}`}>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">{title}</h3>
      {children}
    </div>
  );
}

export function ScanResultView({ record }: { record: ScanRecord }) {
  const r = record.result;
  const safeName = r.target.replace(/[^a-z0-9.-]/gi, '_');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header + exports */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{r.target}</h2>
          <p className="text-sm text-slate-400">
            Scanned {new Date(r.scanDate).toLocaleString()} • {r.durationMs} ms
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => downloadAuthed(scansApi.exportJsonUrl(record.id), `secure-web-${safeName}.json`)}
            className="btn-ghost text-sm"
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => downloadAuthed(scansApi.exportPdfUrl(record.id), `secure-web-${safeName}.pdf`)}
            className="btn-primary text-sm"
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* Score + summary */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Risk Score" className="flex items-center justify-center">
          <RiskGauge score={r.riskScore} level={r.riskLevel} />
        </Card>
        <Card title="Summary" className="lg:col-span-2">
          <p className="text-slate-200">{r.summary}</p>
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
            <InfoRow label="IP Address" value={r.ipAddress} />
            <InfoRow label="Hosting" value={r.hostingProvider} />
            <InfoRow label="Country" value={r.country} />
            <InfoRow label="Server" value={r.http.server} />
            <InfoRow label="CMS" value={r.http.cms} />
            <InfoRow label="HTTPS" value={r.http.httpsSupported ? 'Yes' : 'No'} />
          </div>
        </Card>
      </div>

      {/* AI threat analysis (Gemini) */}
      {(r.aiThreats?.length ?? 0) > 0 && (
        <Card title="🤖 AI Threat Analysis">
          <p className="-mt-2 mb-4 text-xs text-slate-500">
            {r.aiThreats.length} threat{r.aiThreats.length === 1 ? '' : 's'} identified by Gemini AI
          </p>
          <div className="space-y-3">
            {r.aiThreats.map((threat, i) => (
              <div key={`${threat.name}-${i}`} className="rounded-xl border border-cyber-border bg-cyber-surface/60 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-white">{threat.name}</span>
                  <span className="rounded-full border border-cyber-border bg-white/5 px-2 py-0.5 text-xs text-slate-300">
                    {threat.type}
                  </span>
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-bold ${severityStyle(threat.severity)}`}>
                    {threat.severity}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-300">{threat.description}</p>
                {threat.recommendation && (
                  <p className="mt-2 text-sm text-cyber-cyan">
                    <span className="font-semibold">Fix:</span> {threat.recommendation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Risk breakdown */}
      <Card title="Risk Breakdown">
        <div className="space-y-2">
          {r.riskBreakdown.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-200">{item.label}</p>
                <p className="text-xs text-slate-500">{item.note}</p>
              </div>
              <span
                className={`rounded-lg px-2.5 py-1 text-sm font-bold ${
                  item.points >= 0 ? 'bg-risk-safe/10 text-risk-safe' : 'bg-risk-high/10 text-risk-high'
                }`}
              >
                {item.points > 0 ? '+' : ''}
                {item.points}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Port distribution */}
        <Card title="Open Ports">
          <PortChart ports={r.ports} />
        </Card>

        {/* Security headers */}
        <Card title={`Security Headers — ${r.securityHeaders.score}/100`}>
          <div className="space-y-1">
            {r.securityHeaders.headers.map((h) => (
              <div key={h.name} className="flex items-center justify-between py-1">
                <span className="font-mono text-xs text-slate-300">{h.name}</span>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    h.present ? 'bg-risk-safe/10 text-risk-safe' : 'bg-risk-high/10 text-risk-high'
                  }`}
                >
                  {h.present ? 'Present' : 'Missing'}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* SSL */}
        <Card title="TLS / SSL Certificate">
          <InfoRow label="Valid" value={r.ssl.valid ? 'Yes' : 'No'} />
          <InfoRow label="Issuer" value={r.ssl.issuer} />
          <InfoRow label="Protocol" value={r.ssl.protocol} />
          <InfoRow label="Expires" value={r.ssl.validTo} />
          <InfoRow label="Days to expiry" value={r.ssl.daysUntilExpiry?.toString()} />
        </Card>

        {/* WHOIS + DNS */}
        <Card title="WHOIS & DNS">
          <InfoRow label="Registrar" value={r.whois.registrar} />
          <InfoRow label="Created" value={r.whois.createdDate} />
          <InfoRow label="Domain age" value={r.whois.domainAgeDays ? `${r.whois.domainAgeDays} days` : undefined} />
          <InfoRow label="Name servers" value={r.dns.nameServers.slice(0, 2).join(', ')} />
          <InfoRow label="IPv4" value={r.dns.ipv4.join(', ')} />
        </Card>
      </div>

      {/* Technologies */}
      {r.http.technologies.length > 0 && (
        <Card title="Detected Technologies">
          <div className="flex flex-wrap gap-2">
            {r.http.technologies.map((t) => (
              <span key={t} className="rounded-full border border-cyber-border bg-cyber-surface px-3 py-1 text-sm text-slate-200">
                {t}
              </span>
            ))}
          </div>
        </Card>
      )}
    </motion.div>
  );
}
