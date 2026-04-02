import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const { Pool } = pg;

// Supabase PostgreSQL connection string
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.warn("WARNING: DATABASE_URL is not defined in your .env file.");
}

const pool = new Pool({
  connectionString,
  // Required so that the ssl connection to Supabase holds securely
  ssl: {
    rejectUnauthorized: false
  }
});

// Simple connectivity check
pool.connect()
  .then(() => console.log('Successfully connected to Supabase PostgreSQL database via raw pg Pool!'))
  .catch(err => console.error('Connection error with Supabase database:', err.stack));

export default pool;
