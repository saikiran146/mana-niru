const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, 'mananiru.db'));

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      bottle_size TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      total_amount INTEGER NOT NULL,
      payment_status TEXT DEFAULT 'pending',
      payment_intent_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      must_change_password INTEGER DEFAULT 0
    );
  `);

  const admin = db.prepare('SELECT id FROM admin WHERE username = ?').get('admin');
  if (!admin) {
    const hash = bcrypt.hashSync('admin', 10);
    db.prepare('INSERT INTO admin (username, password_hash, must_change_password) VALUES (?, ?, 1)')
      .run('admin', hash);
    console.log('Admin created — login: admin / admin (change password on first login)');
  }
}

module.exports = { db, initDb };
