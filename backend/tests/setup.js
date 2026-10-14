// const prisma = require('../src/config/prisma');

// const { FRONTEND_URL, NODE_ENV } = require('./config/env');
// const isTest = NODE_ENV === 'test' || process.env.NODE_ENV === 'test';


// beforeEach(async () => {
//   // Truncate all tables in dependency-safe order.
//   await prisma.auditLog.deleteMany();
//   await prisma.queueToken.deleteMany();
//   await prisma.oPDSession.deleteMany();
//   await prisma.doctorSchedule.deleteMany();
//   await prisma.doctorProfile.deleteMany();
//   await prisma.department.deleteMany();
//   await prisma.user.deleteMany();
//   await prisma.hospital.deleteMany();
// });

// afterAll(async () => {
//   await prisma.$disconnect();
// });


process.env.NODE_ENV = 'test';   // FIRST LINE

const prisma = require('../src/config/prisma');

beforeEach(async () => {
  await prisma.auditLog.deleteMany();
  await prisma.queueToken.deleteMany();
  await prisma.oPDSession.deleteMany();
  await prisma.doctorSchedule.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();
  await prisma.hospital.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});