const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer({ dest: 'uploads/' });

// --- EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'Kfdhs954@gmail.com',
        pass: 'onbscnffehrrrgdn' 
    }
});

// Setup Database
const db = new sqlite3.Database('./data/database.sqlite', (err) => {
    if (err) console.error("Database opening error: ", err);
});

db.serialize(() => {
    // Core Tables
    db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, role TEXT, sol_balance REAL DEFAULT 5.0, rig_percentage INTEGER DEFAULT -1)`);
    db.run(`CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, seo_title TEXT, seo_desc TEXT, seo_keywords TEXT, og_image TEXT, canonical_url TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, category TEXT, description TEXT, price REAL, tier TEXT DEFAULT 'Standard', image_url TEXT, platform TEXT, tags TEXT, vendor_id INTEGER, FOREIGN KEY(vendor_id) REFERENCES users(id))`);
    db.run(`CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT UNIQUE, product_id INTEGER, tier TEXT, payment_method TEXT, email TEXT, discord_username TEXT, status TEXT DEFAULT 'Pending Payment', giftcard_code TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS announcements (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, category TEXT, image1 TEXT, image2 TEXT, content TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS otps (email TEXT PRIMARY KEY, code TEXT, expires DATETIME)`);
    
    // Casino Tracking Table
    db.run(`CREATE TABLE IF NOT EXISTS casino_ledger (id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT, amount REAL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);

    // Safe Alterations for older DB versions
    db.run("ALTER TABLE categories ADD COLUMN seo_title TEXT", () => {});
    db.run("ALTER TABLE categories ADD COLUMN seo_desc TEXT", () => {});
    db.run("ALTER TABLE categories ADD COLUMN seo_keywords TEXT", () => {});
    db.run("ALTER TABLE categories ADD COLUMN og_image TEXT", () => {});
    db.run("ALTER TABLE categories ADD COLUMN canonical_url TEXT", () => {});
    db.run("ALTER TABLE products ADD COLUMN tier TEXT DEFAULT 'Standard'", () => {});
    db.run("ALTER TABLE orders ADD COLUMN email TEXT", () => {});
    db.run("ALTER TABLE users ADD COLUMN sol_balance REAL DEFAULT 5.0", () => {});
    db.run("ALTER TABLE users ADD COLUMN rig_percentage INTEGER DEFAULT -1", () => {});

    // Initialize Admin
    db.get("SELECT * FROM users WHERE role = 'admin'", async (err, row) => {
        if (!row) {
            const hashedAdminPass = await bcrypt.hash('monterysasd', 10);
            db.run("INSERT INTO users (username, password, role, sol_balance, rig_percentage) VALUES ('admin', ?, 'admin', 5.0, -1)", [hashedAdminPass]);
        }
    });
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public')); 
app.use(session({ secret: 'examhub-super-secret-key-2026', resave: false, saveUninitialized: false, cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } })); 

const renderSafe = (res, view, data) => {
    res.render(view, data, (err, html) => {
        if (err) return res.status(200).send(`Error loading page.`);
        res.status(200).send(html);
    });
};

const getActiveOrders = (req, callback) => {
    if (!req.session || !req.session.buyerEmail) return callback(0);
    db.get("SELECT COUNT(*) as count FROM orders WHERE email = ? AND status != 'Completed' AND status != 'Closed'", [req.session.buyerEmail], (err, row) => {
        callback(row ? row.count : 0);
    });
};

// --- OTP VERIFICATION ENDPOINTS ---
app.post('/api/send-otp', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const code = Math.floor(100000 + Math.random() * 900000).toString(); 
    const expires = new Date(Date.now() + 15 * 60000); 

    db.run("INSERT OR REPLACE INTO otps (email, code, expires) VALUES (?, ?, ?)", [email, code, expires.toISOString()], async (err) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        try {
            await transporter.sendMail({
                from: '"ExamHub Support" <Kfdhs954@gmail.com>',
                to: email,
                subject: 'Your ExamHub Verification Code',
                text: `Your verification code is: ${code}. It expires in 15 minutes.`,
                html: `<div style="font-family:sans-serif; padding:20px;"><h2>ExamHub Authentication</h2><p>Your verification code is:</p><h1 style="color:#00b67a; letter-spacing:4px;">${code}</h1><p>Please enter this code on the website to continue your purchase.</p></div>`
            });
            res.json({ success: true });
        } catch (mailError) {
            console.error("Email failed to send:", mailError);
            res.json({ success: false, error: "SMTP Error" }); 
        }
    });
});

app.post('/api/verify-otp', (req, res) => {
    const { email, code } = req.body;
    db.get("SELECT * FROM otps WHERE email = ? AND code = ?", [email, code], (err, row) => {
        if (!row || new Date() > new Date(row.expires)) return res.status(400).json({ error: 'Invalid or expired code.' });
        
        req.session.buyerEmail = email; 
        db.run("DELETE FROM otps WHERE email = ?", [email]); 
        res.json({ success: true });
    });
});

