const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const sessionService = require('../services/session.service');
const tokenService = require('../services/token.service');
const { badRequest, notFound, conflict } = require('../utils/errors');

/* ---------- existing (Phase 2) ---------- */
const today = async (req, res, next) => {
  try {
    const sessions = await sessionService.listTodayForHospital(req.user.hospitalId);
    return res.json({ sessions });
  } catch (e) { return next(e); }
};

const getSession = async (req, res, next) => {
  try {
    const { session, waitingCount, currentToken } = await sessionService.getSessionWithQueueMeta(
      req.params.id, req.user.hospitalId
    );
    return res.json({ session, waitingCount, currentToken });
  } catch (e) { return next(e); }
};

const makeStatusHandler = (to) => async (req, res, next) => {
  try {
    const updated = await sessionService.changeStatus({
      sessionId: req.params.id,
      hospitalId: req.user.hospitalId,
      actorId: req.user.id,
      to,
      reason: req.body?.reason,
      ip: req.ip,
    });
    return res.json({ session: updated });
  } catch (e) { return next(e); }
};

/* ---------- NEW: queue reads ---------- */
const getQueue = async (req, res, next) => {
  try {
    const data = await tokenService.getSessionQueue({
      sessionId: req.params.id,
      hospitalId: req.user.hospitalId,
    });
    return res.json(data);
  } catch (e) { return next(e); }
};

/* ---------- NEW: walk-in token ---------- */
const createWalkIn = async (req, res, next) => {
  try {
    const { patientName, patientMobile } = req.body;
    if (!patientName || !patientMobile) throw badRequest('patientName and patientMobile required');

    // Find or create the patient by mobile.
    let patient = await prisma.user.findUnique({ where: { mobile: patientMobile } });
    if (patient) {
      if (patient.role !== 'PATIENT') throw conflict('Mobile belongs to a non-patient account');
    } else {
      // Walk-ins don't have a password; store a disabled hash so login is impossible.
      const passwordHash = await bcrypt.hash(Math.random().toString(36) + Date.now(), 10);
      patient = await prisma.user.create({
        data: { fullName: patientName, mobile: patientMobile, passwordHash, role: 'PATIENT' },
      });
    }

    const token = await tokenService.createToken({
      sessionId: req.params.id,
      patientId: patient.id,
      source: 'WALK_IN',
      actorId: req.user.id,
      hospitalIdExpected: req.user.hospitalId,
      ip: req.ip,
    });
    return res.status(201).json({ token, patient: { id: patient.id, fullName: patient.fullName, mobile: patient.mobile } });
  } catch (e) { return next(e); }
};

/* ---------- NEW: token actions ---------- */
const wrapTokenAction = (svc) => async (req, res, next) => {
  try {
    const updated = await svc({
      tokenId: req.params.id,
      hospitalId: req.user.hospitalId,
      actorId: req.user.id,
      reason: req.body?.reason,
      ip: req.ip,
    });
    return res.json({ token: updated });
  } catch (e) { return next(e); }
};

module.exports = {
  today, getSession,
  open:        makeStatusHandler('OPEN'),
  pause:       makeStatusHandler('PAUSED'),
  resume:      makeStatusHandler('OPEN'),
  close:       makeStatusHandler('CLOSED'),
  unavailable: makeStatusHandler('UNAVAILABLE'),
  cancel:      makeStatusHandler('CANCELLED'),

  getQueue,
  createWalkIn,
  arrive:   wrapTokenAction(tokenService.markArrived),
  call:     wrapTokenAction(tokenService.callToken),
  start:    wrapTokenAction(tokenService.startToken),
  complete: wrapTokenAction(tokenService.completeToken),
  skip:     wrapTokenAction(tokenService.skipToken),
  recall:   wrapTokenAction(tokenService.recallToken),
  putAtEnd: wrapTokenAction(tokenService.putAtEnd),
  noShow:   wrapTokenAction(tokenService.noShowToken),
};