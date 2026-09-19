const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function testEmailSending() {
  try {
    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const dateStr = istTime.toISOString().split('T')[0];
    const timeStr = istTime.toTimeString().split(' ')[0].substring(0, 5);
    
    console.log('Updating existing reminder to current time:', dateStr, timeStr);
    
    const result = await pool.query(
      'UPDATE reminders SET scheduled_date = $1, scheduled_time = $2, recipient_email = $3, status = $4 WHERE id = $5 RETURNING *',
      [dateStr, timeStr, 'mr.pritam420@gmail.com', 'pending', '133337cc-0a45-41a3-9a4c-d9a2710d1457']
    );
    
    console.log('Reminder updated:', result.rows[0]);
    console.log('The automation system should pick this up within 1 minute and send the email to mr.pritam420@gmail.com');
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    await pool.end();
  }
}

testEmailSending();