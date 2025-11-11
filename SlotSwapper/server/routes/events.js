// routes/events.js
const express = require('express');
const db = require('../database.js');
const router = express.Router();

// Note: All routes in this file will be protected
// The 'protectRoute' middleware will be applied in index.js

// --- GET All Events for Logged-in User ---
// URL: GET /api/events
router.get('/', (req, res) => {
    // req.userId is attached by our 'protectRoute' middleware
    const userId = req.userId;

    const sql = "SELECT * FROM Events WHERE ownerId = ?";
    
    db.all(sql, [userId], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: "Server error fetching events." });
        }
        res.status(200).json(rows);
    });
});

// --- CREATE a New Event ---
// URL: POST /api/events
router.post('/', (req, res) => {
    const { title, startTime, endTime } = req.body;
    const userId = req.userId;

    // New events are 'BUSY' by default
    const sql = "INSERT INTO Events (title, startTime, endTime, status, ownerId) VALUES (?, ?, ?, 'BUSY', ?)";

    db.run(sql, [title, startTime, endTime, userId], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: "Server error creating event." });
        }
        // Send back the newly created event
        res.status(201).json({
            id: this.lastID,
            title,
            startTime,
            endTime,
            status: 'BUSY',
            ownerId: userId
        });
    });
});

// --- UPDATE an Event's Status (e.g., make it 'SWAPPABLE') ---
// URL: PUT /api/events/:id
router.put('/:id', (req, res) => {
    const { status } = req.body; // e.g., { "status": "SWAPPABLE" }
    const eventId = req.params.id;
    const userId = req.userId;

    // Check if the new status is valid
    if (!['BUSY', 'SWAPPABLE'].includes(status)) {
        return res.status(400).json({ message: "Invalid status update." });
    }

    // This is a critical query:
    // It updates the event *only if* the ID matches AND the user is the owner.
    const sql = "UPDATE Events SET status = ? WHERE id = ? AND ownerId = ?";

    db.run(sql, [status, eventId, userId], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: "Server error updating event." });
        }
        
        if (this.changes === 0) {
            // This means no row was updated, either because
            // the event doesn't exist or it doesn't belong to this user.
            return res.status(404).json({ message: "Event not found or user not authorized." });
        }
        
        res.status(200).json({ message: "Event status updated." });
    });
});

module.exports = router;