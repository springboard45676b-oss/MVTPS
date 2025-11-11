// database.js
const sqlite3 = require('sqlite3').verbose();

// Use ':memory:' for an in-memory database, or a file path for a persistent one.
const DB_SOURCE = "dev.db";

// Connect to the database
const db = new sqlite3.Database(DB_SOURCE, (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message);
        throw err;
    } else {
        console.log('Connected to the SQLite database.');
        // Run the setup script to create tables
        createTables();
    }
});

// Function to create your tables
function createTables() {
    // We use 'IF NOT EXISTS' to avoid errors if the tables already exist
    const createUsersTable = `
    CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    );`;

    const createEventsTable = `
    CREATE TABLE IF NOT EXISTS Events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('BUSY', 'SWAPPABLE', 'SWAP_PENDING')),
        ownerId INTEGER NOT NULL,
        FOREIGN KEY (ownerId) REFERENCES Users (id)
    );`;

    const createSwapRequestsTable = `
    CREATE TABLE IF NOT EXISTS SwapRequests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requesterSlotId INTEGER NOT NULL,
        receiverSlotId INTEGER NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
        FOREIGN KEY (requesterSlotId) REFERENCES Events (id),
        FOREIGN KEY (receiverSlotId) REFERENCES Events (id)
    );`;

    // Run each table creation query
    db.serialize(() => {
        db.run(createUsersTable, (err) => {
            if (err) console.error("Error creating Users table:", err.message);
            else console.log("Users table created (or already exists).");
        });
        db.run(createEventsTable, (err) => {
            if (err) console.error("Error creating Events table:", err.message);
            else console.log("Events table created (or already exists).");
        });
        db.run(createSwapRequestsTable, (err) => {
            if (err) console.error("Error creating SwapRequests table:", err.message);
            else console.log("SwapRequests table created (or already exists).");
        });
    });
}

// Export the database connection
module.exports = db;