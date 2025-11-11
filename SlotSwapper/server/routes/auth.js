// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database.js'); // Note: ../ to go up one directory

const router = express.Router();

// A simple (and insecure) secret for your tokens.
// In a real app, this should be in an environment file (.env)
const JWT_SECRET = "your-super-secret-key-123";

// --- SIGNUP Endpoint ---
// URL: POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Check if user already exists
        const userExists = await new Promise((resolve, reject) => {
            db.get("SELECT * FROM Users WHERE email = ?", [email], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (userExists) {
            return res.status(400).json({ message: "Email already in use." });
        }

        // 2. Hash the password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Create the new user
        // We use .run() to insert data and get the ID of the new row
        const { lastID } = await new Promise((resolve, reject) => {
            db.run("INSERT INTO Users (name, email, password) VALUES (?, ?, ?)",
                [name, email, passwordHash],
                function (err) { // Must use 'function' to get 'this'
                    if (err) reject(err);
                    resolve(this); // 'this' contains lastID
                }
            );
        });

        // 4. Create a JWT token
        const token = jwt.sign({ id: lastID }, JWT_SECRET, { expiresIn: '1h' });

        // 5. Send back the token
        res.status(201).json({ token });

    } catch (err) {
        console.error("Signup Error:", err.message);
        res.status(500).json({ message: "Server error during signup." });
    }
});


// --- LOGIN Endpoint ---
// URL: POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find the user by email
        const user = await new Promise((resolve, reject) => {
            db.get("SELECT * FROM Users WHERE email = ?", [email], (err, row) => {
                if (err) reject(err);
                resolve(row); // 'row' will be undefined if not found
            });
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        // 2. Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        // 3. Create a JWT token
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

        // 4. Send back the token
        res.status(200).json({ token });

    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(500).json({ message: "Server error during login." });
    }
});

module.exports = router;