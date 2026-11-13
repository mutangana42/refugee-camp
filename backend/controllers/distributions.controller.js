const { pool, transaction } = require('../config/database');
const asyncHandler = require('../utils/async-handler');
const HttpError = require('../utils/http-error');
const writeAudit = require('../utils/audit');

const list = asyncHandler(async (_req, res) => {
  const [rows] = await pool.execute(
    `SELECT d.*, rf.refugee_code, CONCAT(rf.first_name, ' ', rf.last_name) refugee_name,
            u.username distributed_by_username, COUNT(dd.distribution_detail_id) item_count
     FROM distributions d JOIN refugees rf ON rf.refugee_id = d.refugee_id
     JOIN users u ON u.user_id = d.distributed_by
     JOIN distribution_details dd ON dd.distribution_id = d.distribution_id
     GROUP BY d.distribution_id ORDER BY d.distribution_id DESC`,
  );
  res.json({ data: rows });
});

const get = asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT d.*, rf.refugee_code, CONCAT(rf.first_name, ' ', rf.last_name) refugee_name,
            u.username distributed_by_username FROM distributions d
     JOIN refugees rf ON rf.refugee_id = d.refugee_id JOIN users u ON u.user_id = d.distributed_by
     WHERE d.distribution_id = ?`, [req.params.id],
  );
  if (!rows[0]) throw new HttpError(404, 'Distribution not found');
  const [items] = await pool.execute(
    `SELECT dd.*, r.resource_name, r.unit FROM distribution_details dd
     JOIN resources r ON r.resource_id = dd.resource_id WHERE dd.distribution_id = ?`, [req.params.id],
  );
  res.json({ data: { ...rows[0], items } });
});

function validateItems(items) {
  if (!Array.isArray(items) || !items.length) throw new HttpError(422, 'At least one distribution item is required');
  const ids = new Set();
  for (const item of items) {
    if (!Number(item.resource_id) || !Number.isFinite(Number(item.quantity)) || Number(item.quantity) <= 0 || ids.has(Number(item.resource_id))) {
      throw new HttpError(422, 'Items require unique resource IDs and positive quantities');
    }
    ids.add(Number(item.resource_id));
  }
}

const create = asyncHandler(async (req, res, next) => {
  const { refugee_id: refugeeId, request_id: requestId, distribution_date: distributionDate, remarks, items } = req.body;
  if (!Number(refugeeId)) throw new HttpError(422, 'refugee_id is required');
  validateItems(items);
  const sortedItems = [...items].sort((a, b) => Number(a.resource_id) - Number(b.resource_id));

  const distributionId = await transaction(async (db) => {
    if (requestId) {
      const [requests] = await db.execute('SELECT refugee_id, status FROM resource_requests WHERE request_id = ? FOR UPDATE', [requestId]);
      if (!requests[0] || requests[0].status !== 'Approved') throw new HttpError(409, 'The linked request must be approved');
      if (Number(requests[0].refugee_id) !== Number(refugeeId)) throw new HttpError(422, 'Request and distribution must belong to the same refugee');
      const [approved] = await db.execute('SELECT resource_id, quantity FROM resource_request_details WHERE request_id = ?', [requestId]);
      const approvedMap = new Map(approved.map((item) => [Number(item.resource_id), Number(item.quantity)]));
      if (sortedItems.some((item) => !approvedMap.has(Number(item.resource_id)) || Number(item.quantity) > approvedMap.get(Number(item.resource_id)))) {
        throw new HttpError(422, 'Distribution items cannot exceed the approved request');
      }
    }

    for (const item of sortedItems) {
      const [inventory] = await db.execute('SELECT quantity_available FROM inventory WHERE resource_id = ? FOR UPDATE', [item.resource_id]);
      if (!inventory[0] || Number(inventory[0].quantity_available) < Number(item.quantity)) {
        throw new HttpError(409, `Insufficient inventory for resource ${item.resource_id}`);
      }
    }

    const [result] = await db.execute(
      `INSERT INTO distributions (refugee_id, request_id, distributed_by, distribution_date, remarks)
       VALUES (?, ?, ?, COALESCE(?, NOW()), ?)`,
      [refugeeId, requestId || null, req.user.user_id, distributionDate || null, remarks || null],
    );
    for (const item of sortedItems) {
      const quantity = Number(item.quantity);
      await db.execute(
        'INSERT INTO distribution_details (distribution_id, resource_id, quantity) VALUES (?, ?, ?)',
        [result.insertId, item.resource_id, quantity],
      );
      await db.execute('UPDATE inventory SET quantity_available = quantity_available - ? WHERE resource_id = ?', [quantity, item.resource_id]);
      await db.execute(
        `INSERT INTO stock_movements (resource_id, user_id, movement_type, quantity_change, reference_id)
         VALUES (?, ?, 'Distribution', ?, ?)`,
        [item.resource_id, req.user.user_id, -quantity, result.insertId],
      );
      await db.execute(
        `INSERT INTO notifications (user_id, title, message)
         SELECT u.user_id, 'Low stock alert', CONCAT(r.resource_name, ' is at or below minimum stock')
         FROM users u JOIN roles role ON role.role_id = u.role_id
         JOIN resources r ON r.resource_id = ? JOIN inventory i ON i.resource_id = r.resource_id
         WHERE role.role_name IN ('Administrator', 'Warehouse Officer') AND u.status = 'Active'
           AND i.quantity_available <= r.minimum_stock`,
        [item.resource_id],
      );
    }
    if (requestId) await db.execute("UPDATE resource_requests SET status = 'Completed' WHERE request_id = ?", [requestId]);
    await writeAudit(db, req.user.user_id, 'DISTRIBUTE_RESOURCES', 'distributions', result.insertId);
    return result.insertId;
  });
  req.params.id = distributionId;
  res.status(201);
  return get(req, res, next);
});

module.exports = { list, get, create };
