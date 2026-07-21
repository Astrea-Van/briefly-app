const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database connection
require('./config/dbConfig');

// Middleware
app.use(cors({
    origin: true,
    credentials: true // Crucial to allow sessions/cookies across frontend/backend
}));
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Configure Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true if enforcing strict HTTPS cookies
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

// API Routes
const analyzeRoutes = require('./routes/analyzeRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/analyze', analyzeRoutes);
app.use('/api/auth', authRoutes);

// Explicit root route to serve index.html (Fixes "Cannot GET /" on Vercel)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;