const { validationResult } = require('express-validator');
const { badRequest } = require('../utils/errors');

const validate = (chains) => async (req, _res, next) => {
  await Promise.all(chains.map((c) => c.run(req)));
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return next(badRequest('Validation failed', result.array()));
  }
  return next();
};

module.exports = { validate };