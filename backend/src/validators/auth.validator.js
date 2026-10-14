const { body } = require('express-validator');

const mobileRegex = /^[6-9]\d{9}$/; // India mobile numbers

const registerRules = [
  body('fullName').trim().isLength({ min: 2, max: 100 }).withMessage('fullName 2-100 chars'),
  body('mobile').trim().matches(mobileRegex).withMessage('Invalid Indian mobile number'),
  body('password').isLength({ min: 6, max: 72 }).withMessage('password min 6 chars'),
  body('confirmPassword').custom((v, { req }) => {
    if (v !== req.body.password) throw new Error('Passwords do not match');
    return true;
  }),
];

const loginRules = [
  body('mobile').trim().matches(mobileRegex).withMessage('Invalid mobile'),
  body('password').isString().isLength({ min: 1 }),
];

module.exports = { registerRules, loginRules };