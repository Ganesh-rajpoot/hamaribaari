const { body } = require('express-validator');

const updateHospitalRules = [
  body('name').optional().trim().isLength({ min: 2, max: 120 }),
  body('city').optional().trim().isLength({ min: 2, max: 80 }),
  body('address').optional({ nullable: true }).trim().isLength({ max: 250 }),
  body('phone').optional({ nullable: true }).trim().isLength({ max: 20 }),
];

module.exports = { updateHospitalRules };