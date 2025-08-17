// saves chat history to personalize AI

import Database from "better-sqlite3";

const db = new Database("chat.db"); // this will create chat.db in your project folder

// Create table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    role TEXT,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;