const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer({ dest: 'uploads/' });

// --- RENDER PLATFORM CONFIGURATION (HTTP 451 BYPASS) ---
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use((req, res, next) => {
    // Prevents Render's reverse proxy from caching block pages
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

// --- MACHINE TRACKING CONFIGURATION & UTILITIES ---
const DATA_DIR = path.join(__dirname, "data");
const MACHINES_FILE = path.join(DATA_DIR, "machines.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(MACHINES_FILE)) {
  fs.writeFileSync(MACHINES_FILE, JSON.stringify({ machines: [] }, null, 2));
}

function sha256(value) {
  return crypto
    .createHash("sha256")
    .update(String(value))
    .digest("hex");
}

function looksLikeSha256(value) {
  return /^[a-f0-9]{64}$/i.test(String(value || "").trim());
}

function normalizeMachineInput(value) {
  const clean = String(value || "").trim();
  if (!clean) return null;
  return looksLikeSha256(clean) ? clean.toLowerCase() : sha256(clean);
}

function readMachines() {
  try {
    const raw = fs.readFileSync(MACHINES_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.machines)) {
      return { machines: [] };
    }
    return parsed;
  } catch {
    return { machines: [] };
  }
}

function writeMachines(data) {
  if (!data || !Array.isArray(data.machines)) {
    data = { machines: [] };
  }
  fs.writeFileSync(MACHINES_FILE, JSON.stringify(data, null, 2));
}

function generateSessionToken() {
  return "sess_" + crypto.randomBytes(32).toString("hex");
}

function isExpired(machine) {
  if (!machine.expiresAt) return false;
  const expiryTime = new Date(machine.expiresAt).getTime();
  if (Number.isNaN(expiryTime)) return false;
  return expiryTime < Date.now();
}

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "Unknown";
}

function cleanMachine(machine) {
  return {
    id: machine.id || crypto.randomUUID(),
    machineIdHash: String(machine.machineIdHash || machine.machineId || "").trim().toLowerCase(),
    keyName: String(machine.keyName || "Unnamed Key"),
    hostname: String(machine.hostname || ""),
    note: String(machine.note || ""),
    status: String(machine.status || "active"),
    expiresAt: machine.expiresAt || null,
    sessionToken: machine.sessionToken || generateSessionToken(),
    createdAt: machine.createdAt || new Date().toISOString(),
    updatedAt: machine.updatedAt || new Date().toISOString(),
    lastSeenAt: machine.lastSeenAt || null,
    lastIp: machine.lastIp || null,
    os: machine.os || null,
    city: machine.city || null,
    country: machine.country || null,
    isAdmin: machine.isAdmin || null
  };
}

function publicMachine(machine) {
  const expired = isExpired(machine);
  return {
    id: machine.id,
    keyName: machine.keyName,
    hostname: machine.hostname,
    note: machine.note,
    status: expired ? "expired" : machine.status,
    expiresAt: machine.expiresAt,
    forever: !machine.expiresAt,
    sessionToken: machine.sessionToken,
    createdAt: machine.createdAt,
    updatedAt: machine.updatedAt,
    lastSeenAt: machine.lastSeenAt,
    lastIp: machine.lastIp,
    os: machine.os,
    city: machine.city,
    country: machine.country,
    isAdmin: machine.isAdmin
  };
}

// --- EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'bluewalletrecovery@gmail.com', 
        pass: 'njml scqy khee muda' 
    }
});

