import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const supabaseUrl = required('SUPABASE_URL', 'https://example.supabase.co').replace(/\/$/, '');

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT ?? 4000),
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  // Supabase Auth
  supabaseUrl,
  supabaseIssuer: `${supabaseUrl}/auth/v1`,
  supabaseJwksUrl: process.env.SUPABASE_JWKS_URL ?? `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY ?? '',
  scanTimeoutMs: Number(process.env.SCAN_TIMEOUT_MS ?? 8000),
  googleSafeBrowsingKey: process.env.GOOGLE_SAFE_BROWSING_KEY ?? '',
};
