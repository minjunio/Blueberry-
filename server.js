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
    db.run(`CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, seo_title TEXT, seo_desc TEXT, seo_keywords TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, category TEXT, description TEXT, price REAL,
        image_url TEXT, platform TEXT, tags TEXT, vendor_id INTEGER, FOREIGN KEY(vendor_id) REFERENCES users(id)
    )`);

    // Safely attempt to add SEO columns if table already existed
    db.run("ALTER TABLE categories ADD COLUMN seo_title TEXT", () => {});
    db.run("ALTER TABLE categories ADD COLUMN seo_desc TEXT", () => {});
    db.run("ALTER TABLE categories ADD COLUMN seo_keywords TEXT", () => {});

    // SECURE ADMIN CREATION
    db.get("SELECT * FROM users WHERE role = 'admin'", async (err, row) => {
        if (!row) {
            const hashedAdminPass = await bcrypt.hash('monterysasd', 10);
            db.run("INSERT INTO users (username, password, role) VALUES ('admin', ?, 'admin')", [hashedAdminPass]);
        }
    });

    db.get("SELECT COUNT(*) as count FROM categories", (err, row) => {
        if (row.count === 0) {
            const defaultCats = ['SAT', 'PSAT', 'AP', 'DSAT', 'LSAT', 'Honorlock', 'Lockdown Browser', 'Proctorio'];
            const stmt = db.prepare("INSERT INTO categories (name, seo_title, seo_desc, seo_keywords) VALUES (?, ?, ?, ?)");
            defaultCats.forEach(cat => stmt.run(cat, `${cat} Tools - ExamHub`, `Best bypasses and tools for ${cat}.`, `${cat}, exam, test, bypass, tools`));
            stmt.finalize();
        }
    });
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Enables the favicon in the /public folder
app.use(session({ secret: 'examhub-super-secret-key-2026', resave: false, saveUninitialized: false }));

// --- SITEMAP FOR GOOGLE SEO (Safe Version) ---
app.get('/sitemap.xml', (req, res) => {
    try {
        // Fallback host if Googlebot strips the headers
        const host = req.get('host') || 'www.examhub.shop';
        const baseUrl = host.includes('localhost') ? `http://${host}` : `https://${host}`; 

        db.all("SELECT name FROM categories", (err, categories) => {
            let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
            xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
            xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
            if (categories && !err) {
                categories.forEach(cat => {
                    xml += `  <url>\n    <loc>${baseUrl}/category/${encodeURIComponent(cat.name)}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
                });
            }
            xml += '</urlset>';
            res.header('Content-Type', 'application/xml');
            res.status(200).send(xml);
        });
    } catch (error) {
        console.error("Sitemap crash prevented:", error);
        res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
    }
});

// --- API ROUTES (For Search Dropdown) ---
app.get('/api/search', (req, res) => {
    const q = req.query.q || '';
    if (q.length < 1) return res.json([]);
    db.all("SELECT title, category FROM products WHERE title LIKE ? LIMIT 5", [`%${q}%`], (err, rows) => res.json(rows || []));
});

// --- PUBLIC ROUTES ---
app.get('/', (req, res) => {
    try {
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
            db.all(query, params, (err, products) => {
                res.status(200).render('index', { 
                    user: req.session ? req.session.user : null, 
                    products: products || [], 
                    categories: cats ? cats.map(c => c.name) : [],
                    searchQuery, 
                    categoryFilter: categoryFilter || 'All',
                    categoryRow: null 
                });
            });
        });
    } catch (error) {
        console.error("Home route crash prevented:", error);
        res.status(200).send("Loading...");
    }
});

// --- CATEGORY DIRECTORY & SEO ROUTES (Bulletproof Version) ---
app.get('/category/:name', (req, res) => {
    try {
        // Safely decode URL
        const categoryName = decodeURIComponent(req.params.name || '');
        
        // Using LOWER() is 100x safer across different SQLite versions than COLLATE NOCASE
        db.get("SELECT * FROM categories WHERE LOWER(name) = LOWER(?)", [categoryName], (err, categoryRow) => {
            
            if (err) console.error("DB Error:", err);
            
            // Failsafe so Google never gets a 404 or 500 error
            if (!categoryRow) {
                categoryRow = { 
                    name: categoryName,
                    seo_title: `${categoryName} - ExamHub`, 
                    seo_desc: `Browse the best tools and resources for ${categoryName}.`, 
                    seo_keywords: `${categoryName}, exams, tools` 
                };
            }
            
            db.all("SELECT products.*, users.username as vendor_name FROM products JOIN users ON products.vendor_id = users.id WHERE LOWER(category) = LOWER(?)", [categoryName], (err, products) => {
                
                db.all("SELECT name FROM categories", (err, cats) => {
                    res.status(200).render('index', { 
                        user: req.session ? req.session.user : null, 
                        products: products || [], 
                        categories: cats ? cats.map(c => c.name) : [],
                        searchQuery: '',
                        categoryFilter: categoryRow.name,
                        categoryRow: categoryRow 
                    });
                });
            });
        });
    } catch (error) {
        console.error("Category route crash prevented:", error);
        res.redirect('/');
    }
});

// --- AUTH ROUTES ---
app.get('/login', (req, res) => res.render('login', { error: null }));
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
app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });

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
    const { category_name, seo_title, seo_desc, seo_keywords } = req.body;
    db.run("INSERT INTO categories (name, seo_title, seo_desc, seo_keywords) VALUES (?, ?, ?, ?)", [category_name, seo_title, seo_desc, seo_keywords], () => res.redirect('/admin'));
});

app.post('/admin/edit-category', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    const { original_name, category_name, seo_title, seo_desc, seo_keywords } = req.body;
    
    db.run("UPDATE categories SET name = ?, seo_title = ?, seo_desc = ?, seo_keywords = ? WHERE name = ?", [category_name, seo_title, seo_desc, seo_keywords, original_name], () => {
        if (original_name !== category_name) {
            db.run("UPDATE products SET category = ? WHERE category = ?", [category_name, original_name], () => res.redirect('/admin'));
        } else {
            res.redirect('/admin');
        }
    });
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

        const catStmt = db.prepare("INSERT INTO categories (id, name, seo_title, seo_desc, seo_keywords) VALUES (?, ?, ?, ?, ?)");
        data.categories?.forEach(c => catStmt.run(c.id, c.name, c.seo_title, c.seo_desc, c.seo_keywords));
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
