/* eslint-disable no-console */
const prisma = require('../src/config/prisma');

module.exports = async () => {
  console.log('[jest] disconnecting prisma');
  await prisma.$disconnect();
};