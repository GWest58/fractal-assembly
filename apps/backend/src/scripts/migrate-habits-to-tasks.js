import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync, copyFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const oldDbPath = join(__dirname, "../../data/habits.db");
const newDbPath = join(__dirname, "../../data/tasks.db");
const backupDbPath = join(__dirname, "../../data/habits.db.backup");

console.log("🔄 Starting migration from habits to tasks...");

// Check if old database exists
if (!existsSync(oldDbPath)) {
  console.log("ℹ️  No habits.db found. Creating new tasks.db from scratch...");

  // Run the init script to create new database
  const { execSync } = await import("child_process");
  try {
    execSync("node src/scripts/init-db.js", {
      cwd: join(__dirname, "../.."),
      stdio: "inherit"
    });
    console.log("✅ New tasks.db created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create new database:", error);
    process.exit(1);
  }
}

// Create backup of original database
console.log("📦 Creating backup of habits.db...");
try {
  copyFileSync(oldDbPath, backupDbPath);
  console.log(`✅ Backup created: ${backupDbPath}`);
} catch (error) {
  console.error("❌ Failed to create backup:", error);
  process.exit(1);
}

let oldDb, newDb;

try {
  // Open connections to both databases
  oldDb = new Database(oldDbPath);
  newDb = new Database(newDbPath);

  // Enable foreign keys for both
  oldDb.pragma("foreign_keys = ON");
  newDb.pragma("foreign_keys = ON");

  console.log("🔗 Connected to both databases");

  // Check if old database has the expected tables
  const tablesCheck = oldDb.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name IN ('habits', 'habit_completions')
  `).all();

  if (tablesCheck.length === 0) {
    console.log("ℹ️  No habits tables found in old database. Creating new tasks.db...");

    // Close connections
    oldDb.close();
    newDb.close();

    // Run init script
    const { execSync } = await import("child_process");
    execSync("node src/scripts/init-db.js", {
      cwd: join(__dirname, "../.."),
      stdio: "inherit"
    });
    console.log("✅ Migration completed!");
    process.exit(0);
  }

  console.log("📋 Found tables to migrate:", tablesCheck.map(t => t.name).join(", "));

  // Create new tasks tables in the new database
  console.log("🏗️  Creating new tasks tables...");

  newDb.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      frequency_type TEXT DEFAULT 'daily',
      frequency_data TEXT DEFAULT '{}',
      frequency_time TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  newDb.exec(`
    CREATE TABLE IF NOT EXISTS task_completions (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      completed_at DATETIME NOT NULL,
      completion_date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
      UNIQUE(task_id, completion_date)
    )
  `);

  console.log("✅ New tables created");

  // Migrate habits to tasks
  console.log("📊 Migrating habits to tasks...");

  const habits = oldDb.prepare("SELECT * FROM habits").all();
  console.log(`Found ${habits.length} habits to migrate`);

  const insertTask = newDb.prepare(`
    INSERT OR REPLACE INTO tasks
    (id, text, frequency_type, frequency_data, frequency_time, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  let tasksMigrated = 0;
  for (const habit of habits) {
    insertTask.run(
      habit.id,
      habit.text,
      habit.frequency_type || 'daily',
      habit.frequency_data || '{}',
      habit.frequency_time,
      habit.created_at,
      habit.updated_at
    );
    tasksMigrated++;
  }

  console.log(`✅ Migrated ${tasksMigrated} tasks`);

  // Migrate habit_completions to task_completions
  console.log("📊 Migrating habit completions to task completions...");

  // Check if habit_completions table exists
  const completionsTableExists = oldDb.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name='habit_completions'
  `).get();

  if (completionsTableExists) {
    const completions = oldDb.prepare("SELECT * FROM habit_completions").all();
    console.log(`Found ${completions.length} completions to migrate`);

    const insertCompletion = newDb.prepare(`
      INSERT OR REPLACE INTO task_completions
      (id, task_id, completed_at, completion_date, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    let completionsMigrated = 0;
    for (const completion of completions) {
      insertCompletion.run(
        completion.id,
        completion.habit_id, // Map habit_id to task_id
        completion.completed_at,
        completion.completion_date,
        completion.created_at
      );
      completionsMigrated++;
    }

    console.log(`✅ Migrated ${completionsMigrated} completions`);
  } else {
    console.log("ℹ️  No habit_completions table found, skipping completions migration");
  }

  // Create indexes for better performance
  console.log("🔧 Creating indexes...");

  newDb.exec(`CREATE INDEX IF NOT EXISTS idx_task_completions_date ON task_completions (completion_date)`);
  newDb.exec(`CREATE INDEX IF NOT EXISTS idx_task_completions_task_id ON task_completions (task_id)`);
  newDb.exec(`CREATE INDEX IF NOT EXISTS idx_tasks_frequency ON tasks (frequency_type)`);

  console.log("✅ Indexes created");

  // Verify migration
  console.log("🔍 Verifying migration...");

  const newTasksCount = newDb.prepare("SELECT COUNT(*) as count FROM tasks").get().count;
  const newCompletionsCount = newDb.prepare("SELECT COUNT(*) as count FROM task_completions").get().count;

  console.log(`📊 Migration Summary:`);
  console.log(`   - Tasks migrated: ${newTasksCount}`);
  console.log(`   - Completions migrated: ${newCompletionsCount}`);
  console.log(`   - Original database backed up to: ${backupDbPath}`);

  console.log("✅ Migration completed successfully!");
  console.log("🚀 You can now start using the new tasks API!");

} catch (error) {
  console.error("❌ Migration failed:", error);
  process.exit(1);
} finally {
  // Close database connections
  if (oldDb) {
    try {
      oldDb.close();
    } catch (e) {
      console.error("Error closing old database:", e);
    }
  }
  if (newDb) {
    try {
      newDb.close();
    } catch (e) {
      console.error("Error closing new database:", e);
    }
  }
}
