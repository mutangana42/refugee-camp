const { pool } = require('../config/database');
const asyncHandler = require('../utils/async-handler');
const HttpError = require('../utils/http-error');

const list = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY notification_id DESC LIMIT 100',
    [req.user.user_id],
  );
  res.json({ data: rows });
});

const create = asyncHandler(async (req, res) => {
  const { target_role: targetRole, user_id: userId, title, message } = req.body;
  if (!title || !message) throw new HttpError(422, 'Title and message are required');
  if (!targetRole && !userId) throw new HttpError(422, 'A recipient user_id or target_role is required');

  if (userId) {
    const [result] = await pool.execute(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [userId, title, message],
    );
    if (!result.affectedRows) throw new HttpError(404, 'Notification not delivered');
  } else {
    const [result] = await pool.execute(
      `INSERT INTO notifications (user_id, title, message)
       SELECT u.user_id, ?, ? FROM users u JOIN roles r ON r.role_id = u.role_id
       WHERE r.role_name = ? AND u.status = 'Active'`,
      [title, message, targetRole],
    );
    if (!result.affectedRows) throw new HttpError(404, `No users found for role ${targetRole}`);
  }

  res.status(201).send();
});

const markRead = asyncHandler(async (req, res) => {
  const [result] = await pool.execute(
    'UPDATE notifications SET is_read = TRUE WHERE notification_id = ? AND user_id = ?',
    [req.params.id, req.user.user_id],
  );
  if (!result.affectedRows) throw new HttpError(404, 'Notification not found');
  res.status(204).send();
});

const markAllRead = asyncHandler(async (req, res) => {
  await pool.execute('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.user_id]);
  res.status(204).send();
});

module.exports = { list, create, markRead, markAllRead };
