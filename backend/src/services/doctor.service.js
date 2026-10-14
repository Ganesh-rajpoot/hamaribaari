
const prisma = require('../config/prisma');
const { forbidden, notFound, conflict } = require('../utils/errors');
const { toUTCMidnight } = require('../utils/date');
const listSessionsForDoctorOnDate = async (doctorId, dateStr) => {
  const sessionDate = toUTCMidnight(dateStr);   // ← was: new Date(`${dateStr}T00:00:00.000Z`)

  return prisma.oPDSession.findMany({
    where: { doctorId, sessionDate },
    orderBy: { startTime: 'asc' },
    select: {
      id: true, sessionDate: true, startTime: true, endTime: true,
      status: true, maxCapacity: true, bookedCount: true,
      nextTokenNumber: true, onlineCutoffTime: true,
      doctor: { select: { id: true, roomNo: true, user: { select: { fullName: true } } } },
      hospital: { select: { id: true, name: true, city: true } },
    },
  });
};

const getDoctorPublicProfile = async (doctorId) => prisma.doctorProfile.findUnique({
  where: { id: doctorId },
  select: {
    id: true, roomNo: true, avgConsultMinutes: true,
    user: { select: { fullName: true } },
    department: { select: { id: true, name: true, code: true } },
    hospital: { select: { id: true, name: true, city: true } },
  },
});

const createDoctor = async ({ hospitalId, departmentId, fullName, mobile, passwordHash, registrationNo, roomNo, avgConsultMinutes }) => {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { fullName, mobile, passwordHash, role: 'DOCTOR', hospitalId },
    });
    const profile = await tx.doctorProfile.create({
      data: {
        userId: user.id, hospitalId, departmentId,
        registrationNo: registrationNo || null,
        roomNo: roomNo || null,
        avgConsultMinutes: avgConsultMinutes ?? 8,
      },
    });
    return { user, profile };
  });
};

const updateDoctor = async (doctorId, hospitalId, { roomNo, avgConsultMinutes, departmentId }) => {
  const existing = await prisma.doctorProfile.findFirst({ where: { id: doctorId, hospitalId } });
  if (!existing) return null;
  return prisma.doctorProfile.update({
    where: { id: doctorId },
    data: {
      roomNo: roomNo ?? existing.roomNo,
      avgConsultMinutes: avgConsultMinutes ?? existing.avgConsultMinutes,
      departmentId: departmentId ?? existing.departmentId,
    },
  });
};

const listDoctorSchedules = async (doctorId, hospitalId) => {
  const doctor = await prisma.doctorProfile.findFirst({ where: { id: doctorId, hospitalId } });
  if (!doctor) return null;
  return prisma.doctorSchedule.findMany({
    where: { doctorId },
    orderBy: [{ weekday: 'asc' }, { startTime: 'asc' }],
  });
};

const addSchedule = async (doctorId, hospitalId, data) => {
  const doctor = await prisma.doctorProfile.findFirst({ where: { id: doctorId, hospitalId } });
  if (!doctor) return null;
  return prisma.doctorSchedule.create({ data: { doctorId, ...data } });
};

const deleteSchedule = async (scheduleId, hospitalId) => {
  const schedule = await prisma.doctorSchedule.findUnique({
    where: { id: scheduleId },
    include: { doctor: true },
  });
  if (!schedule || schedule.doctor.hospitalId !== hospitalId) return false;
  await prisma.doctorSchedule.delete({ where: { id: scheduleId } });
  return true;
};

/* ================= Phase 4 additions ================= */

/**
 * Resolve the DoctorProfile for the logged-in user. Never trust client-supplied IDs.
 */
const getMyProfile = async (userId) => {
  const profile = await prisma.doctorProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      hospitalId: true,
      departmentId: true,
      roomNo: true,
      avgConsultMinutes: true,
      user: { select: { id: true, fullName: true, mobile: true } },
      hospital: { select: { id: true, name: true, city: true } },
      department: { select: { id: true, name: true, code: true } },
    },
  });
  if (!profile) throw notFound('Doctor profile not found');
  return profile;
};

// const getTodaySessionsForMe = async (doctorProfileId) => {
//   const start = new Date(); start.setHours(0, 0, 0, 0);
//   return prisma.oPDSession.findMany({
//     where: { doctorId: doctorProfileId, sessionDate: start },
//     orderBy: { startTime: 'asc' },
//     select: {
//       id: true, startTime: true, endTime: true, status: true,
//       maxCapacity: true, bookedCount: true, nextTokenNumber: true,
//     },
//   });
// };


