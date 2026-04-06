const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer({ dest: 'uploads/' });

// Setup Database
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, role TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, seo_title TEXT, seo_desc TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, category TEXT, description TEXT, price REAL,
        image_url TEXT, platform TEXT, tags TEXT, vendor_id INTEGER, FOREIGN KEY(vendor_id) REFERENCES users(id)
    )`);

    // Safely attempt to add SEO columns if table already existed
    db.run("ALTER TABLE categories ADD COLUMN seo_title TEXT", () => {});
    db.run("ALTER TABLE categories ADD COLUMN seo_desc TEXT", () => {});

    // SECURE ADMIN CREATION: Hashes the password "monterysasd"
    db.get("SELECT * FROM users WHERE role = 'admin'", async (err, row) => {
        if (!row) {
            const hashedAdminPass = await bcrypt.hash('monterysasd', 10);
            db.run("INSERT INTO users (username, password, role) VALUES ('admin', ?, 'admin')", [hashedAdminPass]);
        }
    });

    db.get("SELECT COUNT(*) as count FROM categories", (err, row) => {
        if (row.count === 0) {
            const defaultCats = ['SAT', 'PSAT', 'AP', 'DSAT', 'LSAT', 'Honorlock'];
            const stmt = db.prepare("INSERT INTO categories (name, seo_title, seo_desc) VALUES (?, ?, ?)");
            defaultCats.forEach(cat => stmt.run(cat, `${cat} Tools - ExamHub`, `Best bypasses and tools for ${cat}.`));
            stmt.finalize();
        }
    });
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Enables the favicon in the /public folder
app.use(session({ secret: 'examhub-super-secret-key-2026', resave: false, saveUninitialized: false }));

// --- PUBLIC ROUTES ---
app.get('/', (req, res) => {
    const searchQuery = req.query.q || '';
    const categoryFilter = req.query.category || '';
    
    let query = "SELECT products.*, users.username as vendor_name FROM products JOIN users ON products.vendor_id = users.id WHERE 1=1";
    let params = [];

    if (searchQuery) {
        query += " AND (title LIKE ? OR tags LIKE ?)";
        params.push(`%${searchQuery}%`, `%${searchQuery}%`);
    }
    if (categoryFilter) {
        query += " AND category = ?";
        params.push(categoryFilter);
    }

    db.all(query, params, (err, products) => {
        db.all("SELECT * FROM categories", (err, categories) => {
            res.render('index', { 
                user: req.session.user, 
                products: products || [], 
                categories: categories.map(c => c.name),
                searchQuery, 
                categoryFilter,
                categoryRow: null // No specific SEO on home page
            });
        });
    });
});

// --- CATEGORY DIRECTORY & SEO ROUTES ---
app.get('/category/:name', (req, res) => {
    const categoryName = req.params.name;
    db.get("SELECT * FROM categories WHERE name = ?", [categoryName], (err, categoryRow) => {
        if (!categoryRow) return res.redirect('/');
        
        db.all("SELECT products.*, users.username as vendor_name FROM products JOIN users ON products.vendor_id = users.id WHERE category = ?", [categoryName], (err, products) => {
            db.all("SELECT * FROM categories", (err, categories) => {
                res.render('index', { 
                    user: req.session.user, 
                    products: products || [], 
                    categories: categories.map(c => c.name),
                    searchQuery: '',
                    categoryFilter: categoryName,
                    categoryRow: categoryRow // Passes specific SEO to the frontend
                });
            });
        });
    });
});

// --- AUTH ROUTES ---
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    db.get("SELECT * FROM users WHERE username = ?", [req.body.username], async (err, user) => {
        if (user && await bcrypt.compare(req.body.password, user.password)) {
            req.session.user = user;
            res.redirect(user.role === 'admin' ? '/admin' : '/dashboard');
        } else {
            res.render('login', { error: 'Invalid username or password' });
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// --- ADMIN ROUTES ---
app.get('/admin', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.all("SELECT * FROM categories", (err, categories) => {
        db.all("SELECT products.*, users.username as vendor_name FROM products JOIN users ON products.vendor_id = users.id", (err, products) => {
            db.all("SELECT id, username FROM users WHERE role = 'vendor'", (err, users) => {
                res.render('admin', { user: req.session.user, categories, products, users });
            });
        });
    });
});

app.post('/admin/add-category', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    const { category_name, seo_title, seo_desc } = req.body;
    db.run("INSERT INTO categories (name, seo_title, seo_desc) VALUES (?, ?, ?)", [category_name, seo_title, seo_desc], () => res.redirect('/admin'));
});

app.post('/admin/delete-category', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("DELETE FROM categories WHERE name = ?", [req.body.category_name], () => res.redirect('/admin'));
});

app.post('/admin/delete-product', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("DELETE FROM products WHERE id = ?", [req.body.id], () => res.redirect('back'));
});

app.post('/admin/create-user', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    db.run("INSERT INTO users (username, password, role) VALUES (?, ?, 'vendor')", [req.body.username, hashedPass], () => res.redirect('/admin'));
});

// --- JSON BACKUP & RESTORE ROUTES ---
app.get('/admin/export', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    const exportData = {};
    db.all("SELECT * FROM users", (err, users) => {
        exportData.users = users;
        db.all("SELECT * FROM categories", (err, categories) => {
            exportData.categories = categories;
            db.all("SELECT * FROM products", (err, products) => {
                exportData.products = products;
                res.header("Content-Type", 'application/json');
                res.attachment("examhub_backup.json");
                return res.send(exportData);
            });
        });
    });
});

app.post('/admin/import', upload.single('backup'), (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    if (!req.file) return res.redirect('/admin');

    const data = JSON.parse(fs.readFileSync(req.file.path, 'utf8'));
    
    db.serialize(() => {
        db.run("DELETE FROM products");
        db.run("DELETE FROM categories");
        db.run("DELETE FROM users");

        const userStmt = db.prepare("INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)");
        data.users?.forEach(u => userStmt.run(u.id, u.username, u.password, u.role));
        userStmt.finalize();

        const catStmt = db.prepare("INSERT INTO categories (id, name, seo_title, seo_desc) VALUES (?, ?, ?, ?)");
        data.categories?.forEach(c => catStmt.run(c.id, c.name, c.seo_title, c.seo_desc));
        catStmt.finalize();

        const prodStmt = db.prepare("INSERT INTO products (id, title, category, description, price, image_url, platform, tags, vendor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        data.products?.forEach(p => prodStmt.run(p.id, p.title, p.category, p.description, p.price, p.image_url, p.platform, p.tags, p.vendor_id));
        prodStmt.finalize();
    });

    fs.unlinkSync(req.file.path);
    res.redirect('/admin');
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
        [title, category, description, price, image_url, platform, tags, req.session.user.id], 
        () => res.redirect('/')
    );
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
