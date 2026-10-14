const { body } = require('express-validator');

const mobileRegex = /^[6-9]\d{9}$/;

const createDoctorRules = [
  body('fullName').trim().isLength({ min: 2, max: 100 }),
  body('mobile').trim().matches(mobileRegex),
  body('password').isLength({ min: 6, max: 72 }),
  body('departmentId').isUUID(),
  body('registrationNo').optional({ nullable: true }).trim().isLength({ max: 40 }),
  body('roomNo').optional({ nullable: true }).trim().isLength({ max: 20 }),
  body('avgConsultMinutes').optional().isInt({ min: 1, max: 120 }).toInt(),
];

const updateDoctorRules = [
  body('roomNo').optional({ nullable: true }).trim().isLength({ max: 20 }),
  body('avgConsultMinutes').optional().isInt({ min: 1, max: 120 }).toInt(),
  body('departmentId').optional().isUUID(),
];

const createStaffRules = [
  body('fullName').trim().isLength({ min: 2, max: 100 }),
  body('mobile').trim().matches(mobileRegex),
  body('password').isLength({ min: 6, max: 72 }),
  body('role').isIn(['RECEPTIONIST', 'HOSPITAL_ADMIN']),
];

module.exports = { createDoctorRules, updateDoctorRules, createStaffRules };