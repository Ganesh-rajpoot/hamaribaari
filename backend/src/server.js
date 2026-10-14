const app = require('./app');
const { PORT, NODE_ENV } = require('./config/env');
const prisma = require('./config/prisma');

const start = async () => {
  try {
    await prisma.$connect();
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`[server] listening on http://localhost:${PORT} (${NODE_ENV})`);
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[server] failed to start', e);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  // eslint-disable-next-line no-console
  console.log(`[server] ${signal} received, shutting down`);
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start();