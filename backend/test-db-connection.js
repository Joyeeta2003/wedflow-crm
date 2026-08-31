const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test 1: SELECT NOW()
    const result1 = await pool.query('SELECT NOW()');
    console.log('✓ SELECT NOW():', result1.rows[0]);
    
    // Test 2: SELECT current_database(), current_user
    const result2 = await pool.query('SELECT current_database(), current_user');
    console.log('✓ SELECT current_database(), current_user:', result2.rows[0]);
    
    // Test 3: SELECT 1
    const result3 = await pool.query('SELECT 1');
    console.log('✓ SELECT 1:', result3.rows[0]);
    
    console.log('\n✓ DATABASE CONNECTION: PASS');
    
  } catch (error) {
    console.error('\n✗ DATABASE CONNECTION: FAIL');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
  } finally {
    await pool.end();
  }
}

testConnection();
