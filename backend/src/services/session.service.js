const prisma = require('../config/prisma');
const { toUTCMidnight, utcWeekday, toDateString } = require('../utils/date');


const { badRequest, conflict, notFound, forbidden } = require('../utils/errors');

// Allowed transitions map.
const TRANSITIONS = {
  SCHEDULED:   ['OPEN', 'UNAVAILABLE', 'CANCELLED'],
  OPEN:        ['PAUSED', 'CLOSED', 'UNAVAILABLE', 'CANCELLED'],
  PAUSED:      ['OPEN', 'CLOSED', 'CANCELLED'],
  UNAVAILABLE: ['SCHEDULED', 'CANCELLED'],
  CLOSED:      [],
  CANCELLED:   [],
};

const assertTransition = (from, to) => {
  const allowed = TRANSITIONS[from] || [];
  if (!allowed.includes(to)) {
    throw conflict(`Illegal session transition ${from} → ${to}`);
  }
};

// Ownership check helper
const findOwnedSession = async (sessionId, hospitalId) => {
  const session = await prisma.oPDSession.findUnique({
    where: { id: sessionId },
    include: {
      doctor: { select: { id: true, user: { select: { fullName: true } } } },
      hospital: { select: { id: true, name: true } },
    },
  });
  if (!session) throw notFound('Session not found');
  if (session.hospitalId !== hospitalId) throw forbidden('Cross-hospital access denied');
  return session;
};

const changeStatus = async ({ sessionId, hospitalId, actorId, to, reason, ip }) => {
  return prisma.$transaction(async (tx) => {
    // Lock row to avoid concurrent state races.
    const rows = await tx.$queryRaw`
      SELECT id, status FROM "OPDSession" WHERE id = ${sessionId}::uuid FOR UPDATE
    `;
    if (!rows.length) throw notFound('Session not found');

    const session = await tx.oPDSession.findUnique({
      where: { id: sessionId },
      include: {
        doctor: { select: { id: true, user: { select: { fullName: true } } } },
      },
    });
    if (session.hospitalId !== hospitalId) throw forbidden('Cross-hospital access denied');

    assertTransition(session.status, to);

    if (to === 'CANCELLED' && (!reason || !reason.trim())) {
      throw badRequest('Cancellation reason is required');
    }

    const data = { status: to };
    if (to === 'OPEN' && !session.openedAt) data.openedAt = new Date();
    if (to === 'CLOSED') data.closedAt = new Date();
    if (to === 'CANCELLED') { data.cancelReason = reason.trim(); data.closedAt = new Date(); }

    const updated = await tx.oPDSession.update({ where: { id: sessionId }, data });

    await tx.auditLog.create({
      data: {
        actorId: actorId || null,
        hospitalId,
        action: `SESSION_${to}`,
        entity: 'OPDSession',
        entityId: sessionId,
        metadata: { from: session.status, to, reason: reason || null },
        ip: ip || null,
      },
    });

    return updated;
  });
};

const getSessionWithQueueMeta = async (sessionId, hospitalId) => {
  const session = await findOwnedSession(sessionId, hospitalId);

  const [waitingCount, currentToken] = await Promise.all([
    prisma.queueToken.count({
      where: { sessionId, status: 'WAITING' },
    }),
    prisma.queueToken.findFirst({
      where: { sessionId, status: { in: ['CALLED', 'IN_CONSULTATION'] } },
      orderBy: { tokenNumber: 'asc' },
      select: { id: true, tokenNumber: true, status: true },
    }),
  ]);

  return { session, waitingCount, currentToken };
};

// const listTodayForHospital = async (hospitalId) => {
//   const start = new Date(); start.setHours(0, 0, 0, 0);
//   const sessions = await prisma.oPDSession.findMany({
//     where: { hospitalId, sessionDate: start },
//     orderBy: [{ startTime: 'asc' }],
//     include: {
//       doctor: { select: { id: true, roomNo: true, user: { select: { fullName: true } }, department: { select: { id: true, name: true, code: true } } } },
//     },
//   });

//   // Attach waitingCount + currentToken for each.
//   const withMeta = await Promise.all(sessions.map(async (s) => {
//     const [waitingCount, currentToken] = await Promise.all([
//       prisma.queueToken.count({ where: { sessionId: s.id, status: 'WAITING' } }),
//       prisma.queueToken.findFirst({
//         where: { sessionId: s.id, status: { in: ['CALLED', 'IN_CONSULTATION'] } },
//         orderBy: { tokenNumber: 'asc' },
//         select: { tokenNumber: true, status: true },
//       }),
//     ]);
//     return { ...s, waitingCount, currentToken };
//   }));
//   return withMeta;
// };




