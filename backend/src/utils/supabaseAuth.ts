import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { env } from '../config/env';

// Supabase signs access tokens with asymmetric keys; verify against the project JWKS.
const JWKS = createRemoteJWKSet(new URL(env.supabaseJwksUrl));

export interface SupabaseUser {
  sub: string;
  email: string;
  role: string;
}

interface SupabaseClaims extends JWTPayload {
  email?: string;
  app_metadata?: { role?: string };
  user_metadata?: Record<string, unknown>;
}

/** Verifies a Supabase access token and returns the identity. Throws on failure. */
export async function verifySupabaseToken(token: string): Promise<SupabaseUser> {
  const { payload } = await jwtVerify<SupabaseClaims>(token, JWKS, {
    issuer: env.supabaseIssuer,
    audience: 'authenticated',
  });
  if (!payload.sub) throw new Error('Token missing subject');
  return {
    sub: payload.sub,
    email: payload.email ?? '',
    role: payload.app_metadata?.role ?? 'user',
  };
}
