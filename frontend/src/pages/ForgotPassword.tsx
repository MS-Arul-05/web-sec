import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Logo } from '@/components/Logo';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Password-reset email delivery is wired up with the mail service in a later milestone.
    setSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <AnimatedBackground />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-strong p-8 shadow-glow"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo className="h-12 w-12" />
          <h1 className="mt-4 text-2xl font-bold text-white">Reset your password</h1>
          <p className="mt-1 text-sm text-slate-400">We&apos;ll email you a reset link</p>
        </div>

        {sent ? (
          <p className="rounded-lg bg-risk-safe/10 px-4 py-3 text-center text-sm text-risk-safe">
            If an account exists for {email}, a reset link is on its way.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@company.com" />
            </div>
            <button type="submit" className="btn-primary w-full">Send Reset Link</button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-400">
          <Link to="/login" className="font-semibold text-cyber-indigo hover:underline">Back to sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