// Setup Database
const db = new sqlite3.Database(path.join(DATA_DIR, 'database.sqlite'), (err) => {
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
    
    // Blog Posts Table
    db.run(`CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, content TEXT, category_name TEXT, product_id INTEGER, seo_title TEXT, seo_desc TEXT, seo_keywords TEXT, og_image TEXT, canonical_url TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);

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
app.use(express.json({ limit: '20mb' })); 
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

// --- SITEMAP ENDPOINT ---
app.get('/sitemap.xml', (req, res) => {
    db.all("SELECT id FROM products", (err, products) => {
        db.all("SELECT id FROM posts", (err, posts) => {
            let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
            xml += `\n  <url><loc>https://${req.get('host')}/</loc><changefreq>daily</changefreq></url>`;
            if(products) products.forEach(p => { xml += `\n  <url><loc>https://${req.get('host')}/?q=${p.id}</loc></url>`; });
            if(posts) posts.forEach(p => { xml += `\n  <url><loc>https://${req.get('host')}/post/${p.id}</loc></url>`; });
            xml += `\n</urlset>`;
            res.header('Content-Type', 'application/xml');
            res.send(xml);
        });
    });
});

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
                from: '"ExamHub Support" <bluewalletrecovery@gmail.com>', 
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
                    db.all("SELECT * FROM posts ORDER BY created_at DESC", (err, posts) => {
                        renderSafe(res, 'index', { 
                            user: req.session ? req.session.user : null, 
                            buyerEmail: req.session ? req.session.buyerEmail : null,
                            activeOrderCount,
                            products: products || [], 
                            announcements: announcements || [], 
                            categories: cats || [], 
                            posts: posts || [],
                            searchQuery, 
                            categoryFilter: categoryFilter || 'All', 
                            categoryRow: null 
                        });
                    });
                });
            });
        });
    });
});

