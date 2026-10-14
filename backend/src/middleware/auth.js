const { verifyAccessToken } = require('../utils/jwt');
const { unauthorized, forbidden } = require('../utils/errors');

const authenticate = (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return next(unauthorized('Missing bearer token'));

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.sub,
      role: decoded.role,
      hospitalId: decoded.hospitalId || null,
    };
    return next();
  } catch {
    return next(unauthorized('Invalid or expired token'));
  }
};

const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) return next(unauthorized());
  if (!roles.includes(req.user.role)) return next(forbidden('Insufficient role'));
  return next();
};

module.exports = { authenticate, requireRole };