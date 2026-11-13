const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const asyncHandler = require('../utils/async-handler');
const HttpError = require('../utils/http-error');

const authenticate = asyncHandler(async (req, _res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) throw new HttpError(401, 'Authentication required');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET || 'change-this-development-secret');
  } catch {
    throw new HttpError(401, 'Invalid or expired token');
  }

  const [rows] = await pool.execute(
    `SELECT u.user_id, u.username, u.first_name, u.last_name, u.status, r.role_name
     FROM users u JOIN roles r ON r.role_id = u.role_id WHERE u.user_id = ?`,
    [payload.sub],
  );
  if (!rows[0] || rows[0].status !== 'Active') throw new HttpError(401, 'Account is unavailable');
  req.user = rows[0];
  next();
});

const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role_name)) return next(new HttpError(403, 'Insufficient permission'));
  next();
};

module.exports = { authenticate, authorize };
