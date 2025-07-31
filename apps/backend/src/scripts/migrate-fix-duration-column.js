import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, "../../data/tasks.db");

console.log("Fixing duration column name from minutes to seconds...");

const db = new Database(dbPath);

// Enable foreign key support
db.pragma("foreign_keys = ON");

try {
  // Check what columns exist
  const tableInfo = db.prepare("PRAGMA table_info(tasks)").all();
  const hasDurationMinutes = tableInfo.some(col => col.name === 'duration_minutes');
  const hasDurationSeconds = tableInfo.some(col => col.name === 'duration_seconds');

  if (hasDurationMinutes && !hasDurationSeconds) {
    // First add the new column
    db.exec(`
      ALTER TABLE tasks
      ADD COLUMN duration_seconds INTEGER NULL
    `);
    console.log("Added duration_seconds column");

    // Copy data from minutes to seconds (multiply by 60)
    db.exec(`
      UPDATE tasks
      SET duration_seconds = duration_minutes * 60
      WHERE duration_minutes IS NOT NULL
    `);
    console.log("Copied duration data from minutes to seconds");

    // Note: SQLite doesn't support DROP COLUMN in older versions
    // We'll leave the old column for now, but use duration_seconds going forward
    console.log("Note: duration_minutes column left for compatibility, but duration_seconds will be used");

  } else if (!hasDurationMinutes && !hasDurationSeconds) {
    // Add the correct column if neither exists
    db.exec(`
      ALTER TABLE tasks
      ADD COLUMN duration_seconds INTEGER NULL
    `);
    console.log("Added duration_seconds column");

  } else {
    console.log("duration_seconds column already exists or migration not needed");
  }

  console.log("Duration column fix completed successfully!");

} catch (error) {
  console.error("Error during migration:", error);
  process.exit(1);
} finally {
  db.close();
}
