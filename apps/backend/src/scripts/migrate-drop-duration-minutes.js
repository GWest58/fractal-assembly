import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, "../../data/tasks.db");

console.log("Dropping duration_minutes column from tasks table...");

const db = new Database(dbPath);

// Enable foreign key support
db.pragma("foreign_keys = ON");

try {
  // Check if the duration_minutes column exists
  const tableInfo = db.prepare("PRAGMA table_info(tasks)").all();
  const hasDurationMinutes = tableInfo.some(col => col.name === 'duration_minutes');

  if (hasDurationMinutes) {
    console.log("Found duration_minutes column, proceeding with migration...");

    // SQLite doesn't support DROP COLUMN directly in older versions
    // We need to create a new table without the column and copy data over

    // Step 1: Create new table without duration_minutes
    db.exec(`
      CREATE TABLE tasks_new (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        frequency_type TEXT DEFAULT 'daily',
        frequency_data TEXT DEFAULT '{}',
        frequency_time TEXT,
        completed BOOLEAN NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        duration_seconds INTEGER NULL,
        timer_started_at DATETIME NULL,
        timer_status TEXT DEFAULT 'not_started' CHECK (timer_status IN ('not_started', 'running', 'paused', 'completed'))
      )
    `);

    // Step 2: Copy data from old table to new table (excluding duration_minutes)
    db.exec(`
      INSERT INTO tasks_new (
        id, text, frequency_type, frequency_data, frequency_time,
        completed, created_at, updated_at, duration_seconds,
        timer_started_at, timer_status
      )
      SELECT
        id, text, frequency_type, frequency_data, frequency_time,
        completed, created_at, updated_at, duration_seconds,
        timer_started_at, timer_status
      FROM tasks
    `);

    // Step 3: Drop old table
    db.exec(`DROP TABLE tasks`);

    // Step 4: Rename new table to original name
    db.exec(`ALTER TABLE tasks_new RENAME TO tasks`);

    // Step 5: Recreate indexes
    db.exec(`CREATE INDEX IF NOT EXISTS idx_task_completions_date ON task_completions (completion_date)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_task_completions_task_id ON task_completions (task_id)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_tasks_frequency ON tasks (frequency_type)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks (completed)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_tasks_timer_status ON tasks (timer_status)`);

    console.log("Successfully dropped duration_minutes column");
  } else {
    console.log("duration_minutes column not found, no migration needed");
  }

  console.log("Migration completed successfully!");

} catch (error) {
  console.error("Error during migration:", error);
  process.exit(1);
} finally {
  db.close();
}
