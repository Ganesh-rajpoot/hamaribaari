const { body, param, query } = require('express-validator');

const cancelRules = [
  body('reason').trim().isLength({ min: 3, max: 250 }),
];

const dateQueryRule = [
  query('date').optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('date must be YYYY-MM-DD'),
];

const idParamRule = [param('id').isUUID()];

module.exports = { cancelRules, dateQueryRule, idParamRule };