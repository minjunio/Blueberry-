const express = require('express');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');

// --- ENHANCEMENT: Added compression to improve load times ---
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// --- ENHANCEMENT: Bind to 0.0.0.0 so the server is accessible on your local network ---
const HOST = '0.0.0.0';

// ==========================================
// 1. App Configuration & Middleware
// ==========================================

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Security: Protects against common web vulnerabilities (adjusted for EJS/external assets)
app.use(helmet({
    contentSecurityPolicy: false, // Set to false if you are loading external scripts/fonts (like Google Fonts)
}));

// --- ENHANCEMENT: Compress response bodies to make the site faster ---
app.use(compression());

// Logging: Logs HTTP requests to the console
app.use(morgan('dev'));

// CORS: Allows cross-origin requests
app.use(cors());

// Body Parsers: Allows Express to read incoming form data and JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files: Serve CSS, images, and JS from a 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 2. Public Routes (Accessible by ANY user)
// ==========================================

// Homepage / Root
app.get('/', (req, res) => {
    res.render('index'); 
});

// YAP Route - Explicitly public and accessible to everyone at /yap
app.get('/yap', (req, res) => {
    // Renders views/yap.ejs without checking for authentication
    res.render('yap'); 
});

// --- ENHANCEMENT: Fallback route just in case someone types the .ejs extension in the URL ---
app.get('/yap.ejs', (req, res) => {
    res.render('yap'); 
});

// Payment Confirmed Route (From your previous EJS file)
app.get('/payment-confirmed', (req, res) => {
    // Example logic checking if they actually have the software
    // In reality, you'd check your database here based on the user's session/ID
    const userHasSoftware = true; 
    
    res.render('payment-confirmed', { hasSoftware: userHasSoftware });
});

// ==========================================
// 3. Mock Authentication Middleware
// ==========================================

// Any route defined AFTER this middleware will require the user to be logged in/verified
const requireAuth = (req, res, next) => {
    const isVerified = true; // Replace with your actual auth logic (e.g., session, JWT)
    
    if (isVerified) {
        next();
    } else {
        res.status(403).send('Unauthorized: You must be logged in to view this page.');
    }
};

// ==========================================
// 4. Protected Routes (Require Authentication)
// ==========================================

// Tutorial Route - Only accessible if they pass the requireAuth check
app.get('/tutorial', requireAuth, (req, res) => {
    res.render('tutorial');
});

// ==========================================
// 5. Error Handling
// ==========================================

// 404 Handler: Catch unhandled routes
app.use((req, res, next) => {
    res.status(404).send('404: Page Not Found');
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('500: Internal Server Error');
});

// ==========================================
// 6. Start Server
// ==========================================

// --- ENHANCEMENT: Listen on HOST (0.0.0.0) ---
app.listen(PORT, HOST, () => {
    console.log(`🚀 Server is running locally on http://localhost:${PORT}`);
    console.log(`🌐 Network Access: http://<Your-IPv4-Address>:${PORT} (Accessible on LAN)`);
    console.log(`✅ Public routes /yap and /yap.ejs are accessible to all users`);
});
