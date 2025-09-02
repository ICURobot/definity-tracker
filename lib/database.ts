import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'definity-tracker.db');
const db = new Database(dbPath);

// Initialize database tables
export function initDatabase() {
  // Waste entries table (simplified - no user authentication)
  db.exec(`
    CREATE TABLE IF NOT EXISTS waste_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount_ml REAL NOT NULL,
      cost_dollars REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export default db;
