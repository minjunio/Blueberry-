// REPLACE your existing app.get('/order/:order_id') with this:
app.get('/order/:order_id', (req, res) => {
    db.get("SELECT orders.*, products.title as product_title, products.price as product_price FROM orders JOIN products ON orders.product_id = products.id WHERE order_id = ?", [req.params.order_id], (err, order) => {
        if (!order || err) return res.redirect('/');
        renderSafe(res, 'order', { order });
    });
});

// REPLACE your existing app.get('/admin') with this:
app.get('/admin', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
    db.all("SELECT * FROM categories", (err, categories) => {
        db.all("SELECT products.*, users.username as vendor_name FROM products JOIN users ON products.vendor_id = users.id", (err, products) => {
            db.all("SELECT id, username FROM users WHERE role = 'vendor'", (err, users) => {
                // Now joining the price so the Admin Panel can see it too
                db.all("SELECT orders.*, products.title as product_title, products.price as product_price FROM orders LEFT JOIN products ON orders.product_id = products.id ORDER BY orders.created_at DESC", (err, orders) => {
                    renderSafe(res, 'admin', { user: req.session.user, categories: categories || [], products: products || [], users: users || [], orders: orders || [] });
                });
            });
        });
    });
});
