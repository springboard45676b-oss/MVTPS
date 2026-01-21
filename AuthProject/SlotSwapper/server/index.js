// index.js
const express = require('express');
const cors = require('cors');
const db = require('./database.js');

// --- Import Routes & Middleware ---
const authRoutes = require('./routes/auth.js');
const eventRoutes = require('./routes/events.js');
const swapRoutes = require('./routes/swap.js'); // New
const protectRoute = require('./middleware/auth.js');

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Routes ---
app.get('/', (req, res) => {
    res.json({ message: "Welcome to the SlotSwapper API!" });
});

// Auth routes are public (not protected)
app.use('/api/auth', authRoutes);

// All routes below this are protected
app.use(protectRoute);

// Event routes
app.use('/api/events', eventRoutes);

// Swap routes
app.use('/api/swap', swapRoutes); // New


// --- Start the Server ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});