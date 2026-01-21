// routes/swap.js
const express = require('express');
const db = require('../database.js');
const router = express.Router();

// --- GET All Swappable Slots (The Marketplace) ---
// URL: GET /api/swap/swappable-slots
router.get('/swappable-slots', (req, res) => {
    // req.userId is from our protectRoute middleware
    const userId = req.userId;

    // Find all events that are 'SWAPPABLE' AND do NOT belong to the current user
    const sql = `
        SELECT e.id, e.title, e.startTime, e.endTime, u.name as ownerName
        FROM Events e
        JOIN Users u ON e.ownerId = u.id
        WHERE e.status = 'SWAPPABLE' AND e.ownerId != ?
    `;

    db.all(sql, [userId], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: "Server error fetching swappable slots." });
        }
        res.status(200).json(rows);
    });
});

// --- CREATE a New Swap Request ---
// URL: POST /api/swap/swap-request
router.post('/swap-request', async (req, res) => {
    const { mySlotId, theirSlotId } = req.body;
    const requesterId = req.userId;

    // We use a "transaction" to ensure both updates happen, or neither does.
    db.serialize(() => {
        db.run("BEGIN TRANSACTION;");

        // 1. Verify mySlot (must be 'SWAPPABLE' and owned by me)
        const checkMySlotSql = "SELECT * FROM Events WHERE id = ? AND ownerId = ? AND status = 'SWAPPABLE'";
        db.get(checkMySlotSql, [mySlotId, requesterId], (err, mySlot) => {
            if (err || !mySlot) {
                db.run("ROLLBACK;");
                return res.status(400).json({ message: "Invalid or non-swappable slot." });
            }

            // 2. Verify theirSlot (must be 'SWAPPABLE' and NOT owned by me)
            const checkTheirSlotSql = "SELECT * FROM Events WHERE id = ? AND ownerId != ? AND status = 'SWAPPABLE'";
            db.get(checkTheirSlotSql, [theirSlotId, requesterId], (err, theirSlot) => {
                if (err || !theirSlot) {
                    db.run("ROLLBACK;");
                    return res.status(400).json({ message: "Target slot is invalid or no longer swappable." });
                }

                // 3. Create the SwapRequest
                const createRequestSql = "INSERT INTO SwapRequests (requesterSlotId, receiverSlotId, status) VALUES (?, ?, 'PENDING')";
                db.run(createRequestSql, [mySlotId, theirSlotId], function (err) {
                    if (err) {
                        db.run("ROLLBACK;");
                        return res.status(500).json({ message: "Error creating swap request." });
                    }

                    // 4. Update both slots to 'SWAP_PENDING'
                    const updateSlotsSql = "UPDATE Events SET status = 'SWAP_PENDING' WHERE id = ? OR id = ?";
                    db.run(updateSlotsSql, [mySlotId, theirSlotId], (err) => {
                        if (err) {
                            db.run("ROLLBACK;");
                            return res.status(500).json({ message: "Error updating slot statuses." });
                        }

                        // 5. If all good, commit the transaction
                        db.run("COMMIT;");
                        res.status(201).json({ message: "Swap request created successfully." });
                    });
                });
            });
        });
    });
});


