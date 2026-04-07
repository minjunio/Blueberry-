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

// Setup Database on permanent disk
const db = new sqlite3.Database('./data/database.sqlite', (err) => {
    if (err) console.error("Database opening error: ", err);
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, role TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, seo_title TEXT, seo_desc TEXT, seo_keywords TEXT, og_image TEXT, canonical_url TEXT)`);
    
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, category TEXT, description TEXT, price REAL, tier TEXT DEFAULT 'Standard',
        image_url TEXT, platform TEXT, tags TEXT, vendor_id INTEGER, FOREIGN KEY(vendor_id) REFERENCES users(id)
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT UNIQUE, product_id INTEGER, 
        tier TEXT, payment_method TEXT, email TEXT, discord_username TEXT, status TEXT DEFAULT 'Pending Payment', 
        giftcard_code TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // NEW: Announcements Table for Blog Posts
    db.run(`CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, category TEXT, image1 TEXT, image2 TEXT, content TEXT, 
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run("ALTER TABLE categories ADD COLUMN seo_title TEXT", () => {});
    db.run("ALTER TABLE categories ADD COLUMN seo_desc TEXT", () => {});
    db.run("ALTER TABLE categories ADD COLUMN seo_keywords TEXT", () => {});
    db.run("ALTER TABLE categories ADD COLUMN og_image TEXT", () => {});
    db.run("ALTER TABLE categories ADD COLUMN canonical_url TEXT", () => {});
    db.run("ALTER TABLE products ADD COLUMN tier TEXT DEFAULT 'Standard'", () => {});
    db.run("ALTER TABLE orders ADD COLUMN email TEXT", () => {});

    db.get("SELECT * FROM users WHERE role = 'admin'", async (err, row) => {
        if (!row) {
            const hashedAdminPass = await bcrypt.hash('monterysasd', 10);
            db.run("INSERT INTO users (username, password, role) VALUES ('admin', ?, 'admin')", [hashedAdminPass]);
        }
    });

    db.get("SELECT COUNT(*) as count FROM categories", (err, row) => {
        if (row && row.count === 0) {
            const defaultCats = ['SAT', 'PSAT', 'AP', 'DSAT', 'LSAT', 'Honorlock', 'Lockdown Browser', 'Proctorio'];
            const stmt = db.prepare("INSERT INTO categories (name, seo_title, seo_desc, seo_keywords, og_image, canonical_url) VALUES (?, ?, ?, ?, ?, ?)");
            defaultCats.forEach(cat => stmt.run(cat, `${cat} Tools - ExamHub`, `Best bypasses and tools for ${cat}.`, `${cat}, exam, test, bypass, tools`, ``, ``));
            stmt.finalize();
        }
    });
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public')); 
app.use(session({ secret: 'examhub-super-secret-key-2026', resave: false, saveUninitialized: false }));

const renderSafe = (res, view, data) => {
    res.render(view, data, (err, html) => {
        if (err) {
            console.error(`[CRITICAL] EJS Crash prevented on ${view}.ejs:`, err.message);
            return res.status(200).send(`<!DOCTYPE html><html lang="en"><head><title>ExamHub</title></head><body><h1>ExamHub Loading...</h1></body></html>`);
        }
        res.status(200).send(html);
    });
};

app.get('/api/search', (req, res) => {
    const q = req.query.q || '';
    if (q.length < 1) return res.json([]);
    db.all("SELECT title, category FROM products WHERE title LIKE ? LIMIT 5", [`%${q}%`], (err, rows) => res.json(rows || []));
});

// UPDATED: Now fetches Announcements too
app.get('/', (req, res) => {
    try {
        const searchQuery = req.query.q || '';
        const categoryFilter = req.query.category || '';
        
        let pQuery = "SELECT products.*, users.username as vendor_name FROM products JOIN users ON products.vendor_id = users.id WHERE 1=1";
        let pParams = [];
        let aQuery = "SELECT * FROM announcements ORDER BY id DESC";
        let aParams = [];

        if (searchQuery) { pQuery += " AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)"; pParams.push(`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`); }
        if (categoryFilter && categoryFilter !== 'All') { 
            pQuery += " AND category = ?"; pParams.push(categoryFilter); 
            aQuery = "SELECT * FROM announcements WHERE category = ? OR category = 'All' ORDER BY id DESC"; aParams.push(categoryFilter);
        }

        db.all("SELECT * FROM categories", (err, cats) => {
            db.all(pQuery, pParams, (err, products) => {
                db.all(aQuery, aParams, (err, announcements) => {
                    renderSafe(res, 'index', { user: req.session ? req.session.user : null, products: products || [], announcements: announcements || [], categories: cats || [], searchQuery: searchQuery || '', categoryFilter: categoryFilter || 'All', categoryRow: null });
                });
            });
        });
    } catch (e) { res.status(200).send("Loading ExamHub..."); }
});

app.get('/category/:name', (req, res) => {
    try {
        const categoryName = decodeURIComponent(req.params.name || '');
        db.get("SELECT * FROM categories WHERE LOWER(name) = LOWER(?)", [categoryName], (err, categoryRow) => {
            if (!categoryRow) { categoryRow = { name: categoryName, seo_title: `${categoryName} - ExamHub`, seo_desc: `Tools for ${categoryName}.`, seo_keywords: `${categoryName}`, og_image: '', canonical_url: '' }; }
            
            db.all("SELECT products.*, users.username as vendor_name FROM products JOIN users ON products.vendor_id = users.id WHERE LOWER(category) = LOWER(?)", [categoryName], (err, products) => {
                db.all("SELECT * FROM announcements WHERE category = ? OR category = 'All' ORDER BY id DESC", [categoryName], (err, announcements) => {
                    db.all("SELECT * FROM categories", (err, cats) => {
                        renderSafe(res, 'index', { user: req.session ? req.session.user : null, products: products || [], announcements: announcements || [], categories: cats || [], searchQuery: '', categoryFilter: categoryRow.name, categoryRow: categoryRow });
                    });
                });
            });
        });
    } catch (e) { res.redirect('/'); }
});

app.post('/checkout', (req, res) => {
    const { product_id, email, discord_username, tier, payment_method } = req.body;
    const order_id = Math.random().toString(36).substring(2, 10).toUpperCase();
    db.run("INSERT INTO orders (order_id, product_id, tier, payment_method, email, discord_username) VALUES (?, ?, ?, ?, ?, ?)", 
        [order_id, product_id, tier, payment_method, email, discord_username || null], 
        (err) => res.redirect(`/order/${order_id}`)
    );
});

app.get('/order/:order_id', (req, res) => {
    db.get("SELECT orders.*, products.title as product_title, products.price as product_price FROM orders JOIN products ON orders.product_id = products.id WHERE order_id = ?", [req.params.order_id], (err, order) => {
        if (!order || err) return res.redirect('/');
        renderSafe(res, 'order', { order });
    });
});

app.post('/api/order/:order_id/update', (req, res) => {
    db.run("UPDATE orders SET status = ?, giftcard_code = ? WHERE order_id = ?", [req.body.status, req.body.giftcard_code || null, req.params.order_id], (err) => {
        res.json({ success: true });
    });
});

app.get('/login', (req, res) => renderSafe(res, 'login', { error: null }));
app.post('/login', (req, res) => {
    db.get("SELECT * FROM users WHERE username = ?", [req.body.username], async (err, user) => {
        if (user && await bcrypt.compare(req.body.password, user.password)) {
            req.session.user = user;
            res.redirect('/admin');
        } else { renderSafe(res, 'login', { error: 'Invalid username or password' }); }
    });
});
app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });

