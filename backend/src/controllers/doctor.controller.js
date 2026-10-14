const doctorService = require('../services/doctor.service');
const { badRequest } = require('../utils/errors');

const today = async (req, res, next) => {
  try {
    const profile = await doctorService.getMyProfile(req.user.id);
    const sessions = await doctorService.getTodaySessionsForMe(profile.id);
    return res.json({ profile, sessions });
  } catch (e) { return next(e); }
};

const queue = async (req, res, next) => {
  try {
    const profile = await doctorService.getMyProfile(req.user.id);
    const data = await doctorService.getMyQueue(profile.id);
    return res.json({ profile, ...data });
  } catch (e) { return next(e); }
};

const wrap = (to) => async (req, res, next) => {
  try {
    const profile = await doctorService.getMyProfile(req.user.id);
    const updated = await doctorService.doctorTokenAction({
      tokenId: req.params.id,
      doctorProfileId: profile.id,
      to,
      reason: req.body?.reason,
      ip: req.ip,
    });
    return res.json({ token: updated });
  } catch (e) { return next(e); }
};

module.exports = { today, queue, start: wrap('IN_CONSULTATION'), complete: wrap('COMPLETED'), skip: wrap('SKIPPED') };