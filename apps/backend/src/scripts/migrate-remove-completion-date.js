import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database path
const dbPath = process.env.DB_PATH || join(__dirname, "../../data/tasks.db");

console.log(
  "🔄 Starting migration: Remove completion_date column from task_completions table",
);
console.log(`Database path: ${dbPath}`);

try {
  const db = new Database(dbPath);

  // Check if completion_date column exists
  const tableInfo = db.prepare("PRAGMA table_info(task_completions)").all();
  const hasCompletionDateColumn = tableInfo.some(
    (column) => column.name === "completion_date",
  );

  if (!hasCompletionDateColumn) {
    console.log(
      "✅ completion_date column does not exist in task_completions table",
    );
    db.close();
    process.exit(0);
  }

  console.log(
    "🔧 Removing completion_date column from task_completions table...",
  );

  // SQLite doesn't support DROP COLUMN directly, so we need to recreate the table
  // Start a transaction for safety
  db.exec("BEGIN TRANSACTION");

  try {
    // Create new table without completion_date column
    console.log(
      "📝 Creating new task_completions table without completion_date...",
    );
    db.exec(`
      CREATE TABLE task_completions_new (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        completed_at TEXT NOT NULL,
        FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
      )
    `);

    // Copy data from old table to new table
    console.log("📋 Copying existing completion data...");
    db.exec(`
      INSERT INTO task_completions_new (id, task_id, completed_at)
      SELECT id, task_id, completed_at FROM task_completions
    `);

    // Get count of copied records
    const oldCount = db
      .prepare("SELECT COUNT(*) as count FROM task_completions")
      .get().count;
    const newCount = db
      .prepare("SELECT COUNT(*) as count FROM task_completions_new")
      .get().count;

    console.log(
      `📊 Copied ${newCount} completion records (original: ${oldCount})`,
    );

    if (oldCount !== newCount) {
      throw new Error(
        `Data copy failed: expected ${oldCount} records, got ${newCount}`,
      );
    }

    // Drop old table
    console.log("🗑️ Dropping old task_completions table...");
    db.exec("DROP TABLE task_completions");

    // Rename new table
    console.log("🔄 Renaming new table to task_completions...");
    db.exec("ALTER TABLE task_completions_new RENAME TO task_completions");

    // Recreate indexes
    console.log("📇 Recreating indexes...");
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_task_completions_task_id
      ON task_completions (task_id)
    `);

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_task_completions_completed_at
      ON task_completions (completed_at)
    `);

    // Commit the transaction
    db.exec("COMMIT");

    console.log(
      "✅ Successfully removed completion_date column from task_completions table",
    );

    // Verify the new structure
    const newTableInfo = db
      .prepare("PRAGMA table_info(task_completions)")
      .all();
    console.log("\n📋 New table structure:");
    newTableInfo.forEach((column) => {
      console.log(
        `  - ${column.name}: ${column.type}${column.pk ? " (PRIMARY KEY)" : ""}${column.notnull ? " NOT NULL" : ""}`,
      );
    });

    // Show completion counts by date for verification
    console.log("\n📊 Completion summary (last 7 days):");
    const completions = db
      .prepare(
        `
      SELECT
        DATE(completed_at) as completion_date,
        COUNT(*) as count
      FROM task_completions
      WHERE completed_at >= DATE('now', '-7 days')
      GROUP BY DATE(completed_at)
      ORDER BY completion_date DESC
    `,
      )
      .all();

    if (completions.length > 0) {
      completions.forEach((row) => {
        console.log(`  ${row.completion_date}: ${row.count} completions`);
      });
    } else {
      console.log("  No completions in the last 7 days");
    }
  } catch (error) {
    // Rollback on error
    db.exec("ROLLBACK");
    throw error;
  }

  db.close();
  console.log("\n🎉 Migration completed successfully!");
} catch (error) {
  console.error("\n❌ Migration failed:", error.message);
  console.error("Stack trace:", error.stack);
  process.exit(1);
}