const listTodayForHospital = async (hospitalId) => {
  const today = toUTCMidnight();   // ← was: `new Date(); start.setHours(0,0,0,0)`

  const sessions = await prisma.oPDSession.findMany({
    where: { hospitalId, sessionDate: today },
    orderBy: [{ startTime: 'asc' }],
    include: {
      doctor: {
        select: {
          id: true, roomNo: true,
          user: { select: { fullName: true } },
          department: { select: { id: true, name: true, code: true } },
        },
      },
    },
  });

  const withMeta = await Promise.all(sessions.map(async (s) => {
    const [waitingCount, currentToken] = await Promise.all([
      prisma.queueToken.count({ where: { sessionId: s.id, status: 'WAITING' } }),
      prisma.queueToken.findFirst({
        where: { sessionId: s.id, status: { in: ['CALLED', 'IN_CONSULTATION'] } },
        orderBy: { tokenNumber: 'asc' },
        select: { tokenNumber: true, status: true },
      }),
    ]);
    return { ...s, waitingCount, currentToken };
  }));

  return withMeta;
};

/**
 * Materialize today's sessions for a hospital from active schedules.
 * Idempotent: unique (doctorId, sessionDate) prevents duplicates.
 */



// const ensureTodaySessions = async (hospitalId, actorId) => {
//   const today = new Date(); today.setHours(0, 0, 0, 0);
// // Stored as a `Date` → Postgres `date` column.
//   const weekday = today.getDay(); // 0..6

//   const schedules = await prisma.doctorSchedule.findMany({
//     where: {
//       isActive: true,
//       weekday,
//       doctor: { hospitalId },
//     },
//     include: { doctor: true },
//   });

//   let created = 0;
//   for (const s of schedules) {
//     const exists = await prisma.oPDSession.findUnique({
//       where: { doctorId_sessionDate: { doctorId: s.doctorId, sessionDate: today } },
//     });
//     if (exists) continue;
//     await prisma.oPDSession.create({
//       data: {
//         doctorId: s.doctorId,
//         hospitalId: s.doctor.hospitald,
//         sessionDate: today,
//         startTime: s.startTime,
//         endTime: s.endTime,
//         status: 'SCHEDULED',
//         maxCapacity: s.maxCapacity,
//         nextTokenNumber: 1,
//       },
//     });
//     created++;
//   }

//   await prisma.auditLog.create({
//     data: {
//       actorId: actorId || null,
//       hospitalId,
//       action: 'SESSIONS_ENSURE',
//       entity: 'OPDSession',
//       metadata: { date: today.toISOString().slice(0, 10), created },
//     },
//   });

//   return { created };
// };



const ensureTodaySessions = async (hospitalId, actorId) => {
  const today = toUTCMidnight();       // ← UTC midnight of the local calendar day
  const weekday = utcWeekday(today);   // ← matches the schedule's weekday field

  const schedules = await prisma.doctorSchedule.findMany({
    where: {
      isActive: true,
      weekday,
      doctor: { hospitalId },
    },
    include: { doctor: true },
  });

  let created = 0;
  for (const s of schedules) {
    const exists = await prisma.oPDSession.findUnique({
      where: {
        doctorId_sessionDate: { doctorId: s.doctorId, sessionDate: today },
      },
    });
    if (exists) continue;

    await prisma.oPDSession.create({
      data: {
        doctorId: s.doctorId,
        hospitalId: s.doctor.hospitalId,
        sessionDate: today,               // ← stored as UTC midnight
        startTime: s.startTime,
        endTime: s.endTime,
        status: 'SCHEDULED',
        maxCapacity: s.maxCapacity,
        nextTokenNumber: 1,
      },
    });
    created++;
  }

  await prisma.auditLog.create({
    data: {
      actorId: actorId || null,
      hospitalId,
      action: 'SESSIONS_ENSURE',
      entity: 'OPDSession',
      metadata: { date: toDateString(today), weekday, created, matchedSchedules: schedules.length },
    },
  });

  return { created, weekday, matchedSchedules: schedules.length };
};

module.exports = {
  changeStatus,
  getSessionWithQueueMeta,
  listTodayForHospital,
  ensureTodaySessions,
  findOwnedSession,
  TRANSITIONS,
};