const { Pool } = require('pg');

// Create connection pool using Vercel's DATABASE_URL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Verify connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to Neon PostgreSQL cloud database.');
        release();
    }
});

// Initialize Database Tables
const initDb = async () => {
    try {
        // 1. Users Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Analysis History Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS analysis_history (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                filename VARCHAR(255) NOT NULL,
                file_type VARCHAR(50) NOT NULL,
                analysis TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Database tables ready.');
    } catch (err) {
        console.error('Error creating database tables:', err.message);
    }
};

initDb();

// --- HELPER QUERIES (exact same signature as original code) ---

// Save a new user
const createUser = async (username, hashedPassword) => {
    const sql = `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id;`;
    const res = await pool.query(sql, [username, hashedPassword]);
    return res.rows[0].id;
};

// Find a user by username
const findUserByUsername = async (username) => {
    const sql = `SELECT * FROM users WHERE username = $1;`;
    const res = await pool.query(sql, [username]);
    return res.rows[0] || null;
};

// Save history linked to a user_id
const saveHistory = async (userId, filename, fileType, analysis) => {
    const sql = `
        INSERT INTO analysis_history (user_id, filename, file_type, analysis) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id;
    `;
    const res = await pool.query(sql, [userId, filename, fileType, analysis]);
    return res.rows[0].id;
};

// Fetch history only for a specific user_id
const getHistory = async (userId) => {
    const sql = `SELECT * FROM analysis_history WHERE user_id = $1 ORDER BY created_at DESC;`;
    const res = await pool.query(sql, [userId]);
    return res.rows;
};

module.exports = {
    pool,
    createUser,
    findUserByUsername,
    saveHistory,
    getHistory
};