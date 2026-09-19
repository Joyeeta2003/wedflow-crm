const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkPackageReminder() {
  try {
    console.log('=== CHECKING PACKAGE REMINDER SETTINGS ===\n');

    const result = await pool.query('SELECT id, name, reminder_day, reminder_email_days FROM packages WHERE name = $1', ['ROYAL WEDDING PACKAGE']);
    
    if (result.rows.length > 0) {
      console.log('Package reminder settings:', JSON.stringify(result.rows[0], null, 2));
    } else {
      console.log('Package not found');
    }

    console.log('\n=== CHECK COMPLETE ===');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkPackageReminder();
