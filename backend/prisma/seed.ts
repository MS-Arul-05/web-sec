import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@secure-web.app';
  const passwordHash = await bcrypt.hash('Admin@12345', 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      fullName: 'Platform Admin',
      role: 'admin',
      emailVerified: true,
      subscription: { create: { plan: 'enterprise' } },
    },
  });

  console.log(`Seeded admin user: ${email} / Admin@12345`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
