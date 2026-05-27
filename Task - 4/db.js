const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

function migrate() {
  db.serialize(() => {
    db.run(`PRAGMA foreign_keys = ON;`);

    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user'
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      stock INTEGER DEFAULT 0
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      total REAL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );`);

    db.run(`CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY(product_id) REFERENCES products(id)
    );`);
  });
}

module.exports = { db, migrate };
