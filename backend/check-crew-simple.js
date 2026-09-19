const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkCrewAssignments() {
  try {
    console.log('=== CHECKING CREW ASSIGNMENTS ===\n');

    const result = await pool.query(`
      SELECT ca.id, ca.staff_id, ca.booking_event_id, ca.assigned_role, 
             ca.assignment_date, ca.status, ca.created_at,
             u.staff_name, u.email, u.role as user_role,
             be.event_name, be.event_date
      FROM crew_assignments ca
      JOIN users u ON u.id = ca.staff_id
      JOIN booking_events be ON be.id = ca.booking_event_id
      ORDER BY ca.created_at DESC
      LIMIT 10
    `);
    
    console.log('Total crew assignments found:', result.rows.length);
    
    if (result.rows.length > 0) {
      console.log('\nCrew Assignments:');
      result.rows.forEach((row, index) => {
        console.log((index + 1) + '. ' + row.staff_name + ' as ' + row.assigned_role + ' for ' + row.event_name + ' - Status: ' + row.status);
      });
    } else {
      console.log('No crew assignments found in the database.');
    }
    
    console.log('\n=== CHECK COMPLETE ===');

  } catch (error) {
    console.error('Error checking crew assignments:', error.message);
  } finally {
    await pool.end();
  }
}

checkCrewAssignments();
