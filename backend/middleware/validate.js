const { validationResult } = require('express-validator');

module.exports = (req, _res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const error = new Error('Validation failed');
  error.status = 422;
  error.details = errors.array().map(({ path, msg }) => ({ field: path, message: msg }));
  next(error);
};
