import { sql } from '@vercel/postgres';

// Initialize database tables
export async function initDatabase() {
  try {
    // Create waste_entries table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS waste_entries (
        id SERIAL PRIMARY KEY,
        amount_ml DECIMAL(10,2) NOT NULL,
        cost_dollars DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() AT TIME ZONE 'America/Toronto')
      )
    `;
  } catch (error) {
    console.error('Error initializing database:', error);
    // In development, if database connection fails, we'll handle it gracefully
    if (process.env.NODE_ENV === 'development') {
      console.log('Database connection failed in development mode. This is expected if environment variables are not set.');
    }
    throw error;
  }
}

export { sql };
