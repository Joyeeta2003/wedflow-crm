const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkPackageData() {
  try {
    console.log('=== CHECKING PACKAGE CREW PLAN DATA ===\n');

    // Check package_days
    const packageDays = await pool.query('SELECT * FROM package_days LIMIT 5');
    console.log('Package Days:', packageDays.rows.length, 'rows');
    if (packageDays.rows.length > 0) {
      console.log('Sample:', JSON.stringify(packageDays.rows[0], null, 2));
    }

    // Check package_day_crew
    const packageDayCrew = await pool.query('SELECT * FROM package_day_crew LIMIT 5');
    console.log('\nPackage Day Crew:', packageDayCrew.rows.length, 'rows');
    if (packageDayCrew.rows.length > 0) {
      console.log('Sample:', JSON.stringify(packageDayCrew.rows[0], null, 2));
    }

    // Check crew_types
    const crewTypes = await pool.query('SELECT * FROM crew_types LIMIT 5');
    console.log('\nCrew Types:', crewTypes.rows.length, 'rows');
    if (crewTypes.rows.length > 0) {
      console.log('Sample:', JSON.stringify(crewTypes.rows[0], null, 2));
    }

    // Check a specific booking
    const booking = await pool.query('SELECT id, package_id, booking_number FROM bookings LIMIT 1');
    console.log('\nBookings:', booking.rows.length, 'rows');
    if (booking.rows.length > 0) {
      console.log('Sample booking:', JSON.stringify(booking.rows[0], null, 2));
      
      // Check the package_crew_plan for this booking
      const bookingId = booking.rows[0].id;
      const packageId = booking.rows[0].package_id;
      console.log('\nChecking package_crew_plan for booking:', bookingId, 'with package:', packageId);
      
      const crewPlan = await pool.query(`
        SELECT json_agg(json_build_object(
          'day_number', pd.day_number, 'event_type', pd.event_type,
          'roles', COALESCE((SELECT json_agg(json_build_object('role', ct.name, 'quantity', pdc.quantity))
                FROM package_day_crew pdc JOIN crew_types ct ON ct.id = pdc.crew_type_id
                WHERE pdc.package_day_id = pd.id), '[]'))
        ORDER BY pd.day_number) as crew_plan
        FROM package_days pd WHERE pd.package_id = $1 AND pd.workspace_id = (SELECT workspace_id FROM bookings WHERE id = $2)
      `, [packageId, bookingId]);
      
      console.log('Package Crew Plan Result:', JSON.stringify(crewPlan.rows[0], null, 2));
    }

    console.log('\n=== CHECK COMPLETE ===');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkPackageData();