app.get('/buyer-logout', (req, res) => {
    req.session.buyerEmail = null;
    res.redirect('/');
});

// --- MAIN PAGES ---
app.get('/', (req, res) => {
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

    getActiveOrders(req, (activeOrderCount) => {
        db.all("SELECT * FROM categories", (err, cats) => {
            db.all(pQuery, pParams, (err, products) => {
                db.all(aQuery, aParams, (err, announcements) => {
                    renderSafe(res, 'index', { 
                        user: req.session ? req.session.user : null, 
                        buyerEmail: req.session ? req.session.buyerEmail : null,
                        activeOrderCount,
                        products: products || [], announcements: announcements || [], categories: cats || [], searchQuery, categoryFilter: categoryFilter || 'All', categoryRow: null 
                    });
                });
            });
        });
    });
});

app.get('/category/:name', (req, res) => {
    const categoryName = decodeURIComponent(req.params.name || '');
    getActiveOrders(req, (activeOrderCount) => {
        db.get("SELECT * FROM categories WHERE LOWER(name) = LOWER(?)", [categoryName], (err, categoryRow) => {
            if (!categoryRow) categoryRow = { name: categoryName, seo_title: `${categoryName} - ExamHub`, seo_desc: `Tools for ${categoryName}.`, seo_keywords: `${categoryName}`, og_image: '', canonical_url: '' };
            db.all("SELECT products.*, users.username as vendor_name FROM products JOIN users ON products.vendor_id = users.id WHERE LOWER(category) = LOWER(?)", [categoryName], (err, products) => {
                db.all("SELECT * FROM announcements WHERE category = ? OR category = 'All' ORDER BY id DESC", [categoryName], (err, announcements) => {
                    db.all("SELECT * FROM categories", (err, cats) => {
                        renderSafe(res, 'index', { 
                            user: req.session ? req.session.user : null, 
                            buyerEmail: req.session ? req.session.buyerEmail : null,
                            activeOrderCount,
                            products: products || [], announcements: announcements || [], categories: cats || [], searchQuery: '', categoryFilter: categoryRow.name, categoryRow 
                        });
                    });
                });
            });
        });
    });
});

app.get('/api/search', (req, res) => {
    const q = req.query.q || '';
    if (q.length < 1) return res.json([]);
    db.all("SELECT title, category FROM products WHERE title LIKE ? LIMIT 5", [`%${q}%`], (err, rows) => res.json(rows || []));
});

app.get('/my-orders', (req, res) => {
    if (!req.session.buyerEmail) return res.redirect('/');
    getActiveOrders(req, (activeOrderCount) => {
        db.all("SELECT orders.*, products.title as product_title FROM orders JOIN products ON orders.product_id = products.id WHERE email = ? ORDER BY orders.created_at DESC", [req.session.buyerEmail], (err, orders) => {
            renderSafe(res, 'my-orders', { 
                user: req.session ? req.session.user : null, 
                buyerEmail: req.session.buyerEmail, 
                activeOrderCount,
                orders: orders || [],
                error: req.query.error 
            });
        });
    });
});

app.post('/checkout', (req, res) => {
    if (!req.session.buyerEmail) return res.redirect('/'); 
    
    db.get("SELECT COUNT(*) as count FROM orders WHERE email = ? AND status != 'Completed' AND status != 'Closed'", [req.session.buyerEmail], (err, row) => {
        if (row && row.count >= 3) {
            return res.redirect('/my-orders?error=max_orders'); 
        }

        const { product_id, discord_username, tier, payment_method } = req.body;
        const order_id = Math.random().toString(36).substring(2, 10).toUpperCase();
        
        db.run("INSERT INTO orders (order_id, product_id, tier, payment_method, email, discord_username) VALUES (?, ?, ?, ?, ?, ?)", 
            [order_id, product_id, tier, payment_method, req.session.buyerEmail, discord_username || null], 
            (err) => res.redirect(`/order/${order_id}`)
        );
    });
});

app.post('/buyer/close-order', (req, res) => {
    if (!req.session.buyerEmail) return res.redirect('/');
    db.run("UPDATE orders SET status = 'Closed' WHERE order_id = ? AND email = ?", [req.body.order_id, req.session.buyerEmail], () => {
        res.redirect('/my-orders');
    });
});

app.get('/order/:order_id', (req, res) => {
    getActiveOrders(req, (activeOrderCount) => {
        db.get("SELECT orders.*, products.title as product_title, products.price as product_price FROM orders JOIN products ON orders.product_id = products.id WHERE order_id = ?", [req.params.order_id], (err, order) => {
            if (!order || err) return res.redirect('/');
            renderSafe(res, 'order', { order, user: req.session ? req.session.user : null, buyerEmail: req.session ? req.session.buyerEmail : null, activeOrderCount });
        });
    });
});

