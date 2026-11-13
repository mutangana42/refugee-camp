const { pool } = require('../config/database');
const asyncHandler = require('../utils/async-handler');

const dashboard = asyncHandler(async (_req, res) => {
  const [[refugees], [families], [shelters], [requests], [lowStock], [donations], [distributions]] = await Promise.all([
    pool.execute("SELECT COUNT(*) total FROM refugees WHERE status = 'Active'"),
    pool.execute('SELECT COUNT(*) total FROM families'),
    pool.execute("SELECT COUNT(*) total, SUM(status = 'Available') available FROM shelters"),
    pool.execute("SELECT COUNT(*) total FROM resource_requests WHERE status = 'Pending'"),
    pool.execute(`SELECT COUNT(*) total FROM resources r LEFT JOIN inventory i ON i.resource_id = r.resource_id
                  WHERE r.is_active = TRUE AND COALESCE(i.quantity_available, 0) <= r.minimum_stock`),
    pool.execute('SELECT COUNT(*) total FROM donations WHERE donation_date >= CURRENT_DATE - INTERVAL 30 DAY'),
    pool.execute('SELECT COUNT(*) total FROM distributions WHERE distribution_date >= CURRENT_DATE - INTERVAL 30 DAY'),
  ]);
  res.json({ data: {
    active_refugees: refugees[0].total,
    families: families[0].total,
    shelters: shelters[0].total,
    available_shelters: Number(shelters[0].available || 0),
    pending_requests: requests[0].total,
    low_stock_resources: lowStock[0].total,
    donations_last_30_days: donations[0].total,
    distributions_last_30_days: distributions[0].total,
  } });
});

const inventory = asyncHandler(async (_req, res) => {
  const [rows] = await pool.execute(
    `SELECT c.category_name, r.resource_name, r.unit, r.minimum_stock,
            COALESCE(i.quantity_available, 0) quantity_available,
            COALESCE(i.quantity_available, 0) <= r.minimum_stock is_low_stock
     FROM resources r JOIN resource_categories c ON c.category_id = r.category_id
     LEFT JOIN inventory i ON i.resource_id = r.resource_id ORDER BY c.category_name, r.resource_name`,
  );
  res.json({ data: rows });
});

const distributions = asyncHandler(async (req, res) => {
  const from = req.query.from || '1970-01-01';
  const to = req.query.to || '2999-12-31';
  const [rows] = await pool.execute(
    `SELECT DATE(d.distribution_date) distribution_day, r.resource_name, r.unit,
            COUNT(DISTINCT d.distribution_id) distributions, SUM(dd.quantity) total_quantity
     FROM distributions d JOIN distribution_details dd ON dd.distribution_id = d.distribution_id
     JOIN resources r ON r.resource_id = dd.resource_id
     WHERE DATE(d.distribution_date) BETWEEN ? AND ?
     GROUP BY DATE(d.distribution_date), r.resource_id ORDER BY distribution_day DESC, r.resource_name`, [from, to],
  );
  res.json({ data: rows });
});

const donations = asyncHandler(async (req, res) => {
  const from = req.query.from || '1970-01-01';
  const to = req.query.to || '2999-12-31';
  const [rows] = await pool.execute(
    `SELECT DATE(d.donation_date) donation_day, dn.donor_name, r.resource_name, r.unit,
            SUM(dd.quantity) total_quantity, SUM(dd.quantity * COALESCE(dd.unit_cost, 0)) total_value
     FROM donations d JOIN donors dn ON dn.donor_id = d.donor_id
     JOIN donation_details dd ON dd.donation_id = d.donation_id JOIN resources r ON r.resource_id = dd.resource_id
     WHERE d.donation_date BETWEEN ? AND ?
     GROUP BY DATE(d.donation_date), dn.donor_id, r.resource_id ORDER BY donation_day DESC`, [from, to],
  );
  res.json({ data: rows });
});

module.exports = { dashboard, inventory, distributions, donations };
