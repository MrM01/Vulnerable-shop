const Database = require('better-sqlite3');
const db = new Database('shop.db');

db.exec(`
  DROP TABLE IF EXISTS users;
  DROP TABLE IF EXISTS products;
  DROP TABLE IF EXISTS reviews;
  DROP TABLE IF EXISTS orders;

  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer'
  );

  CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL
  );

  CREATE TABLE reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    author TEXT NOT NULL,
    comment TEXT NOT NULL
  );

  CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    item TEXT NOT NULL,
    total REAL NOT NULL
  );
`);

const seedUsers = db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)');
seedUsers.run('admin@shop.local', 'Admin#2026!', 'admin');
seedUsers.run('ana@shop.local', 'Frutas123', 'customer');
seedUsers.run('luis@shop.local', 'Jugo2024', 'customer');

const seedProducts = db.prepare('INSERT INTO products (name, price) VALUES (?, ?)');
seedProducts.run('Jugo de naranja', 18.5);
seedProducts.run('Jugo verde detox', 22.0);
seedProducts.run('Smoothie de mango', 20.0);

const seedOrders = db.prepare('INSERT INTO orders (user_id, item, total) VALUES (?, ?, ?)');
seedOrders.run(2, 'Jugo de naranja', 18.5);
seedOrders.run(3, 'Smoothie de mango', 20.0);

module.exports = db;
