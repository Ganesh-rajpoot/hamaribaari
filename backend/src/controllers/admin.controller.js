const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const hospitalService = require('../services/hospital.service');
const doctorService = require('../services/doctor.service');
const sessionService = require('../services/session.service');
const audit = require('../services/audit.service');
const { badRequest, conflict, notFound } = require('../utils/errors');

/* ---------- Hospital ---------- */
const getMyHospital = async (req, res, next) => {
  try {
    const h = await prisma.hospital.findUnique({
      where: { id: req.user.hospitalId },
      select: { id: true, name: true, city: true, address: true, phone: true },
    });
    if (!h) throw notFound('Hospital not found');
    return res.json({ hospital: h });
  } catch (e) { return next(e); }
};

const patchMyHospital = async (req, res, next) => {
  try {
    const updated = await hospitalService.updateHospital(req.user.hospitalId, req.body);
    await audit.log({
      actorId: req.user.id, hospitalId: req.user.hospitalId,
      action: 'HOSPITAL_UPDATE', entity: 'Hospital', entityId: updated.id,
      metadata: { fields: Object.keys(req.body) }, ip: req.ip,
    });
    return res.json({ hospital: updated });
  } catch (e) { return next(e); }
};

/* ---------- Departments ---------- */
const listDepartments = async (req, res, next) => {
  try {
    const data = await prisma.department.findMany({
      where: { hospitalId: req.user.hospitalId },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, code: true, createdAt: true },
    });
    return res.json({ departments: data });
  } catch (e) { return next(e); }
};

const createDepartment = async (req, res, next) => {
  try {
    const { name, code } = req.body;
    const dept = await prisma.department.create({
      data: { hospitalId: req.user.hospitalId, name, code: code.toUpperCase() },
    });
    await audit.log({
      actorId: req.user.id, hospitalId: req.user.hospitalId,
      action: 'DEPARTMENT_CREATE', entity: 'Department', entityId: dept.id,
      ip: req.ip,
    });
    return res.status(201).json({ department: dept });
  } catch (e) { return next(e); }
};

const updateDepartment = async (req, res, next) => {
  try {
    const existing = await prisma.department.findFirst({
      where: { id: req.params.id, hospitalId: req.user.hospitalId },
    });
    if (!existing) throw notFound('Department not found');
    const data = {};
    if (req.body.name) data.name = req.body.name;
    if (req.body.code) data.code = req.body.code.toUpperCase();
    const dept = await prisma.department.update({ where: { id: existing.id }, data });
    await audit.log({
      actorId: req.user.id, hospitalId: req.user.hospitalId,
      action: 'DEPARTMENT_UPDATE', entity: 'Department', entityId: dept.id,
      metadata: { fields: Object.keys(data) }, ip: req.ip,
    });
    return res.json({ department: dept });
  } catch (e) { return next(e); }
};

const deleteDepartment = async (req, res, next) => {
  try {
    const existing = await prisma.department.findFirst({
      where: { id: req.params.id, hospitalId: req.user.hospitalId },
    });
    if (!existing) throw notFound('Department not found');
    const doctorCount = await prisma.doctorProfile.count({ where: { departmentId: existing.id } });
    if (doctorCount > 0) throw conflict('Cannot delete department with assigned doctors');
    await prisma.department.delete({ where: { id: existing.id } });
    await audit.log({
      actorId: req.user.id, hospitalId: req.user.hospitalId,
      action: 'DEPARTMENT_DELETE', entity: 'Department', entityId: existing.id,
      ip: req.ip,
    });
    return res.json({ ok: true });
  } catch (e) { return next(e); }
};

/* ---------- Doctors ---------- */
const listDoctors = async (req, res, next) => {
  try {
    const data = await prisma.doctorProfile.findMany({
      where: { hospitalId: req.user.hospitalId },
      orderBy: { user: { fullName: 'asc' } },
      select: {
        id: true, roomNo: true, avgConsultMinutes: true, registrationNo: true,
        user: { select: { id: true, fullName: true, mobile: true } },
        department: { select: { id: true, name: true, code: true } },
      },
    });
    return res.json({ doctors: data });
  } catch (e) { return next(e); }
};

const createDoctor = async (req, res, next) => {
  try {
    const { fullName, mobile, password, departmentId, registrationNo, roomNo, avgConsultMinutes } = req.body;

    const dept = await prisma.department.findFirst({
      where: { id: departmentId, hospitalId: req.user.hospitalId },
    });
    if (!dept) throw badRequest('Invalid departmentId for this hospital');

    const passwordHash = await bcrypt.hash(password, 10);
    const { profile } = await doctorService.createDoctor({
      hospitalId: req.user.hospitalId,
      departmentId,
      fullName, mobile, passwordHash, registrationNo, roomNo, avgConsultMinutes,
    });

    await audit.log({
      actorId: req.user.id, hospitalId: req.user.hospitalId,
      action: 'DOCTOR_CREATE', entity: 'DoctorProfile', entityId: profile.id,
      metadata: { mobile, departmentId }, ip: req.ip,
    });
    return res.status(201).json({ doctorId: profile.id });
  } catch (e) { return next(e); }
};

