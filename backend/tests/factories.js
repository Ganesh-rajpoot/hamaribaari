const bcrypt = require('bcryptjs');
const prisma = require('../src/config/prisma');
const { toUTCMidnight } = require('../src/utils/date');

const PWD = 'Password123';

const hash = (p) => bcrypt.hash(p, 10);

const makeHospital = (over = {}) => prisma.hospital.create({
  data: { name: 'Test Hospital', city: 'Bengaluru', ...over },
});

const makeUser = async ({ role = 'PATIENT', hospitalId = null, mobile, fullName = 'Test User', password = PWD }) => {
  return prisma.user.create({
    data: { fullName, mobile, passwordHash: await hash(password), role, hospitalId },
  });
};

const makeDepartment = (hospitalId, code = 'GEN') =>
  prisma.department.create({ data: { hospitalId, name: `Dept ${code}`, code } });

const makeDoctor = async ({ hospitalId, departmentId, mobile }) => {
  const user = await makeUser({ role: 'DOCTOR', hospitalId, mobile, fullName: 'Dr. Test' });
  const profile = await prisma.doctorProfile.create({
    data: { userId: user.id, hospitalId, departmentId, avgConsultMinutes: 5 },
  });
  return { user, profile };
};


const makeSession = (hospitalId, doctorId, over = {}) => prisma.oPDSession.create({
  data: {
    hospitalId, doctorId,
    sessionDate: toUTCMidnight(),   // ← was: (() => { const d = new Date(); d.setHours(0,0,0,0); return d; })()
    startTime: '09:00',
    endTime: '13:00',
    status: 'OPEN',
    sessionDate: toUTCMidnight(),
    maxCapacity: 40,
    nextTokenNumber: 1,
    ...over,
  },
});
module.exports = {
  PWD, hash,
  makeHospital, makeUser, makeDepartment, makeDoctor, makeSession,
};