// Test Supabase connection independently
// Run with: node test-supabase.js

require('dotenv').config();
const { Pool } = require('pg');

console.log('🔧 Testing Supabase Connection...\n');

// Supabase configuration
const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 5432,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000,
};

console.log('📋 Configuration:');
console.log('Host:', dbConfig.host);
console.log('Port:', dbConfig.port);
console.log('Database:', dbConfig.database);
console.log('User:', dbConfig.user);
console.log('Password:', dbConfig.password ? '***hidden***' : 'NOT SET');
console.log('');

const pool = new Pool(dbConfig);

async function testConnection() {
  try {
    console.log('🔄 Connecting to Supabase...');
    const client = await pool.connect();
    
    console.log('✅ Connected successfully!');
    
    // Test basic query
    const result = await client.query('SELECT NOW(), version()');
    console.log('✅ Server time:', result.rows[0].now);
    console.log('✅ PostgreSQL version:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);
    
    // Test schema
    const schemaTest = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('✅ Tables found:', schemaTest.rows.length);
    schemaTest.rows.forEach(row => {
      console.log('  -', row.table_name);
    });
    
    // Test users table specifically
    try {
      const userCount = await client.query('SELECT COUNT(*) as count FROM users');
      console.log('✅ Users in database:', userCount.rows[0].count);
    } catch (err) {
      console.log('⚠️  Users table not accessible:', err.message);
    }
    
    client.release();
    console.log('\n🎉 Supabase connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.error('💡 Fix: Check your DB_PASSWORD in .env file');
    } else if (error.message.includes('could not connect to server')) {
      console.error('💡 Fix: Check your DB_HOST and internet connection');
    } else if (error.message.includes('timeout')) {
      console.error('💡 Fix: Connection timeout - check your network or Supabase status');
    }
  } finally {
    await pool.end();
  }
}

testConnection();