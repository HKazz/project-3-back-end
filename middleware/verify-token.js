const jwt = require("jsonwebtoken")
// This route checks the token in the request and verifies it for me
function verifyToken(req, res, next) {
    try {
        // Check if authorization header exists
        if (!req.headers.authorization) {
            return res.status(401).json({ err: "No token provided" });
        }

        // Check if the authorization header has the correct format
        const authHeader = req.headers.authorization;
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ err: "Invalid token format" });
        }

        const token = authHeader.split(" ")[1];
        
        // Verify the token
        const decoded = jwt.verify(token, process.env.SESSION_SECRET);
        
        // Add the user info to the request
        req.user = decoded;
        
        next();
    } catch (err) {
        console.error("Token verification error:", err.message);
        // if there is any error we will send back this error message
        res.status(401).json({ err: "Invalid token" });
    }
}

module.exports = verifyToken