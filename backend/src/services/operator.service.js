const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { conflict, notFound, badRequest } = require('../utils/errors');

const listHospitals = async ({ q, status }) => {
  const where = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { city: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (status) where.status = status;

  const hospitals = await prisma.hospital.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, city: true, address: true, phone: true,
      status: true, createdAt: true,
      _count: {
        select: { departments: true, doctors: true, users: true, sessions: true },
      },
    },
  });
  return hospitals;
};

const getHospitalDetail = async (id) => {
  const h = await prisma.hospital.findUnique({
    where: { id },
    include: {
      departments: { select: { id: true, name: true, code: true } },
      users: {
        where: { role: { in: ['HOSPITAL_ADMIN', 'RECEPTIONIST', 'DOCTOR'] } },
        select: { id: true, fullName: true, mobile: true, role: true, isActive: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      },
      _count: {
        select: { departments: true, doctors: true, users: true, sessions: true },
      },
    },
  });
  if (!h) throw notFound('Hospital not found');
  return h;
};

/**
 * Create a hospital AND its first hospital admin in one transaction.
 * Returns the new hospital + admin (with plaintext password ONLY in the response
 * so the operator can hand it over — never logged, never stored).
 */
const createHospitalWithAdmin = async ({
  name, city, address, phone,
  adminFullName, adminMobile, adminPassword,
  actorId, ip,
}) => {
  const existingUser = await prisma.user.findUnique({ where: { mobile: adminMobile } });
  if (existingUser) throw conflict('Admin mobile already registered');

  const existingHospital = await prisma.hospital.findFirst({ where: { name, city } });
  if (existingHospital) throw conflict('A hospital with this name and city already exists');

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  return prisma.$transaction(async (tx) => {
    const hospital = await tx.hospital.create({
      data: { name, city, address: address || null, phone: phone || null, status: 'ACTIVE' },
    });

    const admin = await tx.user.create({
      data: {
        fullName: adminFullName,
        mobile: adminMobile,
        passwordHash,
        role: 'HOSPITAL_ADMIN',
        hospitalId: hospital.id,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId,
        hospitalId: hospital.id,
        action: 'OPERATOR_HOSPITAL_CREATE',
        entity: 'Hospital',
        entityId: hospital.id,
        metadata: { name, city, adminMobile, adminFullName },
        ip: ip || null,
      },
    });

    return { hospital, admin };
  });
};

const updateHospital = async (id, data, actorId, ip) => {
  const existing = await prisma.hospital.findUnique({ where: { id } });
  if (!existing) throw notFound('Hospital not found');

  const updated = await prisma.hospital.update({
    where: { id },
    data: {
      name: data.name ?? existing.name,
      city: data.city ?? existing.city,
      address: data.address ?? existing.address,
      phone: data.phone ?? existing.phone,
      status: data.status ?? existing.status,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId, hospitalId: id,
      action: 'OPERATOR_HOSPITAL_UPDATE',
      entity: 'Hospital', entityId: id,
      metadata: { fields: Object.keys(data) },
      ip: ip || null,
    },
  });

  return updated;
};

const setHospitalStatus = async (id, status, actorId, ip) => {
  if (!['PENDING', 'ACTIVE', 'SUSPENDED'].includes(status)) {
    throw badRequest('Invalid hospital status');
  }
  return updateHospital(id, { status }, actorId, ip);
};

/**
 * Create additional admin/staff for a specific hospital.
 * Operator can add receptionists, doctors, or extra hospital admins.
 */
const createStaffForHospital = async ({
  hospitalId, fullName, mobile, password, role, actorId, ip,
}) => {

  if (!['HOSPITAL_ADMIN', 'RECEPTIONIST'].includes(role)) {
    throw badRequest('Role must be HOSPITAL_ADMIN or RECEPTIONIST (doctors require a department)');
  }
  const hospital = await prisma.hospital.findUnique({ where: { id: hospitalId } });
  if (!hospital) throw notFound('Hospital not found');
  
  const existing = await prisma.user.findUnique({ where: { mobile } });
  if (existing) throw conflict('Mobile already registered');

  const passwordHash = await bcrypt.hash(password, 10);
  if (hospital.status !== 'ACTIVE') {
    throw badRequest(`Cannot add staff to a ${hospital.status.toLowerCase()} hospital`);
    }

  const user = await prisma.user.create({
    data: { fullName, mobile, passwordHash, role, hospitalId },
    select: { id: true, fullName: true, mobile: true, role: true, hospitalId: true },
  });

  await prisma.auditLog.create({
    data: {
      actorId, hospitalId,
      action: 'OPERATOR_STAFF_CREATE',
      entity: 'User', entityId: user.id,
      metadata: { role, mobile },
      ip: ip || null,
    },
  });

  return user;
};

/**
 * Reset any user's password. Super admin only.
 * Returns the plaintext password so the operator can deliver it.
 */
const resetUserPassword = async ({ userId, newPassword, actorId, ip }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw notFound('User not found');
  if (user.role === 'SUPER_ADMIN') throw badRequest('Cannot reset another operator\'s password via this route');

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  await prisma.auditLog.create({
    data: {
      actorId, hospitalId: user.hospitalId,
      action: 'OPERATOR_PASSWORD_RESET',
      entity: 'User', entityId: userId,
      metadata: { role: user.role, mobile: user.mobile },
      ip: ip || null,
    },
  });
};

const toggleUserActive = async ({ userId, isActive, actorId, ip }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw notFound('User not found');
  if (user.role === 'SUPER_ADMIN') throw badRequest('Cannot disable another operator');

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: { id: true, fullName: true, mobile: true, role: true, isActive: true },
  });

  await prisma.auditLog.create({
    data: {
      actorId, hospitalId: user.hospitalId,
      action: isActive ? 'OPERATOR_USER_ENABLE' : 'OPERATOR_USER_DISABLE',
      entity: 'User', entityId: userId,
      ip: ip || null,
    },
  });

  return updated;
};

const platformStats = async () => {
  const [hospitals, activeHospitals, users, doctors, sessions, tokens] = await Promise.all([
    prisma.hospital.count(),
    prisma.hospital.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count(),
    prisma.doctorProfile.count(),
    prisma.oPDSession.count(),
    prisma.queueToken.count(),
  ]);
  const tokensToday = await prisma.queueToken.count({
    where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
  });
  return { hospitals, activeHospitals, users, doctors, sessions, tokens, tokensToday };
};

module.exports = {
  listHospitals,
  getHospitalDetail,
  createHospitalWithAdmin,
  updateHospital,
  setHospitalStatus,
  createStaffForHospital,
  resetUserPassword,
  toggleUserActive,
  platformStats,
};