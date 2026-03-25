require('dotenv').config();
const mysql = require('mysql2/promise');

async function updateSchema() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log('Adding reset_otp and reset_otp_expiry columns to users table...');
    await pool.query('ALTER TABLE users ADD COLUMN reset_otp VARCHAR(255) NULL;');
    await pool.query('ALTER TABLE users ADD COLUMN reset_otp_expiry DATETIME NULL;');
    console.log('Columns added successfully.');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Columns already exist.');
    } else {
      console.error('Error modifying table:', err);
    }
  } finally {
    pool.end();
  }
}

updateSchema();
