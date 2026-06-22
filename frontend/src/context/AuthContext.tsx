import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { profileApi } from '@/lib/api';
import type { User } from '@/types';

interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  company?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterInput) => Promise<{ needsEmailConfirmation: boolean }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Maps a Supabase auth user to our app's User shape. */
function mapUser(u: SupabaseUser): User {
  const meta = u.user_metadata ?? {};
  const appMeta = u.app_metadata ?? {};
  return {
    id: u.id,
    email: u.email ?? '',
    fullName: (meta.full_name as string) ?? (meta.name as string) ?? '',
    company: (meta.company as string) ?? null,
    role: (appMeta.role as string) ?? 'user',
    emailVerified: Boolean(u.email_confirmed_at),
    createdAt: u.created_at ?? new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore any existing session, then subscribe to auth changes.
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ? mapUser(data.session.user) : null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? mapUser(session.user) : null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const login: AuthContextValue['login'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    // Ensure a local DB profile row exists (best-effort).
    profileApi.sync().catch(() => undefined);
  };

  const register: AuthContextValue['register'] = async ({ fullName, email, password, company }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, company } },
    });
    if (error) throw new Error(error.message);
    // If email confirmation is enabled, there is no session yet.
    if (!data.session) return { needsEmailConfirmation: true };
    profileApi.sync({ fullName, company }).catch(() => undefined);
    return { needsEmailConfirmation: false };
  };

  const logout: AuthContextValue['logout'] = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
