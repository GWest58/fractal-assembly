import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, "../../data/tasks.db");

console.log("Adding duration and timer fields to tasks table...");

const db = new Database(dbPath);

// Enable foreign key support
db.pragma("foreign_keys = ON");

try {
  // Check if the duration_minutes column already exists
  const tableInfo = db.prepare("PRAGMA table_info(tasks)").all();
  const hasDurationSeconds = tableInfo.some(
    (col) => col.name === "duration_seconds",
  );
  const hasTimerStartedAt = tableInfo.some(
    (col) => col.name === "timer_started_at",
  );
  const hasTimerStatus = tableInfo.some((col) => col.name === "timer_status");

  if (!hasDurationSeconds) {
    db.exec(`
      ALTER TABLE tasks
      ADD COLUMN duration_seconds INTEGER NULL
    `);
    console.log("Added duration_seconds column");
  } else {
    console.log("duration_seconds column already exists");
  }

  if (!hasTimerStartedAt) {
    db.exec(`
      ALTER TABLE tasks
      ADD COLUMN timer_started_at DATETIME NULL
    `);
    console.log("Added timer_started_at column");
  } else {
    console.log("timer_started_at column already exists");
  }

  if (!hasTimerStatus) {
    db.exec(`
      ALTER TABLE tasks
      ADD COLUMN timer_status TEXT DEFAULT 'not_started' CHECK (timer_status IN ('not_started', 'running', 'paused', 'completed'))
    `);
    console.log("Added timer_status column");
  } else {
    console.log("timer_status column already exists");
  }

  // Create index for timer queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tasks_timer_status ON tasks (timer_status)
  `);

  console.log("Duration and timer migration completed successfully!");
} catch (error) {
  console.error("Error during migration:", error);
  process.exit(1);
} finally {
  db.close();
}
