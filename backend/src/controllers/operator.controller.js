const svc = require('../services/operator.service');
const { badRequest } = require('../utils/errors');

const listHospitals = async (req, res, next) => {
  try {
    const { q, status } = req.query;
    return res.json({ hospitals: await svc.listHospitals({ q, status }) });
  } catch (e) { return next(e); }
};

const getHospital = async (req, res, next) => {
  try {
    return res.json({ hospital: await svc.getHospitalDetail(req.params.id) });
  } catch (e) { return next(e); }
};

const createHospital = async (req, res, next) => {
  try {
    const {
      name, city, address, phone,
      adminFullName, adminMobile, adminPassword,
    } = req.body;

    const result = await svc.createHospitalWithAdmin({
      name, city, address, phone,
      adminFullName, adminMobile, adminPassword,
      actorId: req.user.id,
      ip: req.ip,
    });

    // Return the credentials once so the operator can hand them to the hospital admin.
    return res.status(201).json({
      hospital: {
        id: result.hospital.id,
        name: result.hospital.name,
        city: result.hospital.city,
        status: result.hospital.status,
      },
      admin: {
        id: result.admin.id,
        fullName: result.admin.fullName,
        mobile: result.admin.mobile,
        // password NOT returned — operator already knows it (they just typed it)
      },
    });
  } catch (e) { return next(e); }
};

const patchHospital = async (req, res, next) => {
  try {
    const updated = await svc.updateHospital(req.params.id, req.body, req.user.id, req.ip);
    return res.json({ hospital: updated });
  } catch (e) { return next(e); }
};

const setStatus = async (req, res, next) => {
  try {
    if (!req.body.status) throw badRequest('status required');
    const updated = await svc.setHospitalStatus(req.params.id, req.body.status, req.user.id, req.ip);
    return res.json({ hospital: updated });
  } catch (e) { return next(e); }
};

const createStaff = async (req, res, next) => {
  try {
    const { fullName, mobile, password, role } = req.body;
    const user = await svc.createStaffForHospital({
      hospitalId: req.params.id,
      fullName, mobile, password, role,
      actorId: req.user.id, ip: req.ip,
    });
    return res.status(201).json({ user });
  } catch (e) { return next(e); }
};

const resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) throw badRequest('newPassword min 6 chars');
    await svc.resetUserPassword({
      userId: req.params.userId,
      newPassword,
      actorId: req.user.id,
      ip: req.ip,
    });
    return res.json({ ok: true });
  } catch (e) { return next(e); }
};

const toggleActive = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') throw badRequest('isActive boolean required');
    const user = await svc.toggleUserActive({
      userId: req.params.userId, isActive,
      actorId: req.user.id, ip: req.ip,
    });
    return res.json({ user });
  } catch (e) { return next(e); }
};

const stats = async (_req, res, next) => {
  try {
    return res.json({ stats: await svc.platformStats() });
  } catch (e) { return next(e); }
};

module.exports = {
  listHospitals, getHospital, createHospital, patchHospital, setStatus,
  createStaff, resetPassword, toggleActive, stats,
};