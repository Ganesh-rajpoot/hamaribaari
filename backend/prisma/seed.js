/* eslint-disable no-console */
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { toUTCMidnight } = require('../src/utils/date');

require('dotenv').config();

const prisma = new PrismaClient();

const ADMIN_PWD       = process.env.SEED_ADMIN_PASSWORD       || 'Admin@123';
const RECEPTION_PWD   = process.env.SEED_RECEPTIONIST_PASSWORD|| 'Recept@123';
const DOCTOR_PWD      = process.env.SEED_DOCTOR_PASSWORD      || 'Doctor@123';
const PATIENT_PWD     = process.env.SEED_PATIENT_PASSWORD     || 'Patient@123';

const today = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

async function main() {
  console.log('[seed] starting');

  // Clean (dev only)
  await prisma.auditLog.deleteMany();
  await prisma.queueToken.deleteMany();
  await prisma.oPDSession.deleteMany();
  await prisma.doctorSchedule.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();
  await prisma.hospital.deleteMany();

  const hospital = await prisma.hospital.create({
    data: {
      name: 'Demo City Hospital (FICTIONAL)',
      city: 'Bengaluru',
      address: '123 Demo Street, Bengaluru — FICTIONAL',
      phone: '08000000000',
    },
  });

  const [genMed, ortho, peds] = await Promise.all([
    prisma.department.create({ data: { hospitalId: hospital.id, name: 'General Medicine', code: 'GEN' } }),
    prisma.department.create({ data: { hospitalId: hospital.id, name: 'Orthopaedics',     code: 'ORT' } }),
    prisma.department.create({ data: { hospitalId: hospital.id, name: 'Paediatrics',      code: 'PED' } }),
  ]);

  // Staff users
  const adminHash    = await bcrypt.hash(ADMIN_PWD, 10);
  const receptHash   = await bcrypt.hash(RECEPTION_PWD, 10);
  const doctorHash   = await bcrypt.hash(DOCTOR_PWD, 10);
  const patientHash  = await bcrypt.hash(PATIENT_PWD, 10);
  const superAdminHash = await bcrypt.hash(process.env.SEED_SUPERADMIN_PASSWORD || 'Super@123', 10);

  await prisma.user.create({
    data: {
        fullName: 'Platform Operator',
        mobile: '9000000000',
        passwordHash: superAdminHash,
        role: 'SUPER_ADMIN',
        hospitalId: null,
    },
    });

  await prisma.user.create({
    data: {
      fullName: 'Demo Admin',
      mobile: '9000000001',
      passwordHash: adminHash,
      role: 'HOSPITAL_ADMIN',
      hospitalId: hospital.id,
    },
  });

  await prisma.user.create({
    data: {
      fullName: 'Demo Receptionist',
      mobile: '9000000002',
      passwordHash: receptHash,
      role: 'RECEPTIONIST',
      hospitalId: hospital.id,
    },
  });

  const doctorSeeds = [
    { fullName: 'Dr. Anita Sharma (Demo)',  mobile: '9000000003', dept: genMed, room: 'G-101' },
    { fullName: 'Dr. Ravi Kumar (Demo)',    mobile: '9000000004', dept: ortho,  room: 'O-201' },
    { fullName: 'Dr. Meera Iyer (Demo)',    mobile: '9000000005', dept: peds,   room: 'P-301' },
  ];

  const doctors = [];
  for (const d of doctorSeeds) {
    const u = await prisma.user.create({
      data: {
        fullName: d.fullName, mobile: d.mobile, passwordHash: doctorHash,
        role: 'DOCTOR', hospitalId: hospital.id,
      },
    });
    const profile = await prisma.doctorProfile.create({
      data: {
        userId: u.id,
        hospitalId: hospital.id,
        departmentId: d.dept.id,
        registrationNo: `REG-${d.mobile}`,
        roomNo: d.room,
        avgConsultMinutes: 8,
      },
    });
    // Weekly schedule Mon–Sat 09:00–13:00
    await prisma.doctorSchedule.createMany({
      data: [1,2,3,4,5,6].map((wd) => ({
        doctorId: profile.id,
        weekday: wd,
        startTime: '09:00',
        endTime: '13:00',
        maxCapacity: 40,
      })),
    });
    doctors.push(profile);
  }

  // Today's OPD sessions in different states
//   const sessionDate = today();
  const sessionDate = toUTCMidnight();
  
  const statuses = ['OPEN', 'SCHEDULED', 'UNAVAILABLE'];
  for (let i = 0; i < doctors.length; i++) {
    await prisma.oPDSession.create({
      data: {
        doctorId: doctors[i].id,
        hospitalId: hospital.id,
        sessionDate,
        startTime: '09:00',
        endTime: '13:00',
        status: statuses[i],
        maxCapacity: 40,
        nextTokenNumber: 1,
        openedAt: statuses[i] === 'OPEN' ? new Date() : null,
      },
    });
  }

  // Demo patients
  const patients = [
    { fullName: 'Demo Patient A', mobile: '9111111111' },
    { fullName: 'Demo Patient B', mobile: '9222222222' },
    { fullName: 'Demo Patient C', mobile: '9333333333' },
  ];
  for (const p of patients) {
    await prisma.user.create({
      data: { fullName: p.fullName, mobile: p.mobile, passwordHash: patientHash, role: 'PATIENT' },
    });
  }

  console.log('[seed] done. Demo credentials:');
  console.log('  Admin        : 9000000001 / ' + ADMIN_PWD);
  console.log('  Receptionist : 9000000002 / ' + RECEPTION_PWD);
  console.log('  Doctor 1/2/3 : 9000000003|04|05 / ' + DOCTOR_PWD);
  console.log('  Patients     : 9111111111 / 9222222222 / 9333333333 / ' + PATIENT_PWD);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });