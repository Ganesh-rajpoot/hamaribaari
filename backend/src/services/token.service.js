const prisma = require('../config/prisma');
const {
  badRequest, conflict, notFound, forbidden,
} = require('../utils/errors');

const ACTIVE_STATUSES = ['WAITING', 'CALLED', 'IN_CONSULTATION'];

/* ----------------------------- helpers ----------------------------- */

const isRetryable = (err) => {
  if (!err) return false;
  // Prisma write conflict / deadlock
  if (err.code === 'P2034') return true;
  // Postgres serialization failure
  if (err?.meta?.code === '40001') return true;
  // Deadlock detected
  if (err?.meta?.code === '40P01') return true;
  return false;
};

const withRetry = async (fn, attempts = 3) => {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); }
    catch (e) {
      lastErr = e;
      if (!isRetryable(e) || i === attempts - 1) throw e;
      await new Promise((r) => setTimeout(r, 40 * (i + 1)));
    }
  }
  throw lastErr;
};

/* ------------------------- token generation ------------------------ */

/**
 * Create a token for a session using a row-locked counter.
 * @param {object} p
 * @param {string} p.sessionId
 * @param {string} p.patientId
 * @param {'ONLINE'|'WALK_IN'} p.source
 * @param {string} [p.actorId]            staff user id (for audit)
 * @param {string} [p.hospitalIdExpected] validate ownership (staff flows)
 * @param {string} [p.ip]
 */
const createToken = async ({ sessionId, patientId, source, actorId, hospitalIdExpected, ip }) => {
  return withRetry(() => prisma.$transaction(async (tx) => {
    // 1. Lock the session row.
    const rows = await tx.$queryRaw`
      SELECT id,
             status::text            AS status,
             "maxCapacity"           AS "maxCapacity",
             "bookedCount"           AS "bookedCount",
             "nextTokenNumber"       AS "nextTokenNumber",
             "onlineCutoffTime"      AS "onlineCutoffTime",
             "hospitalId"            AS "hospitalId",
             "sessionDate"           AS "sessionDate",
             "startTime"             AS "startTime",
             "endTime"               AS "endTime"
      FROM "OPDSession"
      WHERE id = ${sessionId}::uuid
      FOR UPDATE
    `;

    if (rows.length === 0) throw notFound('Session not found');
    const session = rows[0];

    // 2. Hospital ownership check for staff-triggered creation.
    if (hospitalIdExpected && session.hospitalId !== hospitalIdExpected) {
      throw forbidden('Cross-hospital access denied');
    }

    // 3. State checks.
    if (session.status !== 'OPEN') {
      throw conflict(`Cannot create token: session is ${session.status}`);
    }
    if (session.bookedCount >= session.maxCapacity) {
      throw conflict('Session has reached maximum capacity');
    }

    if (source === 'ONLINE') {
      // Cutoff check only applies to online bookings.
      if (session.onlineCutoffTime && typeof session.onlineCutoffTime === 'string') {
        // Compare against session start date + cutoff in Asia/Kolkata.
        const now = new Date();
        const [hh, mm] = session.onlineCutoffTime.split(':').map(Number);
        const cutoff = new Date(session.sessionDate);
        cutoff.setUTCHours(hh - 5, mm - 30, 0, 0); // approx IST -> UTC
        if (now > cutoff) {
          throw conflict('Online booking cut-off time has passed');
        }
      }
    }

    // 4. Patient must exist and be a PATIENT.
    const patient = await tx.user.findUnique({
      where: { id: patientId },
      select: { id: true, role: true, isActive: true, hospitalId: true },
    });
    if (!patient || !patient.isActive) throw badRequest('Invalid patient');
    if (patient.role !== 'PATIENT') throw badRequest('Only patients can hold tokens');

    // 5. Fast pre-check (authoritative guard is the partial unique index).
    const existingActive = await tx.queueToken.findFirst({
      where: { sessionId, patientId, status: { in: ACTIVE_STATUSES } },
      select: { id: true, tokenNumber: true, status: true },
    });
    if (existingActive) {
      throw conflict('You already have an active token in this session', {
        tokenId: existingActive.id,
        tokenNumber: existingActive.tokenNumber,
        status: existingActive.status,
      });
    }

    // 6. Create token with the locked next number.
    const token = await tx.queueToken.create({
      data: {
        sessionId,
        patientId,
        tokenNumber: session.nextTokenNumber,
        source,
        status: 'WAITING',
        arrivalStatus: source === 'WALK_IN' ? 'ARRIVED' : 'NOT_ARRIVED',
      },
    });

    // 7. Increment counter atomically (still under row lock).
    await tx.oPDSession.update({
      where: { id: sessionId },
      data: {
        nextTokenNumber: { increment: 1 },
        bookedCount:     { increment: 1 },
      },
    });

    // 8. Audit log.
    await tx.auditLog.create({
      data: {
        actorId: actorId || patientId,
        hospitalId: session.hospitalId,
        action: source === 'WALK_IN' ? 'TOKEN_WALK_IN_CREATE' : 'TOKEN_ONLINE_CREATE',
        entity: 'QueueToken',
        entityId: token.id,
        metadata: { tokenNumber: token.tokenNumber, sessionId, patientId, source },
        ip: ip || null,
      },
    });

    return token;
  }, { isolationLevel: 'ReadCommitted' }));
};

/* --------------------------- queue reads --------------------------- */

const getQueueOrderClause = () => ([
  // Walk-in vs online share one counter, so order is: position asc nulls last, then tokenNumber.
]);

const getSessionQueue = async ({ sessionId, hospitalId }) => {
  const session = await prisma.oPDSession.findUnique({
    where: { id: sessionId },
    select: { id: true, hospitalId: true, status: true, nextTokenNumber: true, maxCapacity: true, bookedCount: true },
  });
  if (!session) throw notFound('Session not found');
  if (hospitalId && session.hospitalId !== hospitalId) throw forbidden('Cross-hospital access denied');

  const tokens = await prisma.queueToken.findMany({
    where: { sessionId },
    orderBy: [
      { position: { sort: 'asc', nulls: 'last' } },
      { tokenNumber: 'asc' },
    ],
    select: {
      id: true, tokenNumber: true, source: true, status: true,
      arrivalStatus: true, position: true,
      calledAt: true, startedAt: true, completedAt: true, createdAt: true,
      patient: { select: { id: true, fullName: true, mobile: true } },
    },
  });

  const currentServing = tokens.find((t) => t.status === 'CALLED' || t.status === 'IN_CONSULTATION') || null;
  const waitingCount = tokens.filter((t) => t.status === 'WAITING').length;

  return { session, tokens, currentServing, waitingCount };
};

const getTokenPublicView = async ({ tokenId, viewerId, viewerRole, viewerHospitalId }) => {
  const token = await prisma.queueToken.findUnique({
    where: { id: tokenId },
    include: {
      session: {
        select: {
          id: true, sessionDate: true, startTime: true, endTime: true,
          status: true, nextTokenNumber: true, bookedCount: true, maxCapacity: true,
          hospitalId: true,
          doctor: { select: { id: true, roomNo: true, avgConsultMinutes: true,
                              user: { select: { fullName: true } },
                              department: { select: { id: true, name: true } } } },
          hospital: { select: { id: true, name: true, city: true, address: true } },
        },
      },
      patient: { select: { id: true, fullName: true, mobile: true } },
    },
  });
  if (!token) throw notFound('Token not found');

  const isOwner = viewerId && viewerId === token.patientId;
  const isStaff = viewerRole && ['RECEPTIONIST', 'DOCTOR', 'HOSPITAL_ADMIN'].includes(viewerRole);
  if (isStaff && viewerHospitalId && token.session.hospitalId !== viewerHospitalId) {
    throw forbidden('Cross-hospital access denied');
  }
  if (!isOwner && !isStaff) throw forbidden('Not allowed');

  // Compute queue-ahead info (safe for all viewers).
  const ahead = await prisma.queueToken.count({
    where: {
      sessionId: token.sessionId,
      status: 'WAITING',
      OR: [
        { position: { lt: token.position ?? 0 } },
        { position: token.position ?? 0, tokenNumber: { lt: token.tokenNumber } },
        { position: null, tokenNumber: { lt: token.tokenNumber } },
      ],
    },
  });

  const currentServing = await prisma.queueToken.findFirst({
    where: { sessionId: token.sessionId, status: { in: ['CALLED', 'IN_CONSULTATION'] } },
    orderBy: { tokenNumber: 'asc' },
    select: { tokenNumber: true, status: true },
  });

  const avg = token.session.doctor?.avgConsultMinutes ?? 8;
  const etaMinutes = token.status === 'WAITING' ? Math.max(0, ahead * avg) : 0;

  const base = {
    id: token.id,
    tokenNumber: token.tokenNumber,
    source: token.source,
    status: token.status,
    arrivalStatus: token.arrivalStatus,
    position: token.position,
    createdAt: token.createdAt,
    calledAt: token.calledAt,
    startedAt: token.startedAt,
    completedAt: token.completedAt,
    session: {
      id: token.session.id,
      sessionDate: token.session.sessionDate,
      startTime: token.session.startTime,
      endTime: token.session.endTime,
      status: token.session.status,
      doctor: token.session.doctor,
      hospital: token.session.hospital,
    },
    currentServingToken: currentServing?.tokenNumber ?? null,
    aheadCount: ahead,
    etaMinutes,
    etaIsEstimate: true,
  };

  // Only owner or staff sees the patient's own PII.
  if (isOwner || isStaff) base.patient = token.patient;
  return base;
};

