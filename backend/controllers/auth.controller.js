const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const asyncHandler = require('../utils/async-handler');
const HttpError = require('../utils/http-error');
const writeAudit = require('../utils/audit');

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) throw new HttpError(422, 'Username and password are required');
  const [rows] = await pool.execute(
    `SELECT u.*, r.role_name FROM users u JOIN roles r ON r.role_id = u.role_id WHERE u.username = ?`,
    [username],
  );
  const user = rows[0];
  if (!user || user.status !== 'Active' || !(await bcrypt.compare(password, user.password_hash))) {
    throw new HttpError(401, 'Invalid username or password');
  }
  const token = jwt.sign(
    { sub: user.user_id, role: user.role_name },
    process.env.JWT_SECRET || 'change-this-development-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' },
  );
  await writeAudit(pool, user.user_id, 'LOGIN', 'users', user.user_id);
  delete user.password_hash;
  res.json({ data: { token, user } });
});

const me = (req, res) => res.json({ data: req.user });

const changePassword = asyncHandler(async (req, res) => {
  const { current_password: currentPassword, new_password: newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 10) {
    throw new HttpError(422, 'Current password and a new password of at least 10 characters are required');
  }
  const [rows] = await pool.execute('SELECT password_hash FROM users WHERE user_id = ?', [req.user.user_id]);
  if (!(await bcrypt.compare(currentPassword, rows[0].password_hash))) throw new HttpError(401, 'Current password is incorrect');
  await pool.execute('UPDATE users SET password_hash = ? WHERE user_id = ?', [await bcrypt.hash(newPassword, 12), req.user.user_id]);
  await writeAudit(pool, req.user.user_id, 'CHANGE_PASSWORD', 'users', req.user.user_id);
  res.status(204).send();
});

module.exports = { login, me, changePassword };
