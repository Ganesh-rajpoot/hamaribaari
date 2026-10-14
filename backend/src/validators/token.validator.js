const { body, param } = require('express-validator');

const idParamRule = [param('id').isUUID()];

/** Used by POST /tokens — patient-side join. Identity comes from JWT. */
const createTokenRules = [
  body('sessionId').isUUID().withMessage('sessionId must be a UUID'),
];

/** Used by POST /sessions/:id/walk-in — receptionist creates a token for a patient. */
const walkInRules = [
  body('patientName').trim().isLength({ min: 2, max: 100 })
    .withMessage('patientName must be 2-100 chars'),
  body('patientMobile').matches(/^[6-9]\d{9}$/)
    .withMessage('patientMobile must be a valid 10-digit Indian mobile'),
];

const reasonRules = [
  body('reason').trim().isLength({ min: 3, max: 250 }),
];

const optionalReasonRules = [
  body('reason').optional({ nullable: true }).trim().isLength({ max: 250 }),
];

module.exports = {
  idParamRule,
  createTokenRules,
  walkInRules,
  reasonRules,
  optionalReasonRules,
};