const listMyTokens = async (patientId) => {
  const tokens = await prisma.queueToken.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true, tokenNumber: true, source: true, status: true, arrivalStatus: true,
      createdAt: true, completedAt: true,
      session: {
        select: {
          id: true, sessionDate: true, startTime: true, endTime: true, status: true,
          doctor: { select: { user: { select: { fullName: true } },
                              department: { select: { name: true } } } },
          hospital: { select: { id: true, name: true, city: true } },
        },
      },
    },
  });
  return tokens;
};

/* ------------------------- queue transitions ------------------------ */

const assertTokenBelongsToSessionHospital = async (tx, tokenId, hospitalId) => {
  const token = await tx.queueToken.findUnique({
    where: { id: tokenId },
    include: { session: { select: { id: true, hospitalId: true, status: true } } },
  });
  if (!token) throw notFound('Token not found');
  if (hospitalId && token.session.hospitalId !== hospitalId) {
    throw forbidden('Cross-hospital access denied');
  }
  return token;
};

const TRANSITIONS = {
  WAITING:         ['CALLED', 'CANCELLED', 'NO_SHOW', 'SKIPPED'],
  CALLED:          ['IN_CONSULTATION', 'SKIPPED', 'NO_SHOW', 'WAITING'], // WAITING = "put at end" or recall
  IN_CONSULTATION: ['COMPLETED', 'SKIPPED'],
  SKIPPED:         ['WAITING', 'CANCELLED', 'NO_SHOW'], // recall or put-at-end
  COMPLETED:       [],
  CANCELLED:       [],
  NO_SHOW:         [],
};

const changeTokenStatus = async ({
  tokenId, hospitalId, actorId, to, reason, ip, extraData = {},
}) => withRetry(() => prisma.$transaction(async (tx) => {
  // Lock token row.
  await tx.$queryRaw`SELECT id FROM "QueueToken" WHERE id = ${tokenId}::uuid FOR UPDATE`;
  const token = await assertTokenBelongsToSessionHospital(tx, tokenId, hospitalId);

  const allowed = TRANSITIONS[token.status] || [];
  if (!allowed.includes(to)) {
    throw conflict(`Illegal token transition ${token.status} → ${to}`);
  }

  const now = new Date();
  const data = { status: to, ...extraData };
  if (to === 'CALLED') data.calledAt = now;
  if (to === 'IN_CONSULTATION') { data.startedAt = now; if (!token.arrivalStatus || token.arrivalStatus === 'NOT_ARRIVED') data.arrivalStatus = 'ARRIVED'; }
  if (to === 'COMPLETED') data.completedAt = now;
  if (to === 'CANCELLED') data.cancelReason = reason || null;

  const updated = await tx.queueToken.update({ where: { id: tokenId }, data });

  await tx.auditLog.create({
    data: {
      actorId, hospitalId: token.session.hospitalId,
      action: `TOKEN_${to}`,
      entity: 'QueueToken', entityId: tokenId,
      metadata: { from: token.status, to, reason: reason || null, ...extraData },
      ip: ip || null,
    },
  });
  return updated;
}));