const getTodaySessionsForMe = async (doctorProfileId) => {
  const today = toUTCMidnight();
  return prisma.oPDSession.findMany({
    where: { doctorId: doctorProfileId, sessionDate: today },
    orderBy: { startTime: 'asc' },
    select: {
      id: true, startTime: true, endTime: true, status: true,
      maxCapacity: true, bookedCount: true, nextTokenNumber: true,
    },
  });
};

/**
 * Determine the doctor's "active" session today, if any.
 * Preference order: OPEN > PAUSED > SCHEDULED. Ignores CLOSED/CANCELLED/UNAVAILABLE.
 */
const pickActiveSession = (sessions) => {
  const order = { OPEN: 0, PAUSED: 1, SCHEDULED: 2 };
  const eligible = sessions.filter((s) => s.status in order);
  eligible.sort((a, b) => order[a.status] - order[b.status]);
  return eligible[0] || null;
};

const getMyQueue = async (doctorProfileId) => {
  const sessions = await getTodaySessionsForMe(doctorProfileId);
  const active = pickActiveSession(sessions);
  if (!active) {
    return { session: null, tokens: [], currentServing: null, waitingCount: 0, nextUp: [] };
  }
  const tokens = await prisma.queueToken.findMany({
    where: { sessionId: active.id },
    orderBy: [
      { position: { sort: 'asc', nulls: 'last' } },
      { tokenNumber: 'asc' },
    ],
    select: {
      id: true, tokenNumber: true, source: true, status: true,
      arrivalStatus: true, position: true,
      calledAt: true, startedAt: true, completedAt: true,
      patient: { select: { id: true, fullName: true, mobile: true } },
    },
  });
  const currentServing = tokens.find((t) => ['CALLED', 'IN_CONSULTATION'].includes(t.status)) || null;
  const waitingCount = tokens.filter((t) => t.status === 'WAITING').length;
  const nextUp = tokens.filter((t) => t.status === 'WAITING').slice(0, 5);
  return { session: active, tokens, currentServing, waitingCount, nextUp };
};

/**
 * Doctor-scoped token action. Only permits CALLED → IN_CONSULTATION,
 * IN_CONSULTATION → COMPLETED, and (CALLED|IN_CONSULTATION) → SKIPPED.
 * Verifies the token's session belongs to this doctor.
 */
const doctorTokenAction = async ({
  tokenId, doctorProfileId, to, reason, ip,
}) => {
  const allowed = {
    start:    { from: ['CALLED'],                              to: 'IN_CONSULTATION' },
    complete: { from: ['IN_CONSULTATION'],                     to: 'COMPLETED' },
    skip:     { from: ['CALLED', 'IN_CONSULTATION'],           to: 'SKIPPED' },
  }[to === 'IN_CONSULTATION' ? 'start' : to === 'COMPLETED' ? 'complete' : 'skip'];

  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "QueueToken" WHERE id = ${tokenId}::uuid FOR UPDATE`;

    const token = await tx.queueToken.findUnique({
      where: { id: tokenId },
      include: {
        session: {
          select: { id: true, doctorId: true, hospitalId: true, status: true },
        },
      },
    });
    if (!token) throw notFound('Token not found');
    if (token.session.doctorId !== doctorProfileId) {
      throw forbidden('Not your session');
    }
    if (!allowed.from.includes(token.status)) {
      throw conflict(`Illegal doctor transition ${token.status} → ${allowed.to}`);
    }
    if (allowed.to === 'SKIPPED' && (!reason || !reason.trim())) {
      throw conflict('Reason required to skip');
    }

    const now = new Date();
    const data = { status: allowed.to };
    if (allowed.to === 'IN_CONSULTATION') { data.startedAt = now; data.arrivalStatus = 'ARRIVED'; }
    if (allowed.to === 'COMPLETED') data.completedAt = now;
    if (allowed.to === 'SKIPPED') data.cancelReason = reason.trim();

    const updated = await tx.queueToken.update({ where: { id: tokenId }, data });

    await tx.auditLog.create({
      data: {
        actorId: null, hospitalId: token.session.hospitalId,
        action: `DOCTOR_TOKEN_${allowed.to}`,
        entity: 'QueueToken', entityId: tokenId,
        metadata: {
          from: token.status, to: allowed.to,
          reason: reason || null,
          doctorProfileId,
        },
        ip: ip || null,
      },
    });
    return updated;
  });
};

module.exports = {
  // Phase 2
  listSessionsForDoctorOnDate,
  getDoctorPublicProfile,
  createDoctor,
  updateDoctor,
  listDoctorSchedules,
  addSchedule,
  deleteSchedule,
  // Phase 4
  getMyProfile,
  getTodaySessionsForMe,
  getMyQueue,
  doctorTokenAction,
};