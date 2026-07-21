const { Pool } = require('pg');

// Initialize PostgreSQL Pool with SSL configuration for cloud databases (Neon / Supabase)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

let isDbInitialized = false;

// Safe, non-blocking table creation check
const ensureDbInit = async () => {
    if (isDbInitialized) return;
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

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

        isDbInitialized = true;
        console.log('Database tables verified successfully.');
    } catch (err) {
        console.error('Database initialization warning:', err.message);
    }
};

// Internal query wrapper ensuring tables are instantiated before executing queries
const query = async (text, params) => {
    await ensureDbInit();
    return pool.query(text, params);
};

// --- HELPER FUNCTIONS ---

const createUser = async (username, hashedPassword) => {
    const sql = `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id;`;
    const res = await query(sql, [username, hashedPassword]);
    return res.rows[0].id;
};

const findUserByUsername = async (username) => {
    const sql = `SELECT * FROM users WHERE username = $1;`;
    const res = await query(sql, [username]);
    return res.rows[0] || null;
};

const saveHistory = async (userId, filename, fileType, analysis) => {
    const sql = `
        INSERT INTO analysis_history (user_id, filename, file_type, analysis) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id;
    `;
    const res = await query(sql, [userId, filename, fileType, analysis]);
    return res.rows[0].id;
};

const getHistory = async (userId) => {
    const sql = `SELECT * FROM analysis_history WHERE user_id = $1 ORDER BY created_at DESC;`;
    const res = await query(sql, [userId]);
    return res.rows;
};

module.exports = {
    pool,
    createUser,
    findUserByUsername,
    saveHistory,
    getHistory
};