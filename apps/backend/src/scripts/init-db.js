import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { mkdirSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, "../../data/tasks.db");

// Create data directory if it doesn't exist
mkdirSync(dirname(dbPath), { recursive: true });

console.log("Initializing database...");

const db = new Database(dbPath);

// Enable foreign key support
db.pragma("foreign_keys = ON");

try {
  // Create tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      frequency_type TEXT DEFAULT 'daily',
      frequency_data TEXT DEFAULT '{}',
      frequency_time TEXT,
      completed BOOLEAN NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create task_completions table to track daily completions
  db.exec(`
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

  // Insert sample tasks if they don't exist
  const sampleTasks = [
    { id: "sample-0", text: "Make bed" },
    { id: "sample-1", text: "Take meds" },
    { id: "sample-2", text: "Meditate 5 minutes" },
    { id: "sample-3", text: "Go for a walk" },
    { id: "sample-4", text: "Daily check-in" },
  ];

  const insertTask = db.prepare(`
    INSERT OR IGNORE INTO tasks (id, text, frequency_type, frequency_data)
    VALUES (?, ?, 'daily', '{}')
  `);

  sampleTasks.forEach((task) => {
    insertTask.run(task.id, task.text);
  });

  // Create indexes for better performance
  db.exec(
    `CREATE INDEX IF NOT EXISTS idx_task_completions_date ON task_completions (completion_date)`,
  );
  db.exec(
    `CREATE INDEX IF NOT EXISTS idx_task_completions_task_id ON task_completions (task_id)`,
  );
  db.exec(
    `CREATE INDEX IF NOT EXISTS idx_tasks_frequency ON tasks (frequency_type)`,
  );

  db.exec(
    `CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks (completed)`,
  );

  console.log("Database initialized successfully!");
  console.log(`Database location: ${dbPath}`);
  console.log(`Sample tasks created: ${sampleTasks.length}`);
} catch (error) {
  console.error("Error initializing database:", error);
  process.exit(1);
} finally {
  db.close();
}
