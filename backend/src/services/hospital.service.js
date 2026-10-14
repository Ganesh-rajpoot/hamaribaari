const prisma = require('../config/prisma');

const listHospitals = async ({ q }) => {
  const where = { status: 'ACTIVE' };      // ← filter
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { city: { contains: q, mode: 'insensitive' } },
    ];
  }
  return prisma.hospital.findMany({
    where,
    orderBy: { name: 'asc' },
    select: { id: true, name: true, city: true, address: true, phone: true },
  });
};


const getHospital = async (id) => {
  const hospital = await prisma.hospital.findFirst({
    where: { id, status: 'ACTIVE' },        // ← filter
    select: {
      id: true, name: true, city: true, address: true, phone: true,
      departments: { select: { id: true, name: true, code: true } },
    },
  });
  return hospital;
};

const listDepartments = (hospitalId) =>
  prisma.department.findMany({
    where: { hospitalId },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, code: true },
  });

const listDoctors = (hospitalId) =>
  prisma.doctorProfile.findMany({
    where: { hospitalId },
    orderBy: { user: { fullName: 'asc' } },
    select: {
      id: true,
      roomNo: true,
      avgConsultMinutes: true,
      user: { select: { id: true, fullName: true } },
      department: { select: { id: true, name: true, code: true } },
    },
  });

const updateHospital = async (id, data) =>
  prisma.hospital.update({
    where: { id },
    data,
    select: { id: true, name: true, city: true, address: true, phone: true },
  });

module.exports = {
  listHospitals, getHospital, listDepartments, listDoctors, updateHospital,
};