// --- RESPOND to a Swap Request ---
// URL: POST /api/swap/swap-response/:requestId
router.post('/swap-response/:requestId', (req, res) => {
    const { accepted } = req.body; // true or false
    const requestId = req.params.requestId;
    const receiverId = req.userId; // The person clicking "Accept"

    db.serialize(() => {
        db.run("BEGIN TRANSACTION;");

        // 1. Get the request and verify the logged-in user is the receiver
        const getRequestSql = `
            SELECT sr.*, rcv.ownerId as receiverOwnerId, req.ownerId as requesterOwnerId
            FROM SwapRequests sr
            JOIN Events rcv ON sr.receiverSlotId = rcv.id
            JOIN Events req ON sr.requesterSlotId = req.id
            WHERE sr.id = ? AND rcv.ownerId = ? AND sr.status = 'PENDING'
        `;
        
        db.get(getRequestSql, [requestId, receiverId], (err, request) => {
            if (err || !request) {
                db.run("ROLLBACK;");
                return res.status(404).json({ message: "Request not found, not yours, or no longer pending." });
            }

            const { requesterSlotId, receiverSlotId, requesterOwnerId, receiverOwnerId } = request;

            if (accepted === true) {
                // --- ACCEPT LOGIC ---
                // 1. Update the owners of the two slots
                const swapOwner1Sql = "UPDATE Events SET ownerId = ? WHERE id = ?";
                db.run(swapOwner1Sql, [requesterOwnerId, receiverSlotId], (err) => {
                    if (err) return db.run("ROLLBACK;");

                    const swapOwner2Sql = "UPDATE Events SET ownerId = ? WHERE id = ?";
                    db.run(swapOwner2Sql, [receiverOwnerId, requesterSlotId], (err) => {
                        if (err) return db.run("ROLLBACK;");

                        // 2. Set both slots back to 'BUSY'
                        const updateSlotsSql = "UPDATE Events SET status = 'BUSY' WHERE id = ? OR id = ?";
                        db.run(updateSlotsSql, [requesterSlotId, receiverSlotId], (err) => {
                            if (err) return db.run("ROLLBACK;");

                            // 3. Mark the request as 'ACCEPTED'
                            const updateRequestSql = "UPDATE SwapRequests SET status = 'ACCEPTED' WHERE id = ?";
                            db.run(updateRequestSql, [requestId], (err) => {
                                if (err) return db.run("ROLLBACK;");
                                db.run("COMMIT;");
                                res.status(200).json({ message: "Swap accepted!" });
                            });
                        });
                    });
                });

            } else {
                // --- REJECT LOGIC ---
                // 1. Set both slots back to 'SWAPPABLE'
                const updateSlotsSql = "UPDATE Events SET status = 'SWAPPABLE' WHERE id = ? OR id = ?";
                db.run(updateSlotsSql, [requesterSlotId, receiverSlotId], (err) => {
                    if (err) return db.run("ROLLBACK;");

                    // 2. Mark the request as 'REJECTED'
                    const updateRequestSql = "UPDATE SwapRequests SET status = 'REJECTED' WHERE id = ?";
                    db.run(updateRequestSql, [requestId], (err) => {
                        if (err) return db.run("ROLLBACK;");
                        db.run("COMMIT;");
                        res.status(200).json({ message: "Swap rejected." });
                    });
                });
            }
        });
    });
});

// --- [NEW] GET Incoming Swap Requests ---
// URL: GET /api/swap/requests/incoming
router.get('/requests/incoming', (req, res) => {
    const userId = req.userId;
    
    // Find requests where the logged-in user is the *receiver*
    const sql = `
        SELECT sr.id as requestId, sr.status, 
               req_evt.title as offeringSlotTitle, 
               rcv_evt.title as mySlotTitle,
               requester.name as requesterName
        FROM SwapRequests sr
        JOIN Events rcv_evt ON sr.receiverSlotId = rcv_evt.id
        JOIN Events req_evt ON sr.requesterSlotId = req_evt.id
        JOIN Users requester ON req_evt.ownerId = requester.id
        WHERE rcv_evt.ownerId = ? AND sr.status = 'PENDING'
    `;
    
    db.all(sql, [userId], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: "Error fetching incoming requests." });
        }
        res.status(200).json(rows);
    });
});

// --- [NEW] GET Outgoing Swap Requests ---
// URL: GET /api/swap/requests/outgoing
router.get('/requests/outgoing', (req, res) => {
    const userId = req.userId;
    
    // Find requests where the logged-in user is the *requester*
    const sql = `
        SELECT sr.id as requestId, sr.status, 
               req_evt.title as mySlotTitle, 
               rcv_evt.title as desiredSlotTitle,
               receiver.name as receiverName
        FROM SwapRequests sr
        JOIN Events rcv_evt ON sr.receiverSlotId = rcv_evt.id
        JOIN Events req_evt ON sr.requesterSlotId = req_evt.id
        JOIN Users receiver ON rcv_evt.ownerId = receiver.id
        WHERE req_evt.ownerId = ?
    `;
    
    db.all(sql, [userId], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: "Error fetching outgoing requests." });
        }
        res.status(200).json(rows);
    });
});


module.exports = router;