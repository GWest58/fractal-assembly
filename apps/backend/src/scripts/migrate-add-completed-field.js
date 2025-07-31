import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database path
const dbPath = process.env.DB_PATH || join(__dirname, "../../data/tasks.db");

console.log("🔄 Starting migration: Add completed field to tasks table");
console.log(`📁 Database path: ${dbPath}`);

try {
  // Connect to database
  const db = new Database(dbPath);

  // Enable foreign keys
  db.pragma("foreign_keys = ON");

  console.log("📊 Checking current schema...");

  // Check if completed column already exists
  const tableInfo = db.prepare("PRAGMA table_info(tasks)").all();
  const hasCompletedField = tableInfo.some(column => column.name === 'completed');

  if (hasCompletedField) {
    console.log("✅ Completed field already exists in tasks table");
    db.close();
    process.exit(0);
  }

  console.log("🔧 Adding completed field to tasks table...");

  // Add completed column with default value of 0 (false)
  db.exec(`
    ALTER TABLE tasks
    ADD COLUMN completed BOOLEAN NOT NULL DEFAULT 0
  `);

  console.log("✅ Added completed field to tasks table");

  // Verify the column was added
  const updatedTableInfo = db.prepare("PRAGMA table_info(tasks)").all();
  const completedField = updatedTableInfo.find(column => column.name === 'completed');

  if (completedField) {
    console.log(`✅ Verified completed field exists with type: ${completedField.type}, default: ${completedField.dflt_value}`);
  } else {
    throw new Error("Failed to add completed field");
  }

  // Check if there are any existing one-time tasks (frequency_type IS NULL)
  const oneTimeTasks = db.prepare(`
    SELECT id, text, frequency_type
    FROM tasks
    WHERE frequency_type IS NULL
  `).all();

  console.log(`📋 Found ${oneTimeTasks.length} existing one-time tasks`);

  if (oneTimeTasks.length > 0) {
    console.log("📝 One-time tasks found:");
    oneTimeTasks.forEach((task, index) => {
      console.log(`  ${index + 1}. ${task.text} (ID: ${task.id})`);
    });
    console.log("💡 These tasks will default to completed=false (0)");
  }

  // Create an index on the completed field for better performance
  console.log("🔗 Creating index on completed field...");
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks (completed)
  `);

  console.log("✅ Created index on completed field");

  // Display final schema
  console.log("📋 Final tasks table schema:");
  const finalSchema = db.prepare("PRAGMA table_info(tasks)").all();
  finalSchema.forEach(column => {
    console.log(`  ${column.name}: ${column.type}${column.notnull ? ' NOT NULL' : ''}${column.dflt_value !== null ? ` DEFAULT ${column.dflt_value}` : ''}`);
  });

  // Close database connection
  db.close();

  console.log("✅ Migration completed successfully!");
  console.log("💡 One-time tasks can now be marked as completed using the completed field");

} catch (error) {
  console.error("❌ Migration failed:", error.message);
  console.error(error.stack);
  process.exit(1);
}
