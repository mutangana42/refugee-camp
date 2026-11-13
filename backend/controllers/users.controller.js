const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const asyncHandler = require('../utils/async-handler');
const HttpError = require('../utils/http-error');
const writeAudit = require('../utils/audit');

const publicColumns = `u.user_id, u.role_id, r.role_name, u.first_name, u.last_name, u.gender,
  u.phone, u.email, u.username, u.status, u.created_at, u.updated_at`;

const list = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(`SELECT ${publicColumns} FROM users u JOIN roles r ON r.role_id = u.role_id ORDER BY u.user_id DESC`);
  res.json({ data: rows });
});

const get = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(`SELECT ${publicColumns} FROM users u JOIN roles r ON r.role_id = u.role_id WHERE u.user_id = ?`, [req.params.id]);
  if (!rows[0]) throw new HttpError(404, 'User not found');
  res.json({ data: rows[0] });
});

const create = asyncHandler(async (req, res, next) => {
  const { role_id, first_name, last_name, gender, phone, email, username, password, status = 'Active' } = req.body;
  if (!role_id || !first_name || !last_name || !username || !password || password.length < 10) {
    throw new HttpError(422, 'Role, names, username, and a password of at least 10 characters are required');
  }
  const [result] = await pool.execute(
    `INSERT INTO users (role_id, first_name, last_name, gender, phone, email, username, password_hash, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [role_id, first_name, last_name, gender || null, phone || null, email || null, username, await bcrypt.hash(password, 12), status],
  );
  await writeAudit(pool, req.user.user_id, 'CREATE', 'users', result.insertId);
  req.params.id = result.insertId;
  res.status(201);
  return get(req, res, next);
});

const update = asyncHandler(async (req, res, next) => {
  const allowed = ['role_id', 'first_name', 'last_name', 'gender', 'phone', 'email', 'username', 'status'];
  const data = Object.fromEntries(allowed.filter((key) => req.body[key] !== undefined).map((key) => [key, req.body[key]]));
  if (req.body.password !== undefined) {
    if (req.body.password.length < 10) throw new HttpError(422, 'Password must be at least 10 characters');
    data.password_hash = await bcrypt.hash(req.body.password, 12);
  }
  const columns = Object.keys(data);
  if (!columns.length) throw new HttpError(422, 'No valid fields supplied');
  const [result] = await pool.execute(
    `UPDATE users SET ${columns.map((key) => `${key} = ?`).join(', ')} WHERE user_id = ?`,
    [...Object.values(data), req.params.id],
  );
  if (!result.affectedRows) throw new HttpError(404, 'User not found');
  await writeAudit(pool, req.user.user_id, 'UPDATE', 'users', req.params.id);
  return get(req, res, next);
});

module.exports = { list, get, create, update };
