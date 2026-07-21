const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database Connection
require('./config/dbConfig');

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production', 
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 
    }
}));

// API Routes
const analyzeRoutes = require('./routes/analyzeRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/analyze', analyzeRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend connected successfully!' });
});

// Run local listener outside Vercel
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running locally on port ${PORT}`);
    });
}

module.exports = app;