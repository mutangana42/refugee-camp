const { pool, transaction } = require('../config/database');
const asyncHandler = require('../utils/async-handler');
const HttpError = require('../utils/http-error');
const writeAudit = require('../utils/audit');

const list = asyncHandler(async (req, res) => {
  const params = [];
  const where = req.query.status ? 'WHERE rr.status = ?' : '';
  if (req.query.status) params.push(req.query.status);
  const [rows] = await pool.execute(
    `SELECT rr.*, rf.refugee_code, CONCAT(rf.first_name, ' ', rf.last_name) refugee_name,
            u.username requested_by_username, reviewer.username reviewed_by_username
     FROM resource_requests rr JOIN refugees rf ON rf.refugee_id = rr.refugee_id
     JOIN users u ON u.user_id = rr.requested_by LEFT JOIN users reviewer ON reviewer.user_id = rr.reviewed_by
     ${where} ORDER BY rr.request_id DESC`, params,
  );
  res.json({ data: rows });
});

const get = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM resource_requests WHERE request_id = ?', [req.params.id]);
  if (!rows[0]) throw new HttpError(404, 'Resource request not found');
  const [items] = await pool.execute(
    `SELECT rrd.*, r.resource_name, r.unit FROM resource_request_details rrd
     JOIN resources r ON r.resource_id = rrd.resource_id WHERE rrd.request_id = ?`, [req.params.id],
  );
  res.json({ data: { ...rows[0], items } });
});

const create = asyncHandler(async (req, res, next) => {
  const { refugee_id: refugeeId, remarks, items } = req.body;
  if (!Number(refugeeId) || !Array.isArray(items) || !items.length) throw new HttpError(422, 'refugee_id and request items are required');
  const ids = new Set();
  items.forEach((item) => {
    if (!Number(item.resource_id) || Number(item.quantity) <= 0 || ids.has(Number(item.resource_id))) {
      throw new HttpError(422, 'Items require unique resource IDs and positive quantities');
    }
    ids.add(Number(item.resource_id));
  });
  const requestId = await transaction(async (db) => {
    const [result] = await db.execute(
      'INSERT INTO resource_requests (refugee_id, requested_by, remarks) VALUES (?, ?, ?)',
      [refugeeId, req.user.user_id, remarks || null],
    );
    for (const item of items) {
      await db.execute(
        'INSERT INTO resource_request_details (request_id, resource_id, quantity) VALUES (?, ?, ?)',
        [result.insertId, item.resource_id, item.quantity],
      );
    }
    await writeAudit(db, req.user.user_id, 'CREATE', 'resource_requests', result.insertId);
    return result.insertId;
  });
  req.params.id = requestId;
  res.status(201);
  return get(req, res, next);
});

const review = asyncHandler(async (req, res, next) => {
  const status = req.body.status;
  if (!['Approved', 'Rejected'].includes(status)) throw new HttpError(422, 'Status must be Approved or Rejected');
  const [result] = await pool.execute(
    `UPDATE resource_requests SET status = ?, reviewed_by = ?, reviewed_at = NOW(),
     remarks = COALESCE(?, remarks) WHERE request_id = ? AND status = 'Pending'`,
    [status, req.user.user_id, req.body.remarks ?? null, req.params.id],
  );
  if (!result.affectedRows) throw new HttpError(409, 'Only pending requests can be reviewed');

  await pool.execute(
    `INSERT INTO notifications (user_id, title, message)
     SELECT u.user_id, ?, ? FROM users u JOIN roles r ON r.role_id = u.role_id
     WHERE r.role_name = 'Refugee' AND u.status = 'Active'`,
    [`Request ${status}`, `A resource request has been ${status.toLowerCase()}.`],
  ).catch(() => {});

  await writeAudit(pool, req.user.user_id, `REQUEST_${status.toUpperCase()}`, 'resource_requests', req.params.id);
  return get(req, res, next);
});

module.exports = { list, get, create, review };