/* Convenience wrappers */

const markArrived = ({ tokenId, hospitalId, actorId, ip }) =>
  prisma.queueToken.update({
    where: { id: tokenId },
    data: { arrivalStatus: 'ARRIVED' },
  }).then(async (t) => {
    await prisma.auditLog.create({
      data: { actorId, hospitalId, action: 'TOKEN_ARRIVED', entity: 'QueueToken', entityId: tokenId, metadata: {}, ip: ip || null },
    });
    return t;
  });

const callToken      = (p) => changeTokenStatus({ ...p, to: 'CALLED' });
const startToken     = (p) => changeTokenStatus({ ...p, to: 'IN_CONSULTATION' });
const completeToken  = (p) => changeTokenStatus({ ...p, to: 'COMPLETED' });
const skipToken      = (p) => changeTokenStatus({ ...p, to: 'SKIPPED', reason: p.reason });
const noShowToken    = (p) => changeTokenStatus({ ...p, to: 'NO_SHOW', reason: p.reason });
const recallToken    = (p) => changeTokenStatus({ ...p, to: 'WAITING', extraData: { position: null } });

/**
 * Put a token at the end of the queue by assigning an explicit `position`
 * larger than every other position in the session.
 */
const putAtEnd = async ({ tokenId, hospitalId, actorId, ip }) => withRetry(() => prisma.$transaction(async (tx) => {
  await tx.$queryRaw`SELECT id FROM "QueueToken" WHERE id = ${tokenId}::uuid FOR UPDATE`;
  const token = await assertTokenBelongsToSessionHospital(tx, tokenId, hospitalId);

  if (!['WAITING', 'SKIPPED'].includes(token.status)) {
    throw conflict('Only WAITING or SKIPPED tokens can be moved');
  }

  const maxRow = await tx.queueToken.aggregate({
    where: { sessionId: token.sessionId },
    _max: { position: true, tokenNumber: true },
  });
  const nextPosition = (maxRow._max.position ?? maxRow._max.tokenNumber ?? 0) + 1;

  const updated = await tx.queueToken.update({
    where: { id: tokenId },
    data: { status: 'WAITING', position: nextPosition },
  });

  await tx.auditLog.create({
    data: {
      actorId, hospitalId: token.session.hospitalId,
      action: 'TOKEN_PUT_AT_END', entity: 'QueueToken', entityId: tokenId,
      metadata: { position: nextPosition, previousStatus: token.status },
      ip: ip || null,
    },
  });
  return updated;
}));

/**
 * Cancel a token by the patient (owner) — only if WAITING.
 */
const cancelByPatient = async ({ tokenId, patientId, hospitalId, ip }) => withRetry(() => prisma.$transaction(async (tx) => {
  await tx.$queryRaw`SELECT id FROM "QueueToken" WHERE id = ${tokenId}::uuid FOR UPDATE`;
  const token = await tx.queueToken.findUnique({
    where: { id: tokenId },
    include: { session: { select: { id: true, hospitalId: true } } },
  });
  if (!token) throw notFound('Token not found');
  if (token.patientId !== patientId) throw forbidden('Not your token');
  if (token.status !== 'WAITING') throw conflict('Only WAITING tokens can be cancelled by the patient');

  const updated = await tx.queueToken.update({
    where: { id: tokenId },
    data: { status: 'CANCELLED', cancelReason: 'Cancelled by patient' },
  });

  await tx.auditLog.create({
    data: {
      actorId: patientId, hospitalId: token.session.hospitalId,
      action: 'TOKEN_CANCELLED_BY_PATIENT', entity: 'QueueToken', entityId: tokenId,
      ip: ip || null,
    },
  });
  return updated;
}));

module.exports = {
  createToken,
  getSessionQueue,
  getTokenPublicView,
  listMyTokens,
  markArrived,
  callToken,
  startToken,
  completeToken,
  skipToken,
  noShowToken,
  recallToken,
  putAtEnd,
  cancelByPatient,
};