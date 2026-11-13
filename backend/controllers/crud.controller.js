const { pool } = require('../config/database');
const asyncHandler = require('../utils/async-handler');
const HttpError = require('../utils/http-error');
const writeAudit = require('../utils/audit');

function pick(body, allowed) {
  return Object.fromEntries(allowed.filter((field) => body[field] !== undefined).map((field) => [field, body[field]]));
}

module.exports = function crudController(config) {
  const { table, id, fields, required = [], search = [], filters = [], select = '*' } = config;

  const list = asyncHandler(async (req, res) => {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const conditions = [];
    const params = [];

    if (req.query.search && search.length) {
      conditions.push(`(${search.map((column) => `${column} LIKE ?`).join(' OR ')})`);
      search.forEach(() => params.push(`%${req.query.search}%`));
    }
    filters.forEach((column) => {
      if (req.query[column] !== undefined) {
        conditions.push(`${column} = ?`);
        params.push(req.query[column]);
      }
    });

    const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
    const [countRows] = await pool.execute(`SELECT COUNT(*) total FROM ${table}${where}`, params);
    const [rows] = await pool.execute(
      `SELECT ${select} FROM ${table}${where} ORDER BY ${id} DESC LIMIT ${limit} OFFSET ${(page - 1) * limit}`,
      params,
    );
    res.json({ data: rows, pagination: { page, limit, total: countRows[0].total, pages: Math.ceil(countRows[0].total / limit) } });
  });

  const get = asyncHandler(async (req, res) => {
    const [rows] = await pool.execute(`SELECT ${select} FROM ${table} WHERE ${id} = ?`, [req.params.id]);
    if (!rows[0]) throw new HttpError(404, 'Record not found');
    res.json({ data: rows[0] });
  });

  const create = asyncHandler(async (req, res) => {
    const data = pick(req.body, fields);
    const missing = required.filter((field) => data[field] === undefined || data[field] === null || data[field] === '');
    if (missing.length) throw new HttpError(422, 'Required fields are missing', missing.map((field) => ({ field })));
    const columns = Object.keys(data);
    if (!columns.length) throw new HttpError(422, 'No valid fields supplied');
    const [result] = await pool.execute(
      `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
      Object.values(data),
    );
    await writeAudit(pool, req.user.user_id, 'CREATE', table, result.insertId, data);
    const [rows] = await pool.execute(`SELECT ${select} FROM ${table} WHERE ${id} = ?`, [result.insertId]);
    res.status(201).json({ data: rows[0] });
  });

  const update = asyncHandler(async (req, res) => {
    const data = pick(req.body, fields);
    const columns = Object.keys(data);
    if (!columns.length) throw new HttpError(422, 'No valid fields supplied');
    const [result] = await pool.execute(
      `UPDATE ${table} SET ${columns.map((column) => `${column} = ?`).join(', ')} WHERE ${id} = ?`,
      [...Object.values(data), req.params.id],
    );
    if (!result.affectedRows) throw new HttpError(404, 'Record not found');
    await writeAudit(pool, req.user.user_id, 'UPDATE', table, req.params.id, data);
    const [rows] = await pool.execute(`SELECT ${select} FROM ${table} WHERE ${id} = ?`, [req.params.id]);
    res.json({ data: rows[0] });
  });

  const remove = asyncHandler(async (req, res) => {
    const [result] = await pool.execute(`DELETE FROM ${table} WHERE ${id} = ?`, [req.params.id]);
    if (!result.affectedRows) throw new HttpError(404, 'Record not found');
    await writeAudit(pool, req.user.user_id, 'DELETE', table, req.params.id);
    res.status(204).send();
  });

  return { list, get, create, update, remove };
};
