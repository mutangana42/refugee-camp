const { pool, transaction } = require('../config/database');
const asyncHandler = require('../utils/async-handler');
const HttpError = require('../utils/http-error');
const writeAudit = require('../utils/audit');

function validateItems(items) {
  if (!Array.isArray(items) || !items.length) throw new HttpError(422, 'At least one donation item is required');
  const ids = new Set();
  for (const item of items) {
    if (!Number(item.resource_id) || !Number.isFinite(Number(item.quantity)) || Number(item.quantity) <= 0) {
      throw new HttpError(422, 'Each item requires a resource_id and positive quantity');
    }
    if (ids.has(Number(item.resource_id))) throw new HttpError(422, 'A resource may appear only once per donation');
    ids.add(Number(item.resource_id));
  }
}

const list = asyncHandler(async (_req, res) => {
  const [rows] = await pool.execute(
    `SELECT d.*, dn.donor_name, u.username received_by_username,
            COUNT(dd.donation_detail_id) item_count, SUM(dd.quantity * COALESCE(dd.unit_cost, 0)) total_value
     FROM donations d JOIN donors dn ON dn.donor_id = d.donor_id
     JOIN users u ON u.user_id = d.received_by
     JOIN donation_details dd ON dd.donation_id = d.donation_id
     GROUP BY d.donation_id ORDER BY d.donation_id DESC`,
  );
  res.json({ data: rows });
});

const get = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT d.*, dn.donor_name, u.username received_by_username FROM donations d
     JOIN donors dn ON dn.donor_id = d.donor_id JOIN users u ON u.user_id = d.received_by
     WHERE d.donation_id = ?`, [req.params.id],
  );
  if (!rows[0]) throw new HttpError(404, 'Donation not found');
  const [items] = await pool.execute(
    `SELECT dd.*, r.resource_name, r.unit FROM donation_details dd
     JOIN resources r ON r.resource_id = dd.resource_id WHERE dd.donation_id = ?`, [req.params.id],
  );
  res.json({ data: { ...rows[0], items } });
});

const create = asyncHandler(async (req, res, next) => {
  const { donor_id: donorId, donation_date: donationDate, remarks, items } = req.body;
  if (!Number(donorId) || !donationDate) throw new HttpError(422, 'donor_id and donation_date are required');
  validateItems(items);
  const donationId = await transaction(async (db) => {
    const [result] = await db.execute(
      'INSERT INTO donations (donor_id, received_by, donation_date, remarks) VALUES (?, ?, ?, ?)',
      [donorId, req.user.user_id, donationDate, remarks || null],
    );
    for (const item of items) {
      const quantity = Number(item.quantity);
      await db.execute(
        'INSERT INTO donation_details (donation_id, resource_id, quantity, unit_cost) VALUES (?, ?, ?, ?)',
        [result.insertId, item.resource_id, quantity, item.unit_cost ?? null],
      );
      await db.execute(
        `INSERT INTO inventory (resource_id, quantity_available) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE quantity_available = quantity_available + VALUES(quantity_available)`,
        [item.resource_id, quantity],
      );
      await db.execute(
        `INSERT INTO stock_movements (resource_id, user_id, movement_type, quantity_change, reference_id)
         VALUES (?, ?, 'Donation', ?, ?)`,
        [item.resource_id, req.user.user_id, quantity, result.insertId],
      );
    }
    await writeAudit(db, req.user.user_id, 'RECEIVE_DONATION', 'donations', result.insertId);
    return result.insertId;
  });
  req.params.id = donationId;
  res.status(201);
  return get(req, res, next);
});

module.exports = { list, get, create };
