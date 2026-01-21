// middleware/auth.js
const jwt = require('jsonwebtoken');

// We need the same secret key we used in routes/auth.js
const JWT_SECRET = "your-super-secret-key-123";

const protectRoute = (req, res, next) => {
    try {
        // 1. Get the token from the header
        const authHeader = req.headers['authorization'];
        
        // The header is "Bearer TOKEN"
        const token = authHeader && authHeader.split(' ')[1];

        if (token == null) {
            // 401 Unauthorized
            return res.status(401).json({ message: "No token provided." });
        }

        // 2. Verify the token
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                // 403 Forbidden (token is no longer valid)
                return res.status(403).json({ message: "Invalid token." });
            }

            // 3. Token is valid, attach user ID to the request
            // 'user' is the payload we signed: { id: user.id }
            req.userId = user.id;
            
            // 4. Call the next function in the chain (our endpoint logic)
            next();
        });

    } catch (err) {
        res.status(500).json({ message: "Error in authentication middleware." });
    }
};

module.exports = protectRoute;