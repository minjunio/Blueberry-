const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set your contact email here
const CONTACT_EMAIL = "minjunnios@gmail.com";

// Setup Database
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
    // Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, role TEXT
    )`);

    // Dynamic Categories Table
    db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE
    )`);

    // Upgraded Products Table
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT, category TEXT, description TEXT, price REAL,
        image_url TEXT, platform TEXT, tags TEXT, vendor_id INTEGER,
        FOREIGN KEY(vendor_id) REFERENCES users(id)
    )`);

    // Create default admin
    db.get("SELECT * FROM users WHERE role = 'admin'", (err, row) => {
        if (!row) db.run("INSERT INTO users (username, password, role) VALUES ('admin', 'adminpassword', 'admin')");
    });

    // Seed default categories if empty
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

// --- API ROUTES (For Live Search & Contact Info) ---
app.get('/api/search', (req, res) => {
    const q = req.query.q || '';
    if (q.length < 1) return res.json([]);
    db.all("SELECT title, category FROM products WHERE title LIKE ? LIMIT 5", [`%${q}%`], (err, rows) => {
        res.json(rows || []);
    });
});

app.get('/api/config', (req, res) => {
    res.json({ contactEmail: CONTACT_EMAIL });
});

// --- UI ROUTES ---

// 1. Home / Marketplace
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
        const categories = cats.map(c => c.name);
        db.all(query, params, (err, rows) => {
            res.render('index', { 
                products: rows || [], searchQuery, categoryFilter: categoryFilter || 'All', categories, user: req.session.user 
            });
        });
    });
});

// 2. Auth Routes
app.get('/login', (req, res) => res.render('login', { error: null }));
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, user) => {
        if (user) {
            req.session.user = user;
            return res.redirect(user.role === 'admin' ? '/admin' : '/dashboard');
        }
        res.render('login', { error: 'Invalid credentials' });
    });
});
app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });

// 3. Admin Routes
app.get('/admin', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.all("SELECT id, username, role FROM users WHERE role = 'vendor'", (err, users) => {
        db.all("SELECT name FROM categories", (err, categories) => {
            res.render('admin', { users: users || [], categories: categories || [], user: req.session.user });
        });
    });
});

app.post('/admin/add-category', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("INSERT INTO categories (name) VALUES (?)", [req.body.category_name], () => res.redirect('/admin'));
});

// ⚠️ DELETE CATEGORY (Admin only)
app.post('/admin/delete-category', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("DELETE FROM categories WHERE name = ?", [req.body.category_name], () => res.redirect('/admin'));
});

app.post('/admin/create-user', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("INSERT INTO users (username, password, role) VALUES (?, ?, 'vendor')", [req.body.username, req.body.password], () => res.redirect('/admin'));
});

// ⚠️ DELETE PRODUCT (Vendors can delete own, Admin can delete any)
app.post('/dashboard/delete-product', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    const user = req.session.user;
    
    if (user.role === 'admin') {
        db.run("DELETE FROM products WHERE id = ?", [req.body.product_id], () => res.redirect('/'));
    } else {
        db.run("DELETE FROM products WHERE id = ? AND vendor_id = ?", [req.body.product_id, user.id], () => res.redirect('/'));
    }
});

// 4. Dashboard (Admin and Vendors can post)
app.get('/dashboard', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    const preselectedCategory = req.query.category || '';
    db.all("SELECT name FROM categories", (err, categories) => {
        res.render('dashboard', { user: req.session.user, categories: categories.map(c => c.name), preselectedCategory });
    });
});

app.post('/dashboard/add-product', (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    const { title, category, description, price, image_url, platform, tags } = req.body;
    db.run("INSERT INTO products (title, category, description, price, image_url, platform, tags, vendor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", 
    [title, category, description, price, image_url, platform, tags, req.session.user.id], () => res.redirect('/'));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
