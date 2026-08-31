const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkNulls() {
  try {
    console.log('=== CHECKING NULL workspace_id VALUES ===\n');

    const targetTables = [
      'board_columns', 'board_cards', 'booking_events', 'crew_assignments',
      'deliverables', 'editor_assignments', 'editor_plans', 'equipment_assignments',
      'package_day_crew', 'package_days', 'package_service', 'payment_schedules',
      'workflow_steps', 'user_sessions', 'user_activity_log'
    ];

    let allPass = true;
    for (const table of targetTables) {
      const result = await pool.query(`
        SELECT COUNT(*) as null_count
        FROM ${table}
        WHERE workspace_id IS NULL;
      `);

      const nullCount = parseInt(result.rows[0].null_count, 10);
      if (nullCount === 0) {
        console.log(`PASS: ${table} - 0 NULL values`);
      } else {
        console.log(`FAIL: ${table} - ${nullCount} NULL values`);
        allPass = false;
      }
    }

    console.log(`\nResult: ${allPass ? 'PASS' : 'FAIL'}`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkNulls();
