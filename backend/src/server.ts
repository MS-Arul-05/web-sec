import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './db/prisma';

async function main() {
  // Verify DB connectivity before accepting traffic.
  await prisma.$connect();

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`🛡️  secure-web API listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received — shutting down...`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
