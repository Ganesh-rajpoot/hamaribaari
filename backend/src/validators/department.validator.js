const { body } = require('express-validator');

const createDepartmentRules = [
  body('name').trim().isLength({ min: 2, max: 80 }),
  body('code').trim().isLength({ min: 1, max: 10 }).isAlphanumeric().withMessage('code must be alphanumeric'),
];

const updateDepartmentRules = [
  body('name').optional().trim().isLength({ min: 2, max: 80 }),
  body('code').optional().trim().isLength({ min: 1, max: 10 }).isAlphanumeric(),
];

module.exports = { createDepartmentRules, updateDepartmentRules };