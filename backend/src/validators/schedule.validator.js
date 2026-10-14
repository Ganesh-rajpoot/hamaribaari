const { body } = require('express-validator');

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const createScheduleRules = [
  body('weekday').isInt({ min: 0, max: 6 }).toInt(),
  body('startTime').matches(timeRegex).withMessage('startTime must be HH:MM'),
  body('endTime').matches(timeRegex).withMessage('endTime must be HH:MM'),
  body('maxCapacity').optional().isInt({ min: 1, max: 500 }).toInt(),
  body('isActive').optional().isBoolean().toBoolean(),
  body().custom((v) => {
    if (v.startTime && v.endTime && v.startTime >= v.endTime) throw new Error('startTime must be before endTime');
    return true;
  }),
];

module.exports = { createScheduleRules };