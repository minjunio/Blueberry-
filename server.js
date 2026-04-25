const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const nodemailer = require('nodemailer');
const WebSocket = require('ws'); // <-- NEW: Required for Background Algo

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
    db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, role TEXT, sol_balance REAL DEFAULT 5.0, rig_percentage INTEGER DEFAULT -1, usdt_balance REAL DEFAULT 88000.0)`);
    db.run(`CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, seo_title TEXT, seo_desc TEXT, seo_keywords TEXT, og_image TEXT, canonical_url TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, category TEXT, description TEXT, price REAL, tier TEXT DEFAULT 'Standard', image_url TEXT, platform TEXT, tags TEXT, vendor_id INTEGER, FOREIGN KEY(vendor_id) REFERENCES users(id))`);
    db.run(`CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT UNIQUE, product_id INTEGER, tier TEXT, payment_method TEXT, email TEXT, discord_username TEXT, status TEXT DEFAULT 'Pending Payment', giftcard_code TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS announcements (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, category TEXT, image1 TEXT, image2 TEXT, content TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS otps (email TEXT PRIMARY KEY, code TEXT, expires DATETIME)`);
    db.run(`CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, content TEXT, category_name TEXT, product_id INTEGER, seo_title TEXT, seo_desc TEXT, seo_keywords TEXT, og_image TEXT, canonical_url TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS casino_ledger (id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT, amount REAL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);

    db.run("ALTER TABLE categories ADD COLUMN seo_title TEXT", () => {});
    db.run("ALTER TABLE categories ADD COLUMN seo_desc TEXT", () => {});
    db.run("ALTER TABLE categories ADD COLUMN seo_keywords TEXT", () => {});
    db.run("ALTER TABLE categories ADD COLUMN og_image TEXT", () => {});
    db.run("ALTER TABLE categories ADD COLUMN canonical_url TEXT", () => {});
    db.run("ALTER TABLE products ADD COLUMN tier TEXT DEFAULT 'Standard'", () => {});
    db.run("ALTER TABLE orders ADD COLUMN email TEXT", () => {});
    db.run("ALTER TABLE users ADD COLUMN sol_balance REAL DEFAULT 5.0", () => {});
    db.run("ALTER TABLE users ADD COLUMN rig_percentage INTEGER DEFAULT -1", () => {});
    db.run("ALTER TABLE users ADD COLUMN usdt_balance REAL DEFAULT 88000.0", () => {});

    db.get("SELECT * FROM users WHERE role = 'admin'", async (err, row) => {
        if (!row) {
            const hashedAdminPass = await bcrypt.hash('monterysasd', 10);
            db.run("INSERT INTO users (username, password, role, sol_balance, rig_percentage, usdt_balance) VALUES ('admin', ?, 'admin', 5.0, -1, 88000.0)", [hashedAdminPass]);
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
        if (row && row.count >= 3) return res.redirect('/my-orders?error=max_orders'); 
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
                                    user: adminUser, categories: categories || [], products: products || [], announcements: announcements || [], 
                                    orders: orders || [], ledger: ledger || [], posts: posts || []
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

app.get('/admin/casino', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    renderSafe(res, 'casino', { user: req.session.user });
});

app.post('/admin/casino/sync', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).json({error: 'Unauthorized'});
    const { balance, rig_percentage, logAction, logAmount } = req.body;
    db.run("UPDATE users SET sol_balance = ?, rig_percentage = ? WHERE id = ?", [balance, rig_percentage, req.session.user.id], (err) => {
        if (logAction && logAmount !== undefined) db.run("INSERT INTO casino_ledger (action, amount) VALUES (?, ?)", [logAction, logAmount]);
        res.json({ success: true });
    });
});

app.get('/admin/trading', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.get("SELECT * FROM users WHERE id = ?", [req.session.user.id], (err, user) => {
        renderSafe(res, 'trading', { user: user });
    });
});

