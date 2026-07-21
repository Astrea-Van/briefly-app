const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust Vercel's reverse proxy for secure cookies
app.set('trust proxy', 1);

// Initialize Database Connection
require('./config/dbConfig');

// Core Middlewares
app.use(cors({ 
    origin: true, 
    credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public folder
app.use(express.static(path.join(process.cwd(), 'public')));

// Session Configuration (Configured for Vercel Serverless)
app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: { 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 
    }
}));

// API Routes
const analyzeRoutes = require('./routes/analyzeRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/analyze', analyzeRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'API running smoothly' });
});

// Root & fallback route (Express 5 syntax compatible with path-to-regexp)
app.get('/*path', (req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// Local dev listener
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running locally on port ${PORT}`);
    });
}

module.exports = app;