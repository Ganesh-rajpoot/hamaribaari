const { forbidden } = require('../utils/errors');

const requireSuperAdmin = (req, _res, next) => {
  if (!req.user) return next(forbidden());
  if (req.user.role !== 'SUPER_ADMIN') return next(forbidden('Platform operator only'));
  return next();
};

module.exports = { requireSuperAdmin };