// Public Tutorial Route
app.get('/tutorial', (req, res) => {
    getActiveOrders(req, (activeOrderCount) => {
        renderSafe(res, 'tutorial', { 
            user: req.session ? req.session.user : null, 
            buyerEmail: req.session ? req.session.buyerEmail : null,
            activeOrderCount
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
                        db.all("SELECT * FROM posts ORDER BY created_at DESC", (err, posts) => {
                            renderSafe(res, 'index', { 
                                user: req.session ? req.session.user : null, 
                                buyerEmail: req.session ? req.session.buyerEmail : null,
                                activeOrderCount,
                                products: products || [], 
                                announcements: announcements || [], 
                                categories: cats || [], 
                                posts: posts || [],
                                searchQuery: '', 
                                categoryFilter: categoryRow.name, 
                                categoryRow 
                            });
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

// --- DYNAMIC POST ROUTE ---
app.get('/post/:id', (req, res) => {
    db.get("SELECT * FROM posts WHERE id = ?", [req.params.id], (err, post) => {
        if (!post) return res.redirect('/');
        
        if (post.product_id) {
            db.get("SELECT * FROM products WHERE id = ?", [post.product_id], (err, product) => {
                renderSafe(res, 'post', { post, linkedProduct: product || null, host: req.get('host'), user: req.session ? req.session.user : null, buyerEmail: req.session ? req.session.buyerEmail : null });
            });
        } else {
            renderSafe(res, 'post', { post, linkedProduct: null, host: req.get('host'), user: req.session ? req.session.user : null, buyerEmail: req.session ? req.session.buyerEmail : null });
        }
    });
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

app.get('/admin', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    
    db.get("SELECT * FROM users WHERE id = ?", [req.session.user.id], (err, adminUser) => {
        db.all("SELECT * FROM categories", (err, categories) => {
            db.all("SELECT products.*, users.username as vendor_name FROM products JOIN users ON products.vendor_id = users.id ORDER BY id DESC", (err, products) => {
                db.all("SELECT * FROM announcements ORDER BY id DESC", (err, announcements) => {
                    db.all("SELECT orders.*, products.title as product_title, products.price as product_price FROM orders LEFT JOIN products ON orders.product_id = products.id ORDER BY orders.created_at DESC", (err, orders) => {
                        db.all("SELECT * FROM casino_ledger ORDER BY created_at DESC LIMIT 20", (err, ledger) => {
                            db.all("SELECT * FROM posts ORDER BY created_at DESC", (err, posts) => {
                                renderSafe(res, 'admin', { 
                                    user: adminUser, 
                                    categories: categories || [], 
                                    products: products || [], 
                                    announcements: announcements || [], 
                                    orders: orders || [],
                                    ledger: ledger || [],
                                    posts: posts || []
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

// ======================================================
// WHITELIST / MACHINE VERIFICATION SYSTEM
// Put this AFTER your /admin route and BEFORE app.listen()
// ======================================================

function requireAdmin(req, res, next) {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
    }

    next();
}

function requireAdminApi(req, res, next) {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    next();
}

// ======================================================
// WHITELIST PAGE
// Opens: /admin/whitelist
// File needed: views/admin-whitelist.ejs
// ======================================================

app.get('/admin/whitelist', requireAdmin, (req, res) => {
    renderSafe(res, 'admin-whitelist', {
        user: req.session.user
    });
});

// ======================================================
// WHITELIST API: GET ALL MACHINES
// ======================================================

app.get('/api/admin/whitelist/machines', requireAdminApi, (req, res) => {
    const data = readMachines();

    data.machines = data.machines.map(cleanMachine);

    writeMachines(data);

    res.json(data.machines.map(machine => publicMachine(machine)));
});

// ======================================================
// WHITELIST API: ADD / UPDATE MACHINE
// ======================================================

app.post('/api/admin/whitelist/machines', requireAdminApi, (req, res) => {
    const {
        id,
        machineInput,
        keyName,
        hostname,
        note,
        status,
        expiresAt,
        forever
    } = req.body;

    const data = readMachines();

    data.machines = data.machines.map(cleanMachine);

    let machine = null;
    let machineIdHash = null;

    if (id) {
        machine = data.machines.find(m => m.id === id);
    }

    if (machineInput) {
        machineIdHash = normalizeMachineInput(machineInput);
    }

    if (!machine && machineIdHash) {
        machine = data.machines.find(m => m.machineIdHash === machineIdHash);
    }

    if (!machine && !machineIdHash) {
        return res.status(400).json({
            success: false,
            error: 'Machine ID is required'
        });
    }

    if (!machine) {
        machine = {
            id: crypto.randomUUID(),
            machineIdHash,
            keyName: keyName || 'Unnamed Key',
            hostname: hostname || '',
            note: note || '',
            status: status || 'active',
            expiresAt: forever ? null : expiresAt || null,
            sessionToken: generateSessionToken(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastSeenAt: null,
            lastIp: null,
            os: null,
            city: null,
            country: null,
            isAdmin: null
        };

        data.machines.push(machine);
    } else {
        if (machineIdHash) {
            machine.machineIdHash = machineIdHash;
        }

        machine.keyName = keyName || machine.keyName || 'Unnamed Key';
        machine.hostname = hostname || machine.hostname || '';
        machine.note = note || '';
        machine.status = status || 'active';
        machine.expiresAt = forever ? null : expiresAt || null;
        machine.updatedAt = new Date().toISOString();

        if (!machine.sessionToken) {
            machine.sessionToken = generateSessionToken();
        }
    }

    writeMachines(data);

    res.json({
        success: true,
        machine: publicMachine(machine)
    });
});

// ======================================================
// WHITELIST API: DELETE MACHINE
// ======================================================

app.delete('/api/admin/whitelist/machines/:id', requireAdminApi, (req, res) => {
    const data = readMachines();
    const before = data.machines.length;

    data.machines = data.machines.filter(machine => machine.id !== req.params.id);

    writeMachines(data);

    res.json({
        success: true,
        deleted: before !== data.machines.length
    });
});

// ======================================================
// WHITELIST API: REGENERATE SESSION TOKEN
// ======================================================

app.post('/api/admin/whitelist/machines/:id/regenerate-token', requireAdminApi, (req, res) => {
    const data = readMachines();

    const machine = data.machines.find(machine => machine.id === req.params.id);

    if (!machine) {
        return res.status(404).json({
            success: false,
            error: 'Machine not found'
        });
    }

    machine.sessionToken = generateSessionToken();
    machine.updatedAt = new Date().toISOString();

    writeMachines(data);

    res.json({
        success: true,
        machine: publicMachine(cleanMachine(machine))
    });
});

// ======================================================
// WHITELIST API: DOWNLOAD JSON
// ======================================================

app.get('/api/admin/whitelist/export', requireAdmin, (req, res) => {
    const data = readMachines();

    const filename = `machines-backup-${new Date().toISOString().slice(0, 10)}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.send(JSON.stringify(data, null, 2));
});

// ======================================================
// WHITELIST API: VIEW RAW JSON
// ======================================================

app.get('/api/admin/whitelist/json', requireAdminApi, (req, res) => {
    const data = readMachines();

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(data, null, 2));
});

// ======================================================
// WHITELIST API: IMPORT JSON
// ======================================================

app.post('/api/admin/whitelist/import', requireAdminApi, (req, res) => {
    const { importData, mode } = req.body;

    if (!importData) {
        return res.status(400).json({
            success: false,
            error: 'No JSON data received'
        });
    }

    let parsed;

    try {
        parsed = typeof importData === 'string' ? JSON.parse(importData) : importData;
    } catch {
        return res.status(400).json({
            success: false,
            error: 'Invalid JSON'
        });
    }

    if (!parsed || !Array.isArray(parsed.machines)) {
        return res.status(400).json({
            success: false,
            error: 'JSON must contain a machines array'
        });
    }

    const incoming = parsed.machines
        .map(cleanMachine)
        .filter(machine => machine.machineIdHash);

    if (mode === 'replace') {
        writeMachines({ machines: incoming });

        return res.json({
            success: true,
            mode: 'replace',
            imported: incoming.length
        });
    }

    const current = readMachines();

    current.machines = current.machines.map(cleanMachine);

    let added = 0;
    let updated = 0;

    for (const incomingMachine of incoming) {
        const existing = current.machines.find(machine => {
            return machine.machineIdHash === incomingMachine.machineIdHash;
        });

        if (existing) {
            Object.assign(existing, {
                ...incomingMachine,
                id: existing.id,
                updatedAt: new Date().toISOString()
            });

            updated++;
        } else {
            current.machines.push(incomingMachine);
            added++;
        }
    }

    writeMachines(current);

    res.json({
        success: true,
        mode: 'merge',
        added,
        updated,
        total: current.machines.length
    });
});

// ======================================================
// PUBLIC PYTHON VERIFICATION ENDPOINT
// Python calls: /api/auth?machineId=HASH&hostname=PC&city=Abu Dhabi&country=AE
// ======================================================

app.get('/api/auth', (req, res) => {
    const {
        machineId,
        os,
        hostname,
        isAdmin,
        city,
        country
    } = req.query;

    if (!machineId) {
        return res.status(400).json([
            {
                authorized: false,
                sessionToken: null,
                status: 'denied',
                reason: 'Missing machineId'
            }
        ]);
    }

    const machineIdHash = String(machineId).trim().toLowerCase();
    const ip = getClientIp(req);

    const data = readMachines();

    data.machines = data.machines.map(cleanMachine);

    let machine = data.machines.find(m => m.machineIdHash === machineIdHash);

    // New unknown machine gets saved automatically as pending.
    if (!machine) {
        machine = {
            id: crypto.randomUUID(),
            machineIdHash,
            keyName: hostname ? `Pending - ${hostname}` : 'Pending Machine',
            hostname: hostname || 'Unknown Host',
            note: 'Auto-added from auth request. Approve this machine to allow access.',
            status: 'pending',
            expiresAt: null,
            sessionToken: generateSessionToken(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastSeenAt: new Date().toISOString(),
            lastIp: ip,
            os: os || 'windows',
            city: city || 'Unknown City',
            country: country || 'Unknown Country',
            isAdmin: isAdmin || 'unknown'
        };

        data.machines.push(machine);

        writeMachines(data);

        return res.status(403).json([
            {
                authorized: false,
                sessionToken: null,
                status: 'pending',
                reason: 'Machine is pending admin approval'
            }
        ]);
    }

    // Existing machine updates latest info.
    machine.hostname = hostname || machine.hostname || 'Unknown Host';
    machine.os = os || machine.os || 'windows';
    machine.isAdmin = isAdmin || machine.isAdmin || 'unknown';
    machine.city = city || machine.city || 'Unknown City';
    machine.country = country || machine.country || 'Unknown Country';
    machine.lastSeenAt = new Date().toISOString();
    machine.lastIp = ip;
    machine.updatedAt = new Date().toISOString();

    if (machine.status !== 'active') {
        writeMachines(data);

        return res.status(403).json([
            {
                authorized: false,
                sessionToken: null,
                status: machine.status,
                reason: 'Machine is not active'
            }
        ]);
    }

    if (isExpired(machine)) {
        machine.status = 'expired';
        machine.updatedAt = new Date().toISOString();

        writeMachines(data);

        return res.status(403).json([
            {
                authorized: false,
                sessionToken: null,
                status: 'expired',
                reason: 'License expired'
            }
        ]);
    }

    if (!machine.sessionToken) {
        machine.sessionToken = generateSessionToken();
    }

    writeMachines(data);

    return res.status(200).json([
        {
            authorized: true,
            sessionToken: machine.sessionToken,
            status: 'active',
            expiresAt: machine.expiresAt,
            forever: !machine.expiresAt
        }
    ]);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
