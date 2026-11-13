const app = require('./app');
const { pool } = require('./config/database');

const port = Number(process.env.PORT) || 5000;

async function start() {
  try {
    const connection = await pool.getConnection();
    connection.release();
    app.listen(port, () => console.log(`API listening on port ${port}`));
  } catch (error) {
    console.error('Unable to connect to MySQL:', error.message);
    process.exit(1);
  }
}

if (require.main === module) start();

module.exports = { app, start };
