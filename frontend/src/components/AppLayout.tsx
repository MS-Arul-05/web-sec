import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Logo } from '@/components/Logo';

const navItems = [
  { to: '/app/scanner', label: 'Website Scanner' },
  { to: '/app/image', label: 'AI Image' },
  { to: '/app/video', label: 'AI Video' },
  { to: '/app/dashboard', label: 'Dashboard' },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen">
      <AnimatedBackground />

      <header className="sticky top-0 z-40 border-b border-cyber-border/60 bg-cyber-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/app/scanner" className="flex items-center gap-2">
            <Logo />
            <span className="hidden text-lg font-bold text-white sm:block">
              AI<span className="text-cyber-indigo">Sec</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="User menu"
              aria-expanded={menuOpen ? 'true' : 'false'}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyber-indigo to-cyber-purple text-sm font-bold text-white"
            >
              {user?.fullName?.[0]?.toUpperCase() ?? 'U'}
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 mt-2 w-60 glass-strong p-2 shadow-glow"
                >
                  <div className="border-b border-cyber-border px-3 py-2">
                    <p className="truncate text-sm font-semibold text-white">{user?.fullName}</p>
                    <p className="truncate text-xs text-slate-400">{user?.email}</p>
                    {user?.role === 'admin' && (
                      <span className="mt-1 inline-block rounded bg-cyber-purple/20 px-2 py-0.5 text-[10px] font-bold uppercase text-cyber-purple">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="md:hidden">
                    {navItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5"
                  >
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
