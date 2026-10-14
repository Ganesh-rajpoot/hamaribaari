const { body, param, query } = require('express-validator');

const mobileRegex = /^[6-9]\d{9}$/;

const createHospitalRules = [
  body('name').trim().isLength({ min: 2, max: 120 }),
  body('city').trim().isLength({ min: 2, max: 80 }),
  body('address').optional({ nullable: true }).trim().isLength({ max: 250 }),
  body('phone').optional({ nullable: true }).trim().isLength({ max: 20 }),
  body('adminFullName').trim().isLength({ min: 2, max: 100 }),
  body('adminMobile').trim().matches(mobileRegex),
  body('adminPassword').isLength({ min: 6, max: 72 }),
];

const patchHospitalRules = [
  body('name').optional().trim().isLength({ min: 2, max: 120 }),
  body('city').optional().trim().isLength({ min: 2, max: 80 }),
  body('address').optional({ nullable: true }).trim().isLength({ max: 250 }),
  body('phone').optional({ nullable: true }).trim().isLength({ max: 20 }),
  body('status').optional().isIn(['PENDING', 'ACTIVE', 'SUSPENDED']),
];

const createStaffRules = [
  body('fullName').trim().isLength({ min: 2, max: 100 }),
  body('mobile').trim().matches(mobileRegex),
  body('password').isLength({ min: 6, max: 72 }),
  body('role').isIn(['HOSPITAL_ADMIN', 'RECEPTIONIST']),
];

const resetPasswordRules = [
  body('newPassword').isLength({ min: 6, max: 72 }),
];

const toggleActiveRules = [
  body('isActive').isBoolean().toBoolean(),
];

const listQueryRules = [
  query('q').optional().trim().isLength({ max: 120 }),
  query('status').optional().isIn(['PENDING', 'ACTIVE', 'SUSPENDED']),
];

const idParam = [param('id').isUUID()];
const userIdParam = [param('userId').isUUID()];

module.exports = {
  createHospitalRules, patchHospitalRules, createStaffRules,
  resetPasswordRules, toggleActiveRules, listQueryRules,
  idParam, userIdParam,
};