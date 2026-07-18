const bcrypt = require('bcryptjs');
const { createUser, findUserByUsername } = require('../config/dbConfig');

// 1. SIGN UP (Register new user)
const signup = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, error: "Username and password are required." });
        }

        // Check if user already exists
        const existingUser = await findUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ success: false, error: "Username is already taken." });
        }

        // Hash the password (encrypt it securely)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save to database
        const userId = await createUser(username, hashedPassword);

        res.status(201).json({ success: true, message: "User registered successfully!", userId });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// 2. LOGIN
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, error: "Username and password are required." });
        }

        // Find user by username
        const user = await findUserByUsername(username);
        if (!user) {
            return res.status(400).json({ success: false, error: "Invalid username or password." });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, error: "Invalid username or password." });
        }

        // Save user information to the session
        req.session.userId = user.id;
        req.session.username = user.username;

        res.json({ 
            success: true, 
            message: "Login successful!", 
            user: { id: user.id, username: user.username } 
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// 3. LOGOUT
const logout = async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, error: "Could not log out." });
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        res.json({ success: true, message: "Logged out successfully." });
    });
};

// 4. CHECK AUTH STATUS (Check if user is already logged in on page load)
const checkAuth = (req, res) => {
    if (req.session && req.session.userId) {
        res.json({ 
            loggedIn: true, 
            user: { id: req.session.userId, username: req.session.username } 
        });
    } else {
        res.json({ loggedIn: false });
    }
};

module.exports = {
    signup,
    login,
    logout,
    checkAuth
};