import { useState, useMemo, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { apiErrorMessage } from '@/lib/api';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Logo } from '@/components/Logo';
import { Spinner } from '@/components/ui/Spinner';
import { OAuthButtons } from '@/components/OAuthButtons';

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#ef4444', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e'];
  return { score, label: labels[score], color: colors[score] };
}

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => passwordStrength(password), [password]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match');
    if (strength.score < 3) return setError('Please choose a stronger password (8+ chars, upper, lower, number)');
    if (!agreed) return setError('You must accept the Terms and Conditions');

    setLoading(true);
    try {
      await register({ fullName, email, password, company: company || undefined });
      navigate('/app/scanner', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <AnimatedBackground />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-strong p-8 shadow-glow"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo className="h-12 w-12" />
          <h1 className="mt-4 text-2xl font-bold text-white">Create your account</h1>
          <p className="mt-1 text-sm text-slate-400">Start scanning in minutes — free tier included</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="label">Full Name</label>
            <input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" placeholder="Jane Doe" />
          </div>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@company.com" />
          </div>
          <div>
            <label htmlFor="company" className="label">Company <span className="text-slate-500">(optional)</span></label>
            <input id="company" value={company} onChange={(e) => setCompany(e.target.value)} className="input" placeholder="Acme Inc." />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input id="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" />
            {password && (
              <div className="mt-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-cyber-border">
                  <div className="h-full transition-all" style={{ width: `${(strength.score / 4) * 100}%`, backgroundColor: strength.color }} />
                </div>
                <p className="mt-1 text-xs" style={{ color: strength.color }}>{strength.label}</p>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="confirm" className="label">Confirm Password</label>
            <input id="confirm" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input" placeholder="••••••••" />
          </div>

          <label className="flex items-start gap-2 text-sm text-slate-400">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-cyber-border bg-cyber-surface text-cyber-indigo focus:ring-cyber-indigo" />
            <span>I agree to the <a href="#" className="text-cyber-indigo hover:underline">Terms and Conditions</a> and <a href="#" className="text-cyber-indigo hover:underline">Privacy Policy</a></span>
          </label>

          {error && (
            <p className="rounded-lg bg-risk-high/10 px-3 py-2 text-sm text-risk-high" role="alert">{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Spinner /> : 'Create Account'}
          </button>
        </form>

        <OAuthButtons />

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-cyber-indigo hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
