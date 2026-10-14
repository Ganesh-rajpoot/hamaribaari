const service = require('../services/hospital.service');
const doctorService = require('../services/doctor.service');
const { notFound, badRequest } = require('../utils/errors');

const list = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim() || undefined;
    const data = await service.listHospitals({ q });
    return res.json({ hospitals: data });
  } catch (e) { return next(e); }
};

const getById = async (req, res, next) => {
  try {
    const h = await service.getHospital(req.params.id);
    if (!h) throw notFound('Hospital not found');
    return res.json({ hospital: h });
  } catch (e) { return next(e); }
};

const departments = async (req, res, next) => {
  try {
    return res.json({ departments: await service.listDepartments(req.params.id) });
  } catch (e) { return next(e); }
};

const doctors = async (req, res, next) => {
  try {
    return res.json({ doctors: await service.listDoctors(req.params.id) });
  } catch (e) { return next(e); }
};

const doctorSessions = async (req, res, next) => {
  try {
    const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
    const profile = await doctorService.getDoctorPublicProfile(req.params.id);
    if (!profile) throw notFound('Doctor not found');
    const sessions = await doctorService.listSessionsForDoctorOnDate(req.params.id, dateStr);
    return res.json({ doctor: profile, date: dateStr, sessions });
  } catch (e) { return next(e); }
};

module.exports = { list, getById, departments, doctors, doctorSessions };