const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setupCrewPlan() {
  try {
    console.log('=== SETTING UP PACKAGE CREW PLAN ===\n');

    // Get the ROYAL WEDDING PACKAGE
    const pkg = await pool.query('SELECT id, workspace_id FROM packages WHERE name = $1', ['ROYAL WEDDING PACKAGE']);
    if (pkg.rows.length === 0) {
      console.log('Package not found');
      return;
    }
    const pkgId = pkg.rows[0].id;
    const wsId = pkg.rows[0].workspace_id;
    console.log('Package ID:', pkgId, 'Workspace ID:', wsId);

    // Get crew type IDs
    const photo = await pool.query('SELECT id FROM crew_types WHERE name = $1', ['Photographer']);
    const cine = await pool.query('SELECT id FROM crew_types WHERE name = $1', ['Cinematographer']);
    const drone = await pool.query('SELECT id FROM crew_types WHERE name = $1', ['Drone Operator']);
    
    console.log('Crew type IDs:', { 
      photo: photo.rows[0]?.id, 
      cine: cine.rows[0]?.id, 
      drone: drone.rows[0]?.id 
    });

    // Create package days
    const day1 = await pool.query(
      'INSERT INTO package_days (id, package_id, day_number, event_type, workspace_id) VALUES (gen_random_uuid(), $1, 1, $2, $3) RETURNING id',
      [pkgId, 'Mehendi', wsId]
    );
    const day2 = await pool.query(
      'INSERT INTO package_days (id, package_id, day_number, event_type, workspace_id) VALUES (gen_random_uuid(), $1, 2, $2, $3) RETURNING id',
      [pkgId, 'Wedding', wsId]
    );
    const day3 = await pool.query(
      'INSERT INTO package_days (id, package_id, day_number, event_type, workspace_id) VALUES (gen_random_uuid(), $1, 3, $2, $3) RETURNING id',
      [pkgId, 'Reception', wsId]
    );

    console.log('Created package days:', { 
      day1: day1.rows[0].id, 
      day2: day2.rows[0].id, 
      day3: day3.rows[0].id 
    });

    // Add crew assignments for each day
    // Mehendi: 3 Photographers, 2 Cinematographers
    if (photo.rows[0]) {
      await pool.query(
        'INSERT INTO package_day_crew (id, package_day_id, crew_type_id, quantity, workspace_id) VALUES (gen_random_uuid(), $1, $2, 3, $3)',
        [day1.rows[0].id, photo.rows[0].id, wsId]
      );
    }
    if (cine.rows[0]) {
      await pool.query(
        'INSERT INTO package_day_crew (id, package_day_id, crew_type_id, quantity, workspace_id) VALUES (gen_random_uuid(), $1, $2, 2, $3)',
        [day1.rows[0].id, cine.rows[0].id, wsId]
      );
    }

    // Wedding: 3 Photographers, 1 Cinematographer, 1 Drone Operator
    if (photo.rows[0]) {
      await pool.query(
        'INSERT INTO package_day_crew (id, package_day_id, crew_type_id, quantity, workspace_id) VALUES (gen_random_uuid(), $1, $2, 3, $3)',
        [day2.rows[0].id, photo.rows[0].id, wsId]
      );
    }
    if (cine.rows[0]) {
      await pool.query(
        'INSERT INTO package_day_crew (id, package_day_id, crew_type_id, quantity, workspace_id) VALUES (gen_random_uuid(), $1, $2, 1, $3)',
        [day2.rows[0].id, cine.rows[0].id, wsId]
      );
    }
    if (drone.rows[0]) {
      await pool.query(
        'INSERT INTO package_day_crew (id, package_day_id, crew_type_id, quantity, workspace_id) VALUES (gen_random_uuid(), $1, $2, 1, $3)',
        [day2.rows[0].id, drone.rows[0].id, wsId]
      );
    }

    // Reception: 2 Photographers
    if (photo.rows[0]) {
      await pool.query(
        'INSERT INTO package_day_crew (id, package_day_id, crew_type_id, quantity, workspace_id) VALUES (gen_random_uuid(), $1, $2, 2, $3)',
        [day3.rows[0].id, photo.rows[0].id, wsId]
      );
    }

    console.log('Package crew plan data created successfully');

    // Verify the data
    const result = await pool.query(`
      SELECT pd.day_number, pd.event_type, ct.name as crew_type, pdc.quantity 
      FROM package_days pd 
      LEFT JOIN package_day_crew pdc ON pdc.package_day_id = pd.id 
      LEFT JOIN crew_types ct ON ct.id = pdc.crew_type_id 
      WHERE pd.package_id = $1 
      ORDER BY pd.day_number
    `, [pkgId]);

    console.log('\nVerification:');
    result.rows.forEach(r => {
      console.log(`- Day ${r.day_number} ${r.event_type}: ${r.crew_type} x${r.quantity}`);
    });

    console.log('\n=== SETUP COMPLETE ===');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

setupCrewPlan();