async function writeAudit(db, userId, action, tableName, recordId, details = null) {
  await db.execute(
    'INSERT INTO audit_logs (user_id, action, table_name, record_id, details) VALUES (?, ?, ?, ?, ?)',
    [userId || null, action, tableName, recordId || null, details ? JSON.stringify(details) : null],
  );
}

module.exports = writeAudit;
