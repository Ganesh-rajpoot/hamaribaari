class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

const badRequest   = (msg, details) => new AppError(msg, 400, 'BAD_REQUEST', details);
const unauthorized = (msg = 'Unauthorized') => new AppError(msg, 401, 'UNAUTHORIZED');
const forbidden    = (msg = 'Forbidden')   => new AppError(msg, 403, 'FORBIDDEN');
const notFound     = (msg = 'Not found')   => new AppError(msg, 404, 'NOT_FOUND');
const conflict     = (msg, details)        => new AppError(msg, 409, 'CONFLICT', details);

module.exports = { AppError, badRequest, unauthorized, forbidden, notFound, conflict };