require('dotenv').config();
const fs = require('fs/promises');
const path = require('path');
const mysql = require('mysql2/promise');

async function migrate() {
  const database = process.env.DB_NAME || 'refugee_camp_db';
  if (!/^[A-Za-z0-9_]+$/.test(database)) throw new Error('DB_NAME may contain only letters, numbers, and underscores');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query(`USE \`${database}\``);
    await connection.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      migration_name VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB`);

    const directory = path.join(__dirname, '..', 'database', 'migrations');
    const files = (await fs.readdir(directory)).filter((file) => file.endsWith('.sql')).sort();
    for (const file of files) {
      const [rows] = await connection.execute('SELECT 1 FROM schema_migrations WHERE migration_name = ?', [file]);
      if (rows.length) continue;
      const sql = await fs.readFile(path.join(directory, file), 'utf8');
      await connection.beginTransaction();
      try {
        await connection.query(sql);
        await connection.execute('INSERT INTO schema_migrations (migration_name) VALUES (?)', [file]);
        await connection.commit();
        console.log(`Applied ${file}`);
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    }
    console.log('Database is up to date');
  } finally {
    await connection.end();
  }
}

migrate().catch((error) => {
  console.error('Migration failed:', error.message);
  process.exit(1);
});
