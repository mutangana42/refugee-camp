const { pool, transaction } = require('../config/database');
const asyncHandler = require('../utils/async-handler');
const HttpError = require('../utils/http-error');
const writeAudit = require('../utils/audit');

const list = asyncHandler(async (req, res) => {
  const lowStock = req.query.low_stock === 'true' ? 'AND COALESCE(i.quantity_available, 0) <= r.minimum_stock' : '';
  const [rows] = await pool.execute(
    `SELECT r.resource_id, r.resource_name, r.unit, r.minimum_stock, c.category_name,
            COALESCE(i.quantity_available, 0) quantity_available, i.last_updated,
            (COALESCE(i.quantity_available, 0) <= r.minimum_stock) is_low_stock
     FROM resources r
     JOIN resource_categories c ON c.category_id = r.category_id
     LEFT JOIN inventory i ON i.resource_id = r.resource_id
     WHERE r.is_active = TRUE ${lowStock}
     ORDER BY r.resource_name`,
  );
  res.json({ data: rows });
});

const adjust = asyncHandler(async (req, res) => {
  const resourceId = Number(req.params.resourceId);
  const quantityChange = Number(req.body.quantity_change);
  const reason = String(req.body.reason || '').trim();
  if (!resourceId || !Number.isFinite(quantityChange) || quantityChange === 0 || !reason) {
    throw new HttpError(422, 'A non-zero quantity_change and reason are required');
  }

  const quantityAvailable = await transaction(async (db) => {
    await db.execute('INSERT IGNORE INTO inventory (resource_id, quantity_available) VALUES (?, 0)', [resourceId]);
    const [rows] = await db.execute('SELECT quantity_available FROM inventory WHERE resource_id = ? FOR UPDATE', [resourceId]);
    const nextQuantity = Number(rows[0].quantity_available) + quantityChange;
    if (nextQuantity < 0) throw new HttpError(409, 'Adjustment would make inventory negative');
    await db.execute('UPDATE inventory SET quantity_available = ? WHERE resource_id = ?', [nextQuantity, resourceId]);
    const [movement] = await db.execute(
      `INSERT INTO stock_movements (resource_id, user_id, movement_type, quantity_change, reason)
       VALUES (?, ?, 'Adjustment', ?, ?)`,
      [resourceId, req.user.user_id, quantityChange, reason],
    );
    await writeAudit(db, req.user.user_id, 'ADJUST_STOCK', 'inventory', resourceId, { quantityChange, reason, movementId: movement.insertId });
    return nextQuantity;
  });
  res.json({ data: { resource_id: resourceId, quantity_available: quantityAvailable } });
});

const movements = asyncHandler(async (req, res) => {
  const params = [];
  const where = req.query.resource_id ? 'WHERE sm.resource_id = ?' : '';
  if (req.query.resource_id) params.push(req.query.resource_id);
  const [rows] = await pool.execute(
    `SELECT sm.*, r.resource_name, r.unit, u.username
     FROM stock_movements sm JOIN resources r ON r.resource_id = sm.resource_id
     LEFT JOIN users u ON u.user_id = sm.user_id ${where}
     ORDER BY sm.movement_id DESC LIMIT 500`,
    params,
  );
  res.json({ data: rows });
});

module.exports = { list, adjust, movements };
