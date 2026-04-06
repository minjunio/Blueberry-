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
    db.run(`CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, seo_title TEXT, seo_desc TEXT, seo_keywords TEXT)`);
    
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, category TEXT, description TEXT, price REAL, tier TEXT DEFAULT 'Standard',
        image_url TEXT, platform TEXT, tags TEXT, vendor_id INTEGER, FOREIGN KEY(vendor_id) REFERENCES users(id)
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT UNIQUE, product_id INTEGER, 
        tier TEXT, payment_method TEXT, email TEXT, discord_username TEXT, status TEXT DEFAULT 'Pending Payment', 
        giftcard_code TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Safely add new columns to old databases without crashing
    db.run("ALTER TABLE categories ADD COLUMN seo_title TEXT", () => {});
    db.run("ALTER TABLE categories ADD COLUMN seo_desc TEXT", () => {});
    db.run("ALTER TABLE categories ADD COLUMN seo_keywords TEXT", () => {});
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
            const stmt = db.prepare("INSERT INTO categories (name, seo_title, seo_desc, seo_keywords) VALUES (?, ?, ?, ?)");
            defaultCats.forEach(cat => stmt.run(cat, `${cat} Tools - ExamHub`, `Best bypasses and tools for ${cat}.`, `${cat}, exam, test, bypass, tools`));
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

app.get('/sitemap.xml', (req, res) => {
    try {
        const host = req.get('host') || 'www.examhub.shop';
        const baseUrl = host.includes('localhost') ? `http://${host}` : `https://${host}`; 
        db.all("SELECT name FROM categories", (err, categories) => {
            let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
            xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
            if (categories && !err) {
                categories.forEach(cat => { xml += `  <url>\n    <loc>${baseUrl}/category/${encodeURIComponent(cat.name)}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`; });
            }
            xml += '</urlset>';
            res.header('Content-Type', 'application/xml');
            res.status(200).send(xml);
        });
    } catch (e) { res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><urlset></urlset>'); }
});

app.get('/api/search', (req, res) => {
    const q = req.query.q || '';
    if (q.length < 1) return res.json([]);
    db.all("SELECT title, category FROM products WHERE title LIKE ? LIMIT 5", [`%${q}%`], (err, rows) => res.json(rows || []));
});

app.get('/', (req, res) => {
    try {
        const searchQuery = req.query.q || '';
        const categoryFilter = req.query.category || '';
        let query = "SELECT products.*, users.username as vendor_name FROM products JOIN users ON products.vendor_id = users.id WHERE 1=1";
        let params = [];

        if (searchQuery) { query += " AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)"; params.push(`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`); }
        if (categoryFilter && categoryFilter !== 'All') { query += " AND category = ?"; params.push(categoryFilter); }

        db.all("SELECT name FROM categories", (err, cats) => {
            db.all(query, params, (err, products) => {
                renderSafe(res, 'index', { user: req.session ? req.session.user : null, products: products || [], categories: cats ? cats.map(c => c.name) : [], searchQuery: searchQuery || '', categoryFilter: categoryFilter || 'All', categoryRow: null });
            });
        });
    } catch (e) { res.status(200).send("Loading ExamHub..."); }
});

app.get('/category/:name', (req, res) => {
    try {
        const categoryName = decodeURIComponent(req.params.name || '');
        db.get("SELECT * FROM categories WHERE LOWER(name) = LOWER(?)", [categoryName], (err, categoryRow) => {
            if (!categoryRow) { categoryRow = { name: categoryName, seo_title: `${categoryName} - ExamHub`, seo_desc: `Tools for ${categoryName}.`, seo_keywords: `${categoryName}` }; }
            db.all("SELECT products.*, users.username as vendor_name FROM products JOIN users ON products.vendor_id = users.id WHERE LOWER(category) = LOWER(?)", [categoryName], (err, products) => {
                db.all("SELECT name FROM categories", (err, cats) => {
                    renderSafe(res, 'index', { user: req.session ? req.session.user : null, products: products || [], categories: cats ? cats.map(c => c.name) : [], searchQuery: '', categoryFilter: categoryRow.name, categoryRow: categoryRow });
                });
            });
        });
    } catch (e) { res.redirect('/'); }
});

// CHECKOUT WITH EMAIL & PRE-DEFINED TIER
app.post('/checkout', (req, res) => {
    const { product_id, email, discord_username, tier, payment_method } = req.body;
    const order_id = Math.random().toString(36).substring(2, 10).toUpperCase();
    db.run("INSERT INTO orders (order_id, product_id, tier, payment_method, email, discord_username) VALUES (?, ?, ?, ?, ?, ?)", 
        [order_id, product_id, tier, payment_method, email, discord_username || null], 
        (err) => {
            if (err) return res.redirect('back');
            res.redirect(`/order/${order_id}`);
        }
    );
});

// ORDER PAGE
app.get('/order/:order_id', (req, res) => {
    db.get("SELECT orders.*, products.title as product_title, products.price as product_price FROM orders JOIN products ON orders.product_id = products.id WHERE order_id = ?", [req.params.order_id], (err, order) => {
        if (!order || err) return res.redirect('/');
        renderSafe(res, 'order', { order });
    });
});

app.post('/api/order/:order_id/update', (req, res) => {
    const { status, giftcard_code } = req.body;
    db.run("UPDATE orders SET status = ?, giftcard_code = ? WHERE order_id = ?", [status, giftcard_code || null, req.params.order_id], (err) => {
        if (err) return res.status(500).json({ error: 'DB Error' });
        res.json({ success: true });
    });
});

app.get('/login', (req, res) => renderSafe(res, 'login', { error: null }));
app.post('/login', (req, res) => {
    db.get("SELECT * FROM users WHERE username = ?", [req.body.username], async (err, user) => {
        if (user && await bcrypt.compare(req.body.password, user.password)) {
            req.session.user = user;
            res.redirect(user.role === 'admin' ? '/admin' : '/dashboard');
        } else { renderSafe(res, 'login', { error: 'Invalid username or password' }); }
    });
});
app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });

