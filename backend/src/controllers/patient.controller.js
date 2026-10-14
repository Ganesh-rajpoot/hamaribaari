const tokenService = require('../services/token.service');
const { badRequest } = require('../utils/errors');

const joinQueue = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const token = await tokenService.createToken({
        sessionId,
        patientId: req.user.id,
        source: 'ONLINE',
        actorId: req.user.id,
        ip: req.ip,
        });
    return res.status(201).json({ token });
  } catch (e) { return next(e); }
};

const myTokens = async (req, res, next) => {
  try {
    return res.json({ tokens: await tokenService.listMyTokens(req.user.id) });
  } catch (e) { return next(e); }
};

const getToken = async (req, res, next) => {
  try {
    const view = await tokenService.getTokenPublicView({
      tokenId: req.params.id,
      viewerId: req.user.id,
      viewerRole: req.user.role,
      viewerHospitalId: req.user.hospitalId,
    });
    return res.json({ token: view });
  } catch (e) { return next(e); }
};

const cancelToken = async (req, res, next) => {
  try {
    const token = await tokenService.cancelByPatient({
      tokenId: req.params.id,
      patientId: req.user.id,
      ip: req.ip,
    });
    return res.json({ token });
  } catch (e) { return next(e); }
};

module.exports = { joinQueue, myTokens, getToken, cancelToken };