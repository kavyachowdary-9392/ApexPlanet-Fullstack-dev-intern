const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const cors = require('cors');

const { db, migrate } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Run migrations
migrate();

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.post('/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });
  const hashed = await bcrypt.hash(password, 10);
  db.run(
    `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
    [name, email, hashed, 'user'],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      const user = { id: this.lastID, name, email, role: 'user' };
      const token = generateToken(user);
      res.json({ user, token });
    }
  );
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, row.password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const user = { id: row.id, name: row.name, email: row.email, role: row.role };
    const token = generateToken(user);
    res.json({ user, token });
  });
});

// Products CRUD
app.get('/api/products', (req, res) => {
  db.all(`SELECT * FROM products`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/products', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { title, description, price, stock } = req.body;
  db.run(
    `INSERT INTO products (title, description, price, stock) VALUES (?, ?, ?, ?)`,
    [title, description || '', price || 0, stock || 0],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get(`SELECT * FROM products WHERE id = ?`, [this.lastID], (e, row) => res.json(row));
    }
  );
});

app.put('/api/products/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { id } = req.params;
  const { title, description, price, stock } = req.body;
  db.run(
    `UPDATE products SET title = ?, description = ?, price = ?, stock = ? WHERE id = ?`,
    [title, description, price, stock, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get(`SELECT * FROM products WHERE id = ?`, [id], (e, row) => res.json(row));
    }
  );
});

app.delete('/api/products/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { id } = req.params;
  db.run(`DELETE FROM products WHERE id = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Orders
app.post('/api/orders', authMiddleware, (req, res) => {
  const { items } = req.body; // [{product_id, quantity}]
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'No items' });
  db.serialize(() => {
    let total = 0;
    const stmt = db.prepare(`INSERT INTO orders (user_id, total) VALUES (?, ?)`);
    // calculate total
    const placeholders = items.map(i => `?`).join(',');
    const ids = items.map(i => i.product_id);
    db.all(`SELECT id, price, stock FROM products WHERE id IN (${ids.join(',')})`, [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const priceMap = {};
      rows.forEach(r => (priceMap[r.id] = r));
      for (const it of items) {
        const p = priceMap[it.product_id];
        if (!p) return res.status(400).json({ error: 'Product not found' });
        if (p.stock < it.quantity) return res.status(400).json({ error: 'Insufficient stock' });
        total += p.price * it.quantity;
      }
      db.run(`INSERT INTO orders (user_id, total) VALUES (?, ?)`, [req.user.id, total], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        const orderId = this.lastID;
        const insertItem = db.prepare(`INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`);
        for (const it of items) {
          const p = priceMap[it.product_id];
          insertItem.run(orderId, it.product_id, it.quantity, p.price);
          db.run(`UPDATE products SET stock = stock - ? WHERE id = ?`, [it.quantity, it.product_id]);
        }
        insertItem.finalize(() => {
          db.get(`SELECT * FROM orders WHERE id = ?`, [orderId], (e, orderRow) => res.json({ order: orderRow }));
        });
      });
    });
  });
});

// Admin stats
app.get('/api/admin/stats', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  db.serialize(() => {
    db.get(`SELECT COUNT(*) AS users FROM users`, [], (e, r1) => {
      db.get(`SELECT COUNT(*) AS products FROM products`, [], (e2, r2) => {
        db.get(`SELECT COUNT(*) AS orders FROM orders`, [], (e3, r3) => {
          res.json({ users: r1.users, products: r2.products, orders: r3.orders });
        });
      });
    });
  });
});

// Seed an admin user and some products if database is empty
function seedIfEmpty() {
  db.get(`SELECT COUNT(*) AS c FROM users`, [], (err, row) => {
    if (row.c === 0) {
      bcrypt.hash('adminpass', 10).then(hashed => {
        db.run(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`, ['Admin', 'admin@local', hashed, 'admin']);
      });
    }
  });
  db.get(`SELECT COUNT(*) AS c FROM products`, [], (err, row) => {
    if (row.c === 0) {
      const items = [
        ['The Pragmatic Programmer', 'Classic software engineering book', 30.0, 10],
        ['Eloquent JavaScript', 'Modern JS book', 25.0, 8],
        ['Clean Code', 'Robert C. Martin', 32.0, 5]
      ];
      const stmt = db.prepare(`INSERT INTO products (title, description, price, stock) VALUES (?, ?, ?, ?)`);
      items.forEach(it => stmt.run(it));
      stmt.finalize();
    }
  });
}

seedIfEmpty();

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