// ADMIN PANEL
app.get('/admin', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.all("SELECT * FROM categories", (err, categories) => {
        db.all("SELECT products.*, users.username as vendor_name FROM products JOIN users ON products.vendor_id = users.id ORDER BY id DESC", (err, products) => {
            db.all("SELECT id, username FROM users WHERE role = 'vendor'", (err, users) => {
                db.all("SELECT orders.*, products.title as product_title, products.price as product_price FROM orders LEFT JOIN products ON orders.product_id = products.id ORDER BY orders.created_at DESC", (err, orders) => {
                    renderSafe(res, 'admin', { user: req.session.user, categories: categories || [], products: products || [], users: users || [], orders: orders || [] });
                });
            });
        });
    });
});

app.post('/admin/close-order', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("DELETE FROM orders WHERE order_id = ?", [req.body.order_id], () => res.redirect('/admin'));
});

// ADD, EDIT, AND DELETE POSTS
app.post('/admin/add-product', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    const { title, category, description, price, tier, image_url, platform, tags } = req.body;
    db.run("INSERT INTO products (title, category, description, price, tier, image_url, platform, tags, vendor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", 
        [title, category, description, price, tier || 'Standard', image_url, platform, tags, req.session.user.id], () => res.redirect('/')
    );
});

app.post('/admin/edit-product', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    const { id, title, category, description, price, tier, image_url, platform } = req.body;
    db.run("UPDATE products SET title = ?, category = ?, description = ?, price = ?, tier = ?, image_url = ?, platform = ? WHERE id = ?", 
        [title, category, description, price, tier, image_url, platform, id], () => res.redirect('/admin')
    );
});

app.post('/admin/delete-product', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("DELETE FROM products WHERE id = ?", [req.body.id], () => res.redirect('back'));
});

// CATEGORY MANAGEMENT
app.post('/admin/add-category', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("INSERT INTO categories (name, seo_title, seo_desc, seo_keywords) VALUES (?, ?, ?, ?)", [req.body.category_name, req.body.seo_title, req.body.seo_desc, req.body.seo_keywords], () => res.redirect('/admin'));
});
app.post('/admin/edit-category', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("UPDATE categories SET name = ?, seo_title = ?, seo_desc = ?, seo_keywords = ? WHERE name = ?", [req.body.category_name, req.body.seo_title, req.body.seo_desc, req.body.seo_keywords, req.body.original_name], () => {
        if (req.body.original_name !== req.body.category_name) {
            db.run("UPDATE products SET category = ? WHERE category = ?", [req.body.category_name, req.body.original_name], () => res.redirect('/admin'));
        } else { res.redirect('/admin'); }
    });
});
app.post('/admin/delete-category', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("DELETE FROM categories WHERE name = ?", [req.body.category_name], () => res.redirect('/admin'));
});

app.post('/admin/create-user', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    db.run("INSERT INTO users (username, password, role) VALUES (?, ?, 'vendor')", [req.body.username, hashedPass], () => res.redirect('/admin'));
});

app.use((err, req, res, next) => { console.error("Express Error:", err.message); res.status(200).send("ExamHub Online"); });
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
