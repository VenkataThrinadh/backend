const { Pool } = require('pg');
require('dotenv').config();

// Supabase PostgreSQL configuration
const dbConfig = {
  user: process.env.DB_USER || 'postgres.httunzkqciaxlmasyveb',
  host: process.env.DB_HOST || 'aws-0-ap-south-1.pooler.supabase.com',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || 'ThrinadhH!1999',
  port: parseInt(process.env.DB_PORT) || 5432,
  // Supabase requires SSL
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 30000,
  max: 10, // Reduced connection pool size for better stability
  min: 1,  // Minimum number of connections in the pool
  acquireTimeoutMillis: 60000,
  createTimeoutMillis: 30000,
  destroyTimeoutMillis: 5000,
  reapIntervalMillis: 1000,
  createRetryIntervalMillis: 200,
};

const pool = new Pool(dbConfig);

// Enhanced error handling for Supabase
pool.on('error', (err, client) => {
  console.error('❌ Unexpected error on idle client:', err.message);
  console.error('❌ This might be a Supabase connection issue. Check your credentials and network.');
  
  // Don't exit the process in production, just log the error
  if (process.env.NODE_ENV !== 'production') {
    console.error('❌ Full error details:', err);
  }
});

// Test Supabase connection with retry logic
const testConnection = async (retries = 3) => {
  console.log('🔄 Testing Supabase PostgreSQL connection...');
  
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      
      // Test basic connectivity
      const result = await client.query('SELECT NOW(), version()');
      const now = result.rows[0].now;
      const version = result.rows[0].version;
      
      // Test if our schema exists
      const schemaTest = await client.query(`
        SELECT COUNT(*) as table_count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'properties', 'land_blocks', 'land_plots')
      `);
      
      client.release();
      
      console.log('✅ Supabase PostgreSQL connected successfully!');
      console.log('✅ Server time:', now);
      console.log('✅ PostgreSQL version:', version.split(' ')[0] + ' ' + version.split(' ')[1]);
      console.log('✅ Database:', process.env.DB_NAME || 'postgres');
      console.log('✅ Host:', process.env.DB_HOST || 'aws-0-ap-south-1.pooler.supabase.com');
      console.log('✅ Port:', process.env.DB_PORT || '5432');
      console.log('✅ User:', process.env.DB_USER || 'postgres.httunzkqciaxlmasyveb');
      console.log('✅ Schema tables found:', schemaTest.rows[0].table_count);
      
      if (parseInt(schemaTest.rows[0].table_count) < 4) {
        console.warn('⚠️  Warning: Some expected tables are missing. You may need to run the schema migration.');
      }
      
      return; // Success, exit the function
      
    } catch (err) {
      console.error(`❌ Supabase connection attempt ${i + 1} failed:`, err.message);
      
      // Provide specific error guidance
      if (err.message.includes('password authentication failed')) {
        console.error('❌ Authentication failed. Please check your DB_PASSWORD in .env file');
      } else if (err.message.includes('could not connect to server')) {
        console.error('❌ Cannot reach Supabase server. Please check your DB_HOST and internet connection');
      } else if (err.message.includes('database') && err.message.includes('does not exist')) {
        console.error('❌ Database does not exist. Please check your DB_NAME in .env file');
      }
      
      if (i === retries - 1) {
        console.error('❌ All Supabase connection attempts failed');
        console.error('❌ Please verify your Supabase credentials and ensure your project is active');
        console.error('❌ Check the following in your .env file:');
        console.error('   - DB_HOST: aws-0-ap-south-1.pooler.supabase.com');
        console.error('   - DB_PORT: 5432 (Session Pooler)');
        console.error('   - DB_PASSWORD: ThrinadhH!1999');
        console.error('   - DB_USER: postgres.httunzkqciaxlmasyveb');
        console.error('   - DB_NAME: postgres');
        
        // In production, don't exit - let the app try to reconnect later
        if (process.env.NODE_ENV !== 'production') {
          process.exit(1);
        }
      } else {
        // Wait before retrying
        console.log(`⏳ Retrying in 3 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }
};

// Test connection on startup
testConnection();

module.exports = { pool };