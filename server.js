const express = require('express');
const session = require('express-session'); // 1. Import express-session
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database connection
require('./config/dbConfig');

// Middleware
app.use(cors({
    origin: true,
    credentials: true // Crucial to allow sessions/cookies to work across frontend/backend
}));
app.use(express.json());
app.use(express.static('public'));

// 2. Configure Session Middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecretkey', // Use an env variable or fallback
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true if using HTTPS in production
        httpOnly: true, // Prevents frontend JS from reading the cookie (XSS protection)
        maxAge: 24 * 60 * 60 * 1000 // Cookie expires in 1 day
    }
}));

// Routes
const analyzeRoutes = require('./routes/analyzeRoutes');
const authRoutes = require('./routes/authRoutes'); // 3. Import auth routes

app.use('/api/analyze', analyzeRoutes);
app.use('/api/auth', authRoutes); // 4. Register auth routes

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});