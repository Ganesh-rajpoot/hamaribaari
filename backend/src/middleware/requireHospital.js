const { forbidden } = require('../utils/errors');

// Ensures a staff user (RECEPTIONIST/DOCTOR/HOSPITAL_ADMIN) has a hospitalId on the JWT.
const requireHospital = (req, _res, next) => {
  if (!req.user) return next(forbidden());
  if (!req.user.hospitalId) return next(forbidden('Staff user has no hospital assigned'));
  return next();
};

module.exports = { requireHospital };