app.post('/api/order/:order_id/update', (req, res) => {
    db.run("UPDATE orders SET status = ?, giftcard_code = ? WHERE order_id = ?", [req.body.status, req.body.giftcard_code || null, req.params.order_id], (err) => {
        res.json({ success: true });
    });
});

// --- ADMIN & LOGIN ROUTES ---
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

// UPDATED: Now queries fresh Admin data and Casino Ledger logs
app.get('/admin', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    
    db.get("SELECT * FROM users WHERE id = ?", [req.session.user.id], (err, adminUser) => {
        db.all("SELECT * FROM categories", (err, categories) => {
            db.all("SELECT products.*, users.username as vendor_name FROM products JOIN users ON products.vendor_id = users.id ORDER BY id DESC", (err, products) => {
                db.all("SELECT * FROM announcements ORDER BY id DESC", (err, announcements) => {
                    db.all("SELECT orders.*, products.title as product_title, products.price as product_price FROM orders LEFT JOIN products ON orders.product_id = products.id ORDER BY orders.created_at DESC", (err, orders) => {
                        db.all("SELECT * FROM casino_ledger ORDER BY created_at DESC LIMIT 20", (err, ledger) => {
                            renderSafe(res, 'admin', { 
                                user: adminUser, // Contains fresh sol_balance and rig_percentage
                                categories: categories || [], 
                                products: products || [], 
                                announcements: announcements || [], 
                                orders: orders || [],
                                ledger: ledger || [] 
                            });
                        });
                    });
                });
            });
        });
    });
});

// --- CASINO API ENDPOINTS ---

// Load the Casino Lounge UI
app.get('/admin/casino', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    renderSafe(res, 'casino', { user: req.session.user });
});

app.post('/admin/casino/sync', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).json({error: 'Unauthorized'});
    const { balance, rig_percentage, logAction, logAmount } = req.body;

    // Save Balance and Rig percentage
    db.run("UPDATE users SET sol_balance = ?, rig_percentage = ? WHERE id = ?", [balance, rig_percentage, req.session.user.id], (err) => {
        // Optional: Save transaction history to ledger
        if (logAction && logAmount !== undefined) {
            db.run("INSERT INTO casino_ledger (action, amount) VALUES (?, ?)", [logAction, logAmount]);
        }
        res.json({ success: true });
    });
});

// --- ADMIN STORE MANAGEMENT ---
app.post('/admin/close-order', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("DELETE FROM orders WHERE order_id = ?", [req.body.order_id], () => res.redirect('/admin'));
});

app.post('/admin/add-product', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    let { title, category, description, price, tier, image_url, platform, tags } = req.body;
    if (parseFloat(price) > 900) tier = 'Ultra';
    db.run("INSERT INTO products (title, category, description, price, tier, image_url, platform, tags, vendor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [title, category, description, price, tier || 'Standard', image_url, platform, tags, req.session.user.id], () => res.redirect('/'));
});
app.post('/admin/edit-product', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    let { id, title, category, description, price, tier, image_url, platform } = req.body;
    if (parseFloat(price) > 900) tier = 'Ultra';
    db.run("UPDATE products SET title = ?, category = ?, description = ?, price = ?, tier = ?, image_url = ?, platform = ? WHERE id = ?", [title, category, description, price, tier, image_url, platform, id], () => res.redirect('/admin'));
});
app.post('/admin/delete-product', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("DELETE FROM products WHERE id = ?", [req.body.id], () => res.redirect('back'));
});

app.post('/admin/add-announcement', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("INSERT INTO announcements (title, category, image1, image2, content) VALUES (?, ?, ?, ?, ?)", [req.body.title, req.body.category, req.body.image1, req.body.image2, req.body.content], () => res.redirect('/admin'));
});
app.post('/admin/edit-announcement', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("UPDATE announcements SET title = ?, category = ?, image1 = ?, image2 = ?, content = ? WHERE id = ?", [req.body.title, req.body.category, req.body.image1, req.body.image2, req.body.content, req.body.id], () => res.redirect('/admin'));
});
app.post('/admin/delete-announcement', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("DELETE FROM announcements WHERE id = ?", [req.body.id], () => res.redirect('/admin'));
});

app.post('/admin/add-category', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("INSERT INTO categories (name, seo_title, seo_desc, seo_keywords, og_image, canonical_url) VALUES (?, ?, ?, ?, ?, ?)", [req.body.category_name, req.body.seo_title, req.body.seo_desc, req.body.seo_keywords, req.body.og_image, req.body.canonical_url], () => res.redirect('/admin'));
});
app.post('/admin/edit-category', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("UPDATE categories SET name = ?, seo_title = ?, seo_desc = ?, seo_keywords = ?, og_image = ?, canonical_url = ? WHERE name = ?", [req.body.category_name, req.body.seo_title, req.body.seo_desc, req.body.seo_keywords, req.body.og_image, req.body.canonical_url, req.body.original_name], () => res.redirect('/admin'));
});
app.post('/admin/delete-category', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("DELETE FROM categories WHERE name = ?", [req.body.category_name], () => res.redirect('/admin'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
