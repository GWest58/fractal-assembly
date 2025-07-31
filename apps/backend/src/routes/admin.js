import express from "express";
import database from "../models/database.js";

const router = express.Router();

// HTML template for the admin interface
const adminTemplate = (title, content) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Fractal Assembly Admin</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: #FF6B35;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .nav {
            background: #f8f9fa;
            padding: 15px 20px;
            border-bottom: 1px solid #e9ecef;
        }
        .nav a {
            color: #007bff;
            text-decoration: none;
            margin-right: 20px;
            padding: 8px 12px;
            border-radius: 4px;
            transition: background-color 0.2s;
        }
        .nav a:hover {
            background-color: #e9ecef;
        }
        .content {
            padding: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            text-align: left;
            padding: 12px 8px;
            border-bottom: 1px solid #e9ecef;
        }
        th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #495057;
        }
        tr:hover {
            background-color: #f8f9fa;
        }
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .badge-foundational {
            background-color: #FF6B35;
            color: white;
        }
        .badge-regular {
            background-color: #6c757d;
            color: white;
        }
        .badge-health { background-color: #28a745; color: white; }
        .badge-wellness { background-color: #17a2b8; color: white; }
        .badge-productivity { background-color: #ffc107; color: #212529; }
        .badge-personal { background-color: #6f42c1; color: white; }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #FF6B35;
        }
        .stat-label {
            color: #6c757d;
            margin-top: 5px;
        }
        .query-form {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .query-form textarea {
            width: 100%;
            min-height: 100px;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
        }
        .query-form button {
            background: #FF6B35;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
        }
        .query-form button:hover {
            background: #e55a2b;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 4px;
            margin: 10px 0;
        }
        .success {
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 4px;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔧 Fractal Assembly Database Admin</h1>
            <p>Database visualization and management interface</p>
        </div>
        <div class="nav">
            <a href="/admin">📊 Dashboard</a>
            <a href="/admin/habits">📋 Habits</a>
            <a href="/admin/completions">✅ Completions</a>
            <a href="/admin/query">💾 Query</a>
            <a href="/admin/schema">🏗️ Schema</a>
        </div>
        <div class="content">
            ${content}
        </div>
    </div>
</body>
</html>
`;

// Dashboard route
router.get("/", async (req, res) => {
  try {
    // Get basic statistics
    const totalHabits = await database.get("SELECT COUNT(*) as count FROM habits");
    const foundationalHabits = await database.get("SELECT COUNT(*) as count FROM habits WHERE is_foundational = 1");
    const totalCompletions = await database.get("SELECT COUNT(*) as count FROM habit_completions");
    const todayCompletions = await database.get(`
      SELECT COUNT(*) as count FROM habit_completions
      WHERE completion_date = date('now')
    `);
    const uniqueCompletionDays = await database.get("SELECT COUNT(DISTINCT completion_date) as count FROM habit_completions");

    // Get recent completions
    const recentCompletions = await database.all(`
      SELECT hc.*, h.text as habit_text, h.category
      FROM habit_completions hc
      JOIN habits h ON hc.habit_id = h.id
      ORDER BY hc.completed_at DESC
      LIMIT 10
    `);

    const content = `
      <h2>📊 Database Overview</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">${totalHabits.count}</div>
          <div class="stat-label">Total Habits</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${foundationalHabits.count}</div>
          <div class="stat-label">Foundational Habits</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${totalCompletions.count}</div>
          <div class="stat-label">Total Completions</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${todayCompletions.count}</div>
          <div class="stat-label">Today's Completions</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${uniqueCompletionDays.count}</div>
          <div class="stat-label">Active Days</div>
        </div>
      </div>

      <h3>🕒 Recent Completions</h3>
      <table>
        <thead>
          <tr>
            <th>Habit</th>
            <th>Category</th>
            <th>Completed At</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${recentCompletions.map(completion => `
            <tr>
              <td>${completion.habit_text}</td>
              <td><span class="badge badge-${completion.category}">${completion.category}</span></td>
              <td>${new Date(completion.completed_at).toLocaleString()}</td>
              <td>${completion.completion_date}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    res.send(adminTemplate("Dashboard", content));
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).send(adminTemplate("Error", `<div class="error">Error loading dashboard: ${error.message}</div>`));
  }
});

// Habits table view
router.get("/habits", async (req, res) => {
  try {
    const habits = await database.all(`
      SELECT h.*,
        COUNT(hc.id) as total_completions,
        MAX(hc.completed_at) as last_completed
      FROM habits h
      LEFT JOIN habit_completions hc ON h.id = hc.habit_id
      GROUP BY h.id
      ORDER BY h.is_foundational DESC, h.created_at ASC
    `);

    const content = `
      <h2>📋 All Habits</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Text</th>
            <th>Category</th>
            <th>Type</th>
            <th>Total Completions</th>
            <th>Last Completed</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          ${habits.map(habit => `
            <tr>
              <td><code>${habit.id}</code></td>
              <td><strong>${habit.text}</strong></td>
              <td><span class="badge badge-${habit.category}">${habit.category}</span></td>
              <td><span class="badge ${habit.is_foundational ? 'badge-foundational' : 'badge-regular'}">${habit.is_foundational ? 'Foundational' : 'Regular'}</span></td>
              <td>${habit.total_completions || 0}</td>
              <td>${habit.last_completed ? new Date(habit.last_completed).toLocaleDateString() : 'Never'}</td>
              <td>${new Date(habit.created_at).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    res.send(adminTemplate("Habits", content));
  } catch (error) {
    console.error("Admin habits error:", error);
    res.status(500).send(adminTemplate("Error", `<div class="error">Error loading habits: ${error.message}</div>`));
  }
});

// Completions table view
router.get("/completions", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const offset = (page - 1) * limit;

    const completions = await database.all(`
      SELECT hc.*, h.text as habit_text, h.category, h.is_foundational
      FROM habit_completions hc
      JOIN habits h ON hc.habit_id = h.id
      ORDER BY hc.completed_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    const totalCount = await database.get("SELECT COUNT(*) as count FROM habit_completions");
    const totalPages = Math.ceil(totalCount.count / limit);

    const content = `
      <h2>✅ Habit Completions</h2>
      <p>Showing ${completions.length} of ${totalCount.count} completions (Page ${page} of ${totalPages})</p>

      <div style="margin-bottom: 20px;">
        ${page > 1 ? `<a href="/admin/completions?page=${page - 1}" style="margin-right: 10px;">← Previous</a>` : ''}
        ${page < totalPages ? `<a href="/admin/completions?page=${page + 1}">Next →</a>` : ''}
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Habit</th>
            <th>Category</th>
            <th>Type</th>
            <th>Completion Date</th>
            <th>Completed At</th>
          </tr>
        </thead>
        <tbody>
          ${completions.map(completion => `
            <tr>
              <td><code>${completion.id}</code></td>
              <td><strong>${completion.habit_text}</strong></td>
              <td><span class="badge badge-${completion.category}">${completion.category}</span></td>
              <td><span class="badge ${completion.is_foundational ? 'badge-foundational' : 'badge-regular'}">${completion.is_foundational ? 'Foundational' : 'Regular'}</span></td>
              <td>${completion.completion_date}</td>
              <td>${new Date(completion.completed_at).toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    res.send(adminTemplate("Completions", content));
  } catch (error) {
    console.error("Admin completions error:", error);
    res.status(500).send(adminTemplate("Error", `<div class="error">Error loading completions: ${error.message}</div>`));
  }
});

// Database schema view
router.get("/schema", async (req, res) => {
  try {
    const tables = await database.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");

    let schemaContent = '<h2>🏗️ Database Schema</h2>';

    for (const table of tables) {
      const schema = await database.get(`SELECT sql FROM sqlite_master WHERE type='table' AND name=?`, [table.name]);
      const columns = await database.all(`PRAGMA table_info(${table.name})`);

      schemaContent += `
        <h3>Table: ${table.name}</h3>
        <table style="margin-bottom: 30px;">
          <thead>
            <tr>
              <th>Column</th>
              <th>Type</th>
              <th>Not Null</th>
              <th>Default</th>
              <th>Primary Key</th>
            </tr>
          </thead>
          <tbody>
            ${columns.map(col => `
              <tr>
                <td><code>${col.name}</code></td>
                <td>${col.type}</td>
                <td>${col.notnull ? 'Yes' : 'No'}</td>
                <td>${col.dflt_value || 'NULL'}</td>
                <td>${col.pk ? 'Yes' : 'No'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <details style="margin-bottom: 20px;">
          <summary>View SQL</summary>
          <pre style="background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto;"><code>${schema.sql}</code></pre>
        </details>
      `;
    }

    res.send(adminTemplate("Database Schema", schemaContent));
  } catch (error) {
    console.error("Admin schema error:", error);
    res.status(500).send(adminTemplate("Error", `<div class="error">Error loading schema: ${error.message}</div>`));
  }
});

// Custom query interface
router.get("/query", (req, res) => {
  const content = `
    <h2>💾 Custom SQL Query</h2>
    <div class="query-form">
      <form method="POST" action="/admin/query">
        <label for="sql">SQL Query:</label>
        <textarea name="sql" id="sql" placeholder="SELECT * FROM habits LIMIT 10;">${req.query.sql || ''}</textarea>
        <button type="submit">Execute Query</button>
      </form>
    </div>

    <h3>📚 Quick Queries</h3>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px;">
      <a href="/admin/query?sql=SELECT * FROM habits;" style="padding: 10px; background: #f8f9fa; border-radius: 4px; text-decoration: none; color: #333;">All Habits</a>
      <a href="/admin/query?sql=SELECT * FROM habit_completions ORDER BY completed_at DESC LIMIT 20;" style="padding: 10px; background: #f8f9fa; border-radius: 4px; text-decoration: none; color: #333;">Recent Completions</a>
      <a href="/admin/query?sql=SELECT h.text, COUNT(*) as completions FROM habits h JOIN habit_completions hc ON h.id = hc.habit_id GROUP BY h.id ORDER BY completions DESC;" style="padding: 10px; background: #f8f9fa; border-radius: 4px; text-decoration: none; color: #333;">Completion Stats</a>
      <a href="/admin/query?sql=SELECT completion_date, COUNT(*) as habits_completed FROM habit_completions GROUP BY completion_date ORDER BY completion_date DESC LIMIT 14;" style="padding: 10px; background: #f8f9fa; border-radius: 4px; text-decoration: none; color: #333;">Daily Progress</a>
    </div>
  `;

  res.send(adminTemplate("Query Interface", content));
});

router.post("/query", async (req, res) => {
  try {
    const { sql } = req.body;

    if (!sql || !sql.trim()) {
      throw new Error("SQL query is required");
    }

    // Basic safety check - only allow SELECT statements
    const trimmedSql = sql.trim().toLowerCase();
    if (!trimmedSql.startsWith('select') && !trimmedSql.startsWith('pragma')) {
      throw new Error("Only SELECT and PRAGMA statements are allowed for security reasons");
    }

    const results = await database.all(sql);

    let resultContent = '';
    if (results.length === 0) {
      resultContent = '<div class="success">Query executed successfully. No results returned.</div>';
    } else {
      const columns = Object.keys(results[0]);
      resultContent = `
        <div class="success">Query executed successfully. ${results.length} rows returned.</div>
        <table>
          <thead>
            <tr>
              ${columns.map(col => `<th>${col}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${results.map(row => `
              <tr>
                ${columns.map(col => `<td>${row[col] !== null ? row[col] : '<em>NULL</em>'}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    const content = `
      <h2>💾 Custom SQL Query</h2>
      <div class="query-form">
        <form method="POST" action="/admin/query">
          <label for="sql">SQL Query:</label>
          <textarea name="sql" id="sql">${sql}</textarea>
          <button type="submit">Execute Query</button>
        </form>
      </div>

      <h3>📋 Results</h3>
      ${resultContent}
    `;

    res.send(adminTemplate("Query Results", content));
  } catch (error) {
    console.error("Admin query error:", error);

    const content = `
      <h2>💾 Custom SQL Query</h2>
      <div class="query-form">
        <form method="POST" action="/admin/query">
          <label for="sql">SQL Query:</label>
          <textarea name="sql" id="sql">${req.body.sql || ''}</textarea>
          <button type="submit">Execute Query</button>
        </form>
      </div>

      <div class="error">Query Error: ${error.message}</div>
    `;

    res.send(adminTemplate("Query Error", content));
  }
});

export default router;
