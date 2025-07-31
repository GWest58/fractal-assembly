import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, "../../data/habits.db");

console.log("Running migration: Add frequency fields to habits table...");

const db = new Database(dbPath);

// Enable foreign key support
db.pragma("foreign_keys = ON");

try {
  // Check if frequency columns already exist
  const tableInfo = db.prepare("PRAGMA table_info(habits)").all();
  const hasFrequencyType = tableInfo.some(
    (col) => col.name === "frequency_type",
  );

  if (hasFrequencyType) {
    console.log("Frequency columns already exist. Migration skipped.");
    process.exit(0);
  }

  // Begin transaction
  db.exec("BEGIN TRANSACTION");

  // Add frequency columns to habits table
  db.exec(`
    ALTER TABLE habits ADD COLUMN frequency_type TEXT DEFAULT 'daily'
  `);

  db.exec(`
    ALTER TABLE habits ADD COLUMN frequency_data TEXT DEFAULT '{}'
  `);

  db.exec(`
    ALTER TABLE habits ADD COLUMN frequency_time TEXT
  `);

  // Update existing habits to have default daily frequency
  db.exec(`
    UPDATE habits
    SET frequency_type = 'daily', frequency_data = '{}'
    WHERE frequency_type IS NULL
  `);

  // Commit transaction
  db.exec("COMMIT");

  console.log("Migration completed successfully!");
  console.log(
    "Added frequency_type, frequency_data, and frequency_time columns to habits table",
  );
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
