const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Database
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, role TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE)`);
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, category TEXT, description TEXT, price REAL,
        image_url TEXT, platform TEXT, tags TEXT, vendor_id INTEGER, FOREIGN KEY(vendor_id) REFERENCES users(id)
    )`);

    db.get("SELECT * FROM users WHERE role = 'admin'", (err, row) => {
        if (!row) db.run("INSERT INTO users (username, password, role) VALUES ('admin', 'adminpassword', 'admin')");
    });

    db.get("SELECT COUNT(*) as count FROM categories", (err, row) => {
        if (row.count === 0) {
            const defaultCats = ['SAT', 'PSAT', 'AP', 'DSAT', 'LSAT', 'Honorlock', 'Lockdown Browser', 'Proctorio'];
            defaultCats.forEach(cat => db.run("INSERT OR IGNORE INTO categories (name) VALUES (?)", [cat]));
        }
    });
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'examhub-secret', resave: false, saveUninitialized: false }));

// --- API ROUTES ---
app.get('/api/search', (req, res) => {
    const q = req.query.q || '';
    if (q.length < 1) return res.json([]);
    db.all("SELECT title, category FROM products WHERE title LIKE ? LIMIT 5", [`%${q}%`], (err, rows) => res.json(rows || []));
});

// --- UI ROUTES ---
app.get('/', (req, res) => {
    const searchQuery = req.query.q || '';
    const categoryFilter = req.query.category || '';
    let query = "SELECT products.*, users.username as vendor_name FROM products JOIN users ON products.vendor_id = users.id WHERE 1=1";
    let params = [];

    if (searchQuery) {
        query += " AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)";
        params.push(`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`);
    }
    if (categoryFilter && categoryFilter !== 'All') {
        query += " AND category = ?";
        params.push(categoryFilter);
    }

    db.all("SELECT name FROM categories", (err, cats) => {
        db.all(query, params, (err, rows) => {
            res.render('index', { products: rows || [], searchQuery, categoryFilter: categoryFilter || 'All', categories: cats.map(c => c.name), user: req.session.user });
        });
    });
});

app.get('/login', (req, res) => res.render('login', { error: null }));
app.post('/login', (req, res) => {
    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [req.body.username, req.body.password], (err, user) => {
        if (user) { req.session.user = user; return res.redirect(user.role === 'admin' ? '/admin' : '/dashboard'); }
        res.render('login', { error: 'Invalid credentials' });
    });
});
app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });

// --- ADMIN ROUTES ---
app.get('/admin', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.all("SELECT id, username, role FROM users WHERE role = 'vendor'", (err, users) => {
        db.all("SELECT id, name FROM categories", (err, categories) => {
            res.render('admin', { users: users || [], categories: categories || [], user: req.session.user });
        });
    });
});

app.post('/admin/add-category', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("INSERT INTO categories (name) VALUES (?)", [req.body.category_name], () => res.redirect('/admin'));
});

// NEW: Delete Category
app.post('/admin/delete-category', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("DELETE FROM categories WHERE id = ?", [req.body.id], () => res.redirect('/admin'));
});

// NEW: Delete Product
app.post('/admin/delete-product', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("DELETE FROM products WHERE id = ?", [req.body.id], () => res.redirect('back'));
});

app.post('/admin/create-user', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("INSERT INTO users (username, password, role) VALUES (?, ?, 'vendor')", [req.body.username, req.body.password], () => res.redirect('/admin'));
});

// --- VENDOR ROUTES ---
app.get('/dashboard', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    db.all("SELECT name FROM categories", (err, categories) => {
        res.render('dashboard', { user: req.session.user, categories: categories.map(c => c.name), preselectedCategory: req.query.category || '' });
    });
});
app.post('/dashboard/add-product', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    const { title, category, description, price, image_url, platform, tags } = req.body;
    db.run("INSERT INTO products (title, category, description, price, image_url, platform, tags, vendor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", 
    [title, category, description, price, image_url, platform, tags, req.session.user.id], () => res.redirect('/'));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