// ADMIN PANEL DATA
app.get('/admin', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.all("SELECT * FROM categories", (err, categories) => {
        db.all("SELECT products.*, users.username as vendor_name FROM products JOIN users ON products.vendor_id = users.id ORDER BY id DESC", (err, products) => {
            db.all("SELECT * FROM announcements ORDER BY id DESC", (err, announcements) => {
                db.all("SELECT orders.*, products.title as product_title, products.price as product_price FROM orders LEFT JOIN products ON orders.product_id = products.id ORDER BY orders.created_at DESC", (err, orders) => {
                    renderSafe(res, 'admin', { user: req.session.user, categories: categories || [], products: products || [], announcements: announcements || [], orders: orders || [] });
                });
            });
        });
    });
});

app.post('/admin/close-order', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("DELETE FROM orders WHERE order_id = ?", [req.body.order_id], () => res.redirect('/admin'));
});

// AUTOMATIC ULTRA TIER LOGIC ENFORCEMENT
app.post('/admin/add-product', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    let { title, category, description, price, tier, image_url, platform, tags } = req.body;
    
    // Automatically flag as Ultra if over $900
    if (parseFloat(price) > 900) tier = 'Ultra';

    db.run("INSERT INTO products (title, category, description, price, tier, image_url, platform, tags, vendor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", 
        [title, category, description, price, tier || 'Standard', image_url, platform, tags, req.session.user.id], () => res.redirect('/')
    );
});

app.post('/admin/edit-product', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    let { id, title, category, description, price, tier, image_url, platform } = req.body;
    
    if (parseFloat(price) > 900) tier = 'Ultra';

    db.run("UPDATE products SET title = ?, category = ?, description = ?, price = ?, tier = ?, image_url = ?, platform = ? WHERE id = ?", 
        [title, category, description, price, tier, image_url, platform, id], () => res.redirect('/admin')
    );
});

app.post('/admin/delete-product', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("DELETE FROM products WHERE id = ?", [req.body.id], () => res.redirect('back'));
});

// NEW: ANNOUNCEMENTS ROUTES
app.post('/admin/add-announcement', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("INSERT INTO announcements (title, category, image1, image2, content) VALUES (?, ?, ?, ?, ?)", 
        [req.body.title, req.body.category, req.body.image1, req.body.image2, req.body.content], () => res.redirect('/admin')
    );
});
app.post('/admin/delete-announcement', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("DELETE FROM announcements WHERE id = ?", [req.body.id], () => res.redirect('/admin'));
});

// CATEGORY SEO ROUTES
app.post('/admin/add-category', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("INSERT INTO categories (name, seo_title, seo_desc, seo_keywords, og_image, canonical_url) VALUES (?, ?, ?, ?, ?, ?)", 
        [req.body.category_name, req.body.seo_title, req.body.seo_desc, req.body.seo_keywords, req.body.og_image, req.body.canonical_url], () => res.redirect('/admin')
    );
});
app.post('/admin/edit-category', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("UPDATE categories SET name = ?, seo_title = ?, seo_desc = ?, seo_keywords = ?, og_image = ?, canonical_url = ? WHERE name = ?", 
        [req.body.category_name, req.body.seo_title, req.body.seo_desc, req.body.seo_keywords, req.body.og_image, req.body.canonical_url, req.body.original_name], () => res.redirect('/admin')
    );
});
app.post('/admin/delete-category', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("DELETE FROM categories WHERE name = ?", [req.body.category_name], () => res.redirect('/admin'));
});

app.use((err, req, res, next) => { console.error("Express Error:", err.message); res.status(200).send("ExamHub Online"); });
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
