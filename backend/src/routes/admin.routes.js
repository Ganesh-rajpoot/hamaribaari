const { Router } = require('express');
const c = require('../controllers/admin.controller');
const { authenticate, requireRole } = require('../middleware/auth');
const { requireHospital } = require('../middleware/requireHospital');
const { validate } = require('../middleware/validate');
const { updateHospitalRules } = require('../validators/hospital.validator');
const { createDepartmentRules, updateDepartmentRules } = require('../validators/department.validator');
const { createDoctorRules, updateDoctorRules, createStaffRules } = require('../validators/doctor.validator');
const { createScheduleRules } = require('../validators/schedule.validator');
const { dateQueryRule } = require('../validators/session.validator');

const router = Router();

// router.use(authenticate, requireRole('HOSPITAL_ADMIN'), requireHospital);
const guard = [authenticate, requireRole('HOSPITAL_ADMIN'), requireHospital];

// Hospital
router.get('/hospital', guard ,c.getMyHospital);
router.patch('/hospital',guard, validate(updateHospitalRules), c.patchMyHospital);

// Departments
router.get('/departments',guard, c.listDepartments);
router.post('/departments',guard, validate(createDepartmentRules), c.createDepartment);
router.patch('/departments/:id',guard, validate(updateDepartmentRules), c.updateDepartment);
router.delete('/departments/:id',guard, c.deleteDepartment);

// Doctors
router.get('/doctors', guard,c.listDoctors);
router.post('/doctors',guard, validate(createDoctorRules), c.createDoctor);
router.patch('/doctors/:id',guard, validate(updateDoctorRules), c.updateDoctor);

// Schedules
router.get('/doctors/:id/schedules', guard,c.listSchedules);
router.post('/doctors/:id/schedules',guard, validate(createScheduleRules), c.addSchedule);
router.delete('/doctors/:id/schedules/:sid',guard, c.deleteSchedule);

// Staff
router.post('/staff',guard, validate(createStaffRules), c.createStaff);

// Sessions
router.post('/sessions/ensure',guard, c.ensureSessions);
router.get('/sessions', dateQueryRule,guard, c.listSessionsByDate);

module.exports = router;