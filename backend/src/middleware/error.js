const { AppError } = require('../utils/errors');


// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  const base = { requestId: req.id };

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details, ...base },
    });
  }
  if (err && err.code === 'P2002') {
    return res.status(409).json({
      error: { code: 'CONFLICT', message: 'Duplicate value', ...base },
    });
  }
  // eslint-disable-next-line no-console
  console.error(`[unhandled][${req.id}]`, err);
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong', ...base },
  });
};

const notFoundHandler = (req, res) =>
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found', requestId: req.id } });


module.exports = { errorHandler, notFoundHandler };