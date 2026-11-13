require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

async function seedAdmin() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 10) throw new Error('Set ADMIN_PASSWORD to at least 10 characters');
  const passwordHash = await bcrypt.hash(password, 12);
  const [roles] = await pool.execute("SELECT role_id FROM roles WHERE role_name = 'Administrator'");
  if (!roles[0]) throw new Error('Run migrations before seeding the administrator');

  const [users] = await pool.execute('SELECT user_id FROM users WHERE username = ?', [username]);
  if (users[0]) {
    await pool.execute(
      `UPDATE users SET role_id = ?, password_hash = ?, status = 'Active' WHERE user_id = ?`,
      [roles[0].role_id, passwordHash, users[0].user_id],
    );
  } else {
    await pool.execute(
      `INSERT INTO users (role_id, first_name, last_name, email, username, password_hash)
       VALUES (?, 'System', 'Administrator', ?, ?, ?)`,
      [roles[0].role_id, process.env.ADMIN_EMAIL || null, username, passwordHash],
    );
  }
  console.log(`Administrator '${username}' is ready`);
}

seedAdmin().catch((error) => {
  console.error('Admin seed failed:', error.message);
  process.exitCode = 1;
}).finally(() => pool.end());
