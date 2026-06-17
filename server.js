const express = require('express');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

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

// YAP Route - Explicitly public and accessible to everyone
app.get('/yap', (req, res) => {
    // Renders views/yap.ejs without checking for authentication
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

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`✅ Public route /yap is accessible to all users`);
});
