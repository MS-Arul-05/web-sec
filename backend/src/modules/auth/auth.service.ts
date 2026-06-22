import { prisma } from '../../db/prisma';
import { hashPassword, verifyPassword } from '../../utils/password';
import { signToken } from '../../utils/jwt';
import { AppError } from '../../utils/AppError';
import type { RegisterInput, LoginInput } from './auth.schema';

export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  company: string | null;
  role: string;
  emailVerified: boolean;
  createdAt: Date;
}

function toPublicUser(u: {
  id: string;
  email: string;
  fullName: string;
  company: string | null;
  role: string;
  emailVerified: boolean;
  createdAt: Date;
}): PublicUser {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    company: u.company,
    role: u.role,
    emailVerified: u.emailVerified,
    createdAt: u.createdAt,
  };
}

export async function register(input: RegisterInput): Promise<{ user: PublicUser; token: string }> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw AppError.conflict('An account with this email already exists');

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      company: input.company,
      subscription: { create: { plan: 'free' } },
    },
  });

  await prisma.auditLog.create({ data: { userId: user.id, action: 'auth.register' } });

  const token = signToken({ sub: user.id, email: user.email, role: user.role });
  return { user: toPublicUser(user), token };
}

export async function login(input: LoginInput): Promise<{ user: PublicUser; token: string }> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw AppError.unauthorized('Invalid email or password');

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) throw AppError.unauthorized('Invalid email or password');

  await prisma.auditLog.create({ data: { userId: user.id, action: 'auth.login' } });

  const token = signToken({ sub: user.id, email: user.email, role: user.role });
  return { user: toPublicUser(user), token };
}

export async function getMe(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw AppError.notFound('User not found');
  return toPublicUser(user);
}