const updateDoctor = async (req, res, next) => {
  try {
    if (req.body.departmentId) {
      const dept = await prisma.department.findFirst({
        where: { id: req.body.departmentId, hospitalId: req.user.hospitalId },
      });
      if (!dept) throw badRequest('Invalid departmentId');
    }
    const updated = await doctorService.updateDoctor(req.params.id, req.user.hospitalId, req.body);
    if (!updated) throw notFound('Doctor not found');
    await audit.log({
      actorId: req.user.id, hospitalId: req.user.hospitalId,
      action: 'DOCTOR_UPDATE', entity: 'DoctorProfile', entityId: updated.id,
      metadata: { fields: Object.keys(req.body) }, ip: req.ip,
    });
    return res.json({ doctor: updated });
  } catch (e) { return next(e); }
};

/* ---------- Schedules ---------- */
const listSchedules = async (req, res, next) => {
  try {
    const data = await doctorService.listDoctorSchedules(req.params.id, req.user.hospitalId);
    if (data === null) throw notFound('Doctor not found');
    return res.json({ schedules: data });
  } catch (e) { return next(e); }
};

const addSchedule = async (req, res, next) => {
  try {
    const created = await doctorService.addSchedule(req.params.id, req.user.hospitalId, {
      weekday: req.body.weekday,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      maxCapacity: req.body.maxCapacity ?? 40,
      isActive: req.body.isActive ?? true,
    });
    if (!created) throw notFound('Doctor not found');
    await audit.log({
      actorId: req.user.id, hospitalId: req.user.hospitalId,
      action: 'SCHEDULE_CREATE', entity: 'DoctorSchedule', entityId: created.id,
      ip: req.ip,
    });
    return res.status(201).json({ schedule: created });
  } catch (e) { return next(e); }
};

const deleteSchedule = async (req, res, next) => {
  try {
    const ok = await doctorService.deleteSchedule(req.params.sid, req.user.hospitalId);
    if (!ok) throw notFound('Schedule not found');
    await audit.log({
      actorId: req.user.id, hospitalId: req.user.hospitalId,
      action: 'SCHEDULE_DELETE', entity: 'DoctorSchedule', entityId: req.params.sid,
      ip: req.ip,
    });
    return res.json({ ok: true });
  } catch (e) { return next(e); }
};

/* ---------- Staff ---------- */
const createStaff = async (req, res, next) => {
  try {
    const { fullName, mobile, password, role } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { fullName, mobile, passwordHash, role, hospitalId: req.user.hospitalId },
      select: { id: true, fullName: true, mobile: true, role: true },
    });
    await audit.log({
      actorId: req.user.id, hospitalId: req.user.hospitalId,
      action: 'STAFF_CREATE', entity: 'User', entityId: user.id,
      metadata: { role, mobile }, ip: req.ip,
    });
    return res.status(201).json({ user });
  } catch (e) { return next(e); }
};

/* ---------- Sessions (admin view + ensure) ---------- */
const ensureSessions = async (req, res, next) => {
  try {
    const result = await sessionService.ensureTodaySessions(req.user.hospitalId, req.user.id);
    return res.json(result);
  } catch (e) { return next(e); }
};

const { toUTCMidnight } = require('../utils/date');

const listSessionsByDate = async (req, res, next) => {
  try {
    const dateStr = req.query.date || new Date().toISOString().slice(0, 10);
    const sessionDate = toUTCMidnight(dateStr);   // ← was: new Date(`${dateStr}T00:00:00.000Z`)

    const sessions = await prisma.oPDSession.findMany({
      where: { hospitalId: req.user.hospitalId, sessionDate },
      orderBy: { startTime: 'asc' },
      include: {
        doctor: {
          select: {
            id: true, roomNo: true,
            user: { select: { fullName: true } },
            department: { select: { id: true, name: true } },
          },
        },
      },
    });
    return res.json({ date: dateStr, sessions });
  } catch (e) { return next(e); }
};

module.exports = {
  getMyHospital, patchMyHospital,
  listDepartments, createDepartment, updateDepartment, deleteDepartment,
  listDoctors, createDoctor, updateDoctor,
  listSchedules, addSchedule, deleteSchedule,
  createStaff,
  ensureSessions, listSessionsByDate,
};