app.post('/admin/trading/sync', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.status(403).json({error: 'Unauthorized'});
    db.run("UPDATE users SET usdt_balance = ? WHERE id = ?", [req.body.balance, req.session.user.id], (err) => {
        res.json({ success: true });
    });
});

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
app.post('/admin/delete-category', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("DELETE FROM categories WHERE name = ?", [req.body.category_name], () => res.redirect('/admin'));
});
app.post('/admin/add-category', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("INSERT INTO categories (name, seo_title, seo_desc, seo_keywords, og_image, canonical_url) VALUES (?, ?, ?, ?, ?, ?)", 
    [req.body.category_name, req.body.seo_title, req.body.seo_desc, req.body.seo_keywords, req.body.og_image, req.body.canonical_url], () => res.redirect('/admin'));
});
app.post('/admin/edit-category', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("UPDATE categories SET name = ?, seo_title = ?, seo_desc = ?, seo_keywords = ?, og_image = ?, canonical_url = ? WHERE name = ?", 
    [req.body.category_name, req.body.seo_title, req.body.seo_desc, req.body.seo_keywords, req.body.og_image, req.body.canonical_url, req.body.original_name], () => res.redirect('/admin'));
});
app.post('/admin/add-post', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    const { title, content, category_name, product_id, seo_title, seo_desc, seo_keywords, og_image, canonical_url } = req.body;
    db.run("INSERT INTO posts (title, content, category_name, product_id, seo_title, seo_desc, seo_keywords, og_image, canonical_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", 
    [title, content, category_name || null, product_id || null, seo_title, seo_desc, seo_keywords, og_image, canonical_url], () => res.redirect('/admin'));
});
app.post('/admin/delete-post', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.run("DELETE FROM posts WHERE id = ?", [req.body.id], () => res.redirect('/admin'));
});

// =====================================================================
// ================= 24/7 BACKGROUND ALGO ENGINE =======================
// =====================================================================

const algoState = {
    currentPrice: 0,
    prices: [],         // Holds the last ~100 closing prices for EMA/SMA
    tradeFlows: [],     // Holds recent large trades to calculate flow
    activeTrades: [],   // Active positions opened by the bot
    stats: { wins: 0, losses: 0, pnl: 0 }
};

let wsTicker, wsTrade;

function startBinanceWebSockets() {
    // 1. TICKER STREAM (For Price Action)
    wsTicker = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
    wsTicker.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.c) {
            algoState.currentPrice = parseFloat(msg.c);
            algoState.prices.push(algoState.currentPrice);
            if (algoState.prices.length > 150) algoState.prices.shift();
        }
    });
    wsTicker.on('error', console.error);
    wsTicker.on('close', () => setTimeout(startBinanceWebSockets, 3000)); // Auto-reconnect

    // 2. AGGTRADE STREAM (For Order Flow & Whales)
    wsTrade = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@aggTrade');
    wsTrade.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.p && msg.q) {
            const isBuy = !msg.m;
            const usdVal = parseFloat(msg.p) * parseFloat(msg.q);
            if (usdVal > 5000) { // Only log significant flow
                algoState.tradeFlows.push({ isBuy, usdVal, time: Date.now() });
                if (algoState.tradeFlows.length > 2000) algoState.tradeFlows.shift();
            }
        }
    });
    wsTrade.on('error', console.error);
    wsTrade.on('close', () => setTimeout(startBinanceWebSockets, 3000));
}

startBinanceWebSockets();

