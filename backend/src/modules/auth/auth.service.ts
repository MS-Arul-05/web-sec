import { prisma } from '../../db/prisma';
import type { SupabaseUser } from '../../utils/supabaseAuth';

export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  company: string | null;
  role: string;
  emailVerified: boolean;
  createdAt: Date;
}

/**
 * Ensures a local User row exists for a Supabase-authenticated identity.
 * Called lazily so scan/report foreign keys always resolve. Returns the row.
 */
export async function ensureUser(
  identity: SupabaseUser,
  profile?: { fullName?: string; company?: string },
): Promise<PublicUser> {
  const user = await prisma.user.upsert({
    where: { id: identity.sub },
    update: {
      email: identity.email,
      // keep role in sync with the token claim
      role: identity.role,
      ...(profile?.fullName ? { fullName: profile.fullName } : {}),
      ...(profile?.company !== undefined ? { company: profile.company } : {}),
    },
    create: {
      id: identity.sub,
      email: identity.email,
      role: identity.role,
      fullName: profile?.fullName ?? '',
      company: profile?.company,
      emailVerified: true,
      subscription: { create: { plan: 'free' } },
    },
  });

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    company: user.company,
    role: user.role,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  };
}
