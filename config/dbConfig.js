const { Pool } = require('pg');

// Create connection pool to Neon Cloud Postgres using Vercel's DATABASE_URL variable
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test connection and print status to terminal logs
pool.connect((err, client, release) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log('Connected to Neon PostgreSQL database successfully.');
        release();
    }
});

// Initialize Tables on server startup
const initDb = async () => {
    try {
        // 1. Create Users Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Create Analysis History Table with foreign key constraint
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
        console.error('Error creating tables:', err.message);
    }
};

initDb();

// --- HELPER QUERIES (Using Async/Await for zero callback errors) ---

// Save a new user
const createUser = async (username, hashedPassword) => {
    try {
        const sql = `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id;`;
        const res = await pool.query(sql, [username, hashedPassword]);
        return res.rows[0].id;
    } catch (err) {
        throw err;
    }
};

// Find a user by username
const findUserByUsername = async (username) => {
    try {
        const sql = `SELECT * FROM users WHERE username = $1;`;
        const res = await pool.query(sql, [username]);
        return res.rows[0] || null;
    } catch (err) {
        throw err;
    }
};

// Save history linked to a user_id
const saveHistory = async (userId, filename, fileType, analysis) => {
    try {
        const sql = `
            INSERT INTO analysis_history (user_id, filename, file_type, analysis) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id;
        `;
        const res = await pool.query(sql, [userId, filename, fileType, analysis]);
        return res.rows[0].id;
    } catch (err) {
        throw err;
    }
};

// Fetch history only for a specific user_id
const getHistory = async (userId) => {
    try {
        const sql = `SELECT * FROM analysis_history WHERE user_id = $1 ORDER BY created_at DESC;`;
        const res = await pool.query(sql, [userId]);
        return res.rows;
    } catch (err) {
        throw err;
    }
};

module.exports = {
    pool,
    createUser,
    findUserByUsername,
    saveHistory,
    getHistory
};