// --- THE HEARTBEAT: Runs every 5 seconds forever ---
setInterval(() => {
    if (algoState.prices.length < 26) return; // Wait for data to fill

    // 1. Extract Background Variables
    const prices = algoState.prices;
    const currentPrice = algoState.currentPrice;
    
    // Calculate SMA (20)
    const smaData = prices.slice(-20);
    const sma = smaData.reduce((acc, val) => acc + val, 0) / 20;

    // Calculate RSI (14)
    let gains = 0, losses = 0;
    const rsiData = prices.slice(-15);
    for(let i=1; i<rsiData.length; i++) { 
        let diff = rsiData[i] - rsiData[i-1]; 
        if(diff >= 0) gains += diff; else losses -= diff; 
    }
    let rs = (gains/14) / ((losses/14) || 1); 
    let rsi = 100 - (100 / (1 + rs));

    // Calculate Flow (15m and 1h)
    const now = Date.now();
    const logs15m = algoState.tradeFlows.filter(l => now - l.time < 900000);
    const b15 = logs15m.filter(l=>l.isBuy).reduce((a,b)=>a+b.usdVal,0); 
    const s15 = logs15m.filter(l=>!l.isBuy).reduce((a,b)=>a+b.usdVal,0); 
    const buyRatio15m = b15 / (b15 + s15 + 1);

    const logs1h = algoState.tradeFlows.filter(l => now - l.time < 3600000);
    const b1h = logs1h.filter(l=>l.isBuy).reduce((a,b)=>a+b.usdVal,0); 
    const s1h = logs1h.filter(l=>!l.isBuy).reduce((a,b)=>a+b.usdVal,0); 
    const buyRatio1h = b1h / (b1h + s1h + 1);

    const whaleSentiment = buyRatio1h; // Simplified for backend
    const topBuysAmount = b15; 
    const topSellsAmount = s15;
    const stdDev = Math.max(...smaData) - Math.min(...smaData);
    const volatility = stdDev;

    // 2. RUN ALGORITHM (v8.0 Deep Quant)
    let shortSide = 'WAIT';
    
    function calcEMA(data, period) {
        let k = 2 / (period + 1); let emaData = [data[0]];
        for(let i=1; i<data.length; i++) emaData.push(data[i] * k + emaData[i-1] * (1 - k));
        return emaData;
    }
    let ema12 = calcEMA(prices, 12); let ema26 = calcEMA(prices, 26);
    let macdLine = ema12[ema12.length-1] - ema26[ema26.length-1];
    let macdPrev = ema12[ema12.length-2] - ema26[ema26.length-2];
    let macdHist = macdLine - macdPrev; 
    let macdHistPrev = macdPrev - (ema12[ema12.length-3] - ema26[ema26.length-3]);
    let macdAccel = macdHist - macdHistPrev; 

    let mean = sma;
    let upperBB = mean + (2 * stdDev); let lowerBB = mean - (2 * stdDev);
    let drop3Candles = (prices[prices.length-4] - currentPrice) / prices[prices.length-4]; 
    let flowImbalance15m = (buyRatio15m - 0.5) * 2; 

    let isFlashDip = drop3Candles > 0.003 && rsi < 40 && flowImbalance15m > 0.3 && topBuysAmount > topSellsAmount;
    let isShortBuy = rsi < 45 && macdAccel > 0 && currentPrice < lowerBB * 1.02 && buyRatio15m > 0.55;
    let isShortSell = rsi > 65 && macdAccel < 0 && currentPrice > upperBB * 0.98 && buyRatio15m < 0.45;

    if (isFlashDip) shortSide = 'buy';
    else if (isShortBuy && topBuysAmount > topSellsAmount * 1.1) shortSide = 'buy';
    else if (isShortSell && topSellsAmount > topBuysAmount * 1.1) shortSide = 'sell';

    // 3. AUTO-EXECUTE PAPER TRADES
    if (shortSide !== 'WAIT' && algoState.activeTrades.length < 5 && Math.random() > 0.8) {
        algoState.activeTrades.push({
            id: Date.now(),
            side: shortSide,
            entry: currentPrice,
            lev: 50,
            margin: 500 // $500 simulated margin per trade
        });
        console.log(`[ALGO] Opened ${shortSide.toUpperCase()} at $${currentPrice}`);
    }

    // 4. MANAGE OPEN TRADES (TP/SL & DB Sync)
    let dbUpdateNeeded = false;
    let totalPnlChange = 0;

    for (let i = algoState.activeTrades.length - 1; i >= 0; i--) {
        let t = algoState.activeTrades[i];
        let roi = t.side === 'buy' 
            ? ((currentPrice - t.entry) / t.entry) * t.lev * 100 
            : ((t.entry - currentPrice) / t.entry) * t.lev * 100;

        // Take Profit at +15% ROI, Stop Loss at -10% ROI
        if (roi > 15 || roi < -10) {
            let pnl = t.margin * (roi / 100);
            totalPnlChange += pnl;
            
            if (roi > 0) algoState.stats.wins++;
            else algoState.stats.losses++;
            algoState.stats.pnl += pnl;

            console.log(`[ALGO] Closed trade with ${roi > 0 ? 'PROFIT' : 'LOSS'}: $${pnl.toFixed(2)}`);
            algoState.activeTrades.splice(i, 1);
            dbUpdateNeeded = true;
        }
    }

    // 5. COMMIT TO SQLITE DATABASE
    if (dbUpdateNeeded) {
        db.get("SELECT usdt_balance, id FROM users WHERE role = 'admin'", (err, adminUser) => {
            if (adminUser) {
                const newBalance = adminUser.usdt_balance + totalPnlChange;
                db.run("UPDATE users SET usdt_balance = ? WHERE id = ?", [newBalance, adminUser.id], (err) => {
                    if(!err) console.log(`[DB SYNC] Admin USDT updated to: $${newBalance.toFixed(2)}`);
                });
            }
        });
    }

}, 5000);

// Endpoint so the frontend UI can ping the server for background stats
app.get('/api/trading/background-status', (req, res) => {
    res.json({
        activeTrades: algoState.activeTrades.length,
        wins: algoState.stats.wins,
        losses: algoState.stats.losses,
        sessionPnl: algoState.stats.pnl,
        currentPrice: algoState.currentPrice
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));