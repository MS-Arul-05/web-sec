import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Logo } from '@/components/Logo';
import { CountUp } from '@/components/CountUp';
import { statsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import type { PlatformStats } from '@/types';

const features = [
  { icon: '🌐', title: 'Website Scanner', desc: 'Full DNS, WHOIS, and infrastructure analysis.' },
  { icon: '🔌', title: 'Port Scanner', desc: 'Detect open and exposed services in real time.' },
  { icon: '🔒', title: 'SSL Checker', desc: 'Validate certificates, issuers, and expiry.' },
  { icon: '🛡️', title: 'Vulnerability Detection', desc: 'Surface misconfigurations and weak headers.' },
  { icon: '🖼️', title: 'AI Image Detection', desc: 'Identify AI-generated images and deepfakes.' },
  { icon: '🎬', title: 'AI Video Detection', desc: 'Frame-level deepfake and AI video analysis.' },
  { icon: '📊', title: 'Risk Score Engine', desc: 'Weighted 0–100 scoring with full breakdown.' },
  { icon: '📄', title: 'Security Reports', desc: 'Branded PDF + JSON exports in one click.' },
];

const steps = [
  { n: 1, t: 'Enter URL', d: 'Paste any website address.' },
  { n: 2, t: 'Scan Website', d: 'We probe DNS, SSL, ports & headers.' },
  { n: 3, t: 'Analyze Security', d: 'AI computes a weighted risk score.' },
  { n: 4, t: 'Generate Report', d: 'Review findings in a rich dashboard.' },
  { n: 5, t: 'Download PDF', d: 'Export a shareable security report.' },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'CISO, FinEdge', quote: 'Cut our pre-launch security review from days to minutes. The risk breakdown is gold.' },
  { name: 'Marcus Reilly', role: 'DevOps Lead, Nimbus', quote: 'The port and header scanning caught an exposed service our pipeline missed.' },
  { name: 'Aisha Patel', role: 'Founder, Pixela', quote: 'AI image detection is a game-changer for verifying user-generated content.' },
];

function Section({ id, children, className = '' }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </section>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const ctaTarget = user ? '/app/scanner' : '/signup';

  useEffect(() => {
    statsApi.get().then(setStats).catch(() => undefined);
  }, []);

  return (
    <div className="min-h-screen">
      <AnimatedBackground />

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-cyber-border/40 bg-cyber-bg/60 backdrop-blur-xl">
        <Section className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
            <span className="text-lg font-bold text-white">AI<span className="text-cyber-indigo">Sec</span></span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#how" className="hover:text-white">How it works</a>
            <a href="#stats" className="hover:text-white">Stats</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-slate-300 hover:text-white">Sign in</Link>
            <Link to={ctaTarget} className="btn-primary text-sm">Get Started</Link>
          </div>
        </Section>
      </header>

      {/* Hero */}
      <Section className="py-24 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-block rounded-full border border-cyber-border bg-white/5 px-4 py-1.5 text-xs font-medium text-cyber-cyan">
            ⚡ Powered by AI Threat Intelligence
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-extrabold leading-tight text-white sm:text-6xl">
            AI Security{' '}
            <span className="bg-gradient-to-r from-cyber-indigo via-cyber-purple to-cyber-cyan bg-clip-text text-transparent">
              Intelligence Platform
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
            Analyze Websites, Images, and Videos using AI-powered Security Scanning and Threat Detection.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to={ctaTarget} className="btn-primary px-8 py-3 text-base">Start Scanning</Link>
            <a href="#how" className="btn-ghost px-8 py-3 text-base">View Demo</a>
          </div>
        </motion.div>
      </Section>

      {/* About */}
      <Section id="about" className="py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { t: 'Website Scanning', d: 'We resolve DNS, inspect TLS certificates, probe open ports, fetch HTTP/security headers, and check domain reputation — then compute a weighted risk score.' },
            { t: 'AI Image Detection', d: 'Computer-vision models (ResNet/EfficientNet/CLIP) classify whether an image is AI-generated or human, with confidence and metadata analysis.' },
            { t: 'AI Video Detection', d: 'Frame-by-frame deepfake analysis evaluates face consistency and lip-sync to flag synthetic or manipulated video.' },
          ].map((a) => (
            <div key={a.t} className="glass-strong p-6">
              <h3 className="text-lg font-semibold text-white">{a.t}</h3>
              <p className="mt-2 text-sm text-slate-400">{a.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Features */}
      <Section id="features" className="py-16">
        <h2 className="text-center text-3xl font-bold text-white">Everything you need to assess risk</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-strong p-6 transition hover:border-cyber-indigo hover:shadow-glow"
            >
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-3 font-semibold text-white">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* How it works */}
      <Section id="how" className="py-16">
        <h2 className="text-center text-3xl font-bold text-white">How it works</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-5">
          {steps.map((s) => (
            <div key={s.n} className="glass-strong p-5 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyber-indigo to-cyber-purple font-bold text-white">
                {s.n}
              </div>
              <h3 className="mt-3 font-semibold text-white">{s.t}</h3>
              <p className="mt-1 text-xs text-slate-400">{s.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Stats */}
      <Section id="stats" className="py-16">
        <div className="glass-strong grid gap-8 p-10 sm:grid-cols-4">
          {[
            { label: 'Websites Scanned', value: stats?.websitesScanned ?? 0 },
            { label: 'Threats Detected', value: stats?.threatsDetected ?? 0 },
            { label: 'Images Analyzed', value: stats?.imagesAnalyzed ?? 0 },
            { label: 'Videos Analyzed', value: stats?.videosAnalyzed ?? 0 },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="bg-gradient-to-r from-cyber-indigo to-cyber-purple bg-clip-text text-4xl font-extrabold text-transparent">
                <CountUp end={s.value} />+
              </p>
              <p className="mt-1 text-sm text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Testimonials */}
      <Section className="py-16">
        <h2 className="text-center text-3xl font-bold text-white">Trusted by security teams</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="glass-strong p-6">
              <p className="text-slate-300">“{t.quote}”</p>
              <div className="mt-4">
                <p className="font-semibold text-white">{t.name}</p>
                <p className="text-sm text-slate-400">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t border-cyber-border/40 py-10">
        <Section className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-6" />
            <span className="font-semibold text-white">AI Security Intelligence Platform</span>
          </div>
          <nav className="flex gap-6 text-sm text-slate-400">
            <a href="#about" className="hover:text-white">About</a>
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Contact</a>
            <a href="#" className="hover:text-white">Documentation</a>
          </nav>
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} AISec. All rights reserved.</p>
        </Section>
      </footer>
    </div>
  );
}
