const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../history.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Initialize both Tables (Users & Analysis History)
db.serialize(() => {
    // 1. Create Users Table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 2. Create/Update Analysis History Table with user_id
    db.run(`
        CREATE TABLE IF NOT EXISTS analysis_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            filename TEXT NOT NULL,
            file_type TEXT NOT NULL,
            analysis TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) {
            console.error('Error creating tables:', err.message);
        } else {
            console.log('Database tables ready.');
        }
    });
});

// --- HELPER QUERIES wrapped in Promises ---

// Save a new user
const createUser = (username, hashedPassword) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO users (username, password) VALUES (?, ?)`;
        db.run(sql, [username, hashedPassword], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
};

// Find a user by username
const findUserByUsername = (username) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM users WHERE username = ?`;
        db.get(sql, [username], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

// Save history linked to a user_id
const saveHistory = (userId, filename, fileType, analysis) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO analysis_history (user_id, filename, file_type, analysis) VALUES (?, ?, ?, ?)`;
        db.run(sql, [userId, filename, fileType, analysis], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
};

// Fetch history only for a specific user_id
const getHistory = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM analysis_history WHERE user_id = ? ORDER BY created_at DESC`;
        db.all(sql, [userId], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

module.exports = {
    db,
    createUser,
    findUserByUsername,
    saveHistory,
    getHistory
};