import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, "../../data/habits.db");

console.log("Running migration: Remove category and is_foundational columns...");

const db = new Database(dbPath);

// Enable foreign key support
db.pragma("foreign_keys = ON");

try {
  // Check if columns exist
  const tableInfo = db.prepare("PRAGMA table_info(habits)").all();
  const hasCategory = tableInfo.some((col) => col.name === "category");
  const hasIsFoundational = tableInfo.some((col) => col.name === "is_foundational");

  if (!hasCategory && !hasIsFoundational) {
    console.log("Columns already removed. Migration skipped.");
    process.exit(0);
  }

  // Begin transaction
  db.exec("BEGIN TRANSACTION");

  // Create new table without category and is_foundational columns
  db.exec(`
    CREATE TABLE habits_new (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      frequency_type TEXT DEFAULT 'daily',
      frequency_data TEXT DEFAULT '{}',
      frequency_time TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Copy data from old table to new table
  db.exec(`
    INSERT INTO habits_new (id, text, frequency_type, frequency_data, frequency_time, created_at, updated_at)
    SELECT id, text, frequency_type, frequency_data, frequency_time, created_at, updated_at
    FROM habits
  `);

  // Drop old table
  db.exec("DROP TABLE habits");

  // Rename new table
  db.exec("ALTER TABLE habits_new RENAME TO habits");

  // Recreate indexes
  db.exec(
    `CREATE INDEX IF NOT EXISTS idx_habits_frequency ON habits (frequency_type)`
  );

  // Commit transaction
  db.exec("COMMIT");

  console.log("Migration completed successfully!");
  console.log("Removed category and is_foundational columns from habits table");

} catch (error) {
  console.error("Error running migration:", error);
  // Rollback on error
  try {
    db.exec("ROLLBACK");
  } catch (rollbackError) {
    console.error("Error during rollback:", rollbackError);
  }
  process.exit(1);
} finally {
  db.close();
}
