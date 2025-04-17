const User = require("../models/User")

const router = require("express").Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const verifyToken = require("../middleware/verify-token")

router.post("/sign-up", async(req, res) => {
    try {
        const { username, password } = req.body;
        
        // Convert username to lowercase
        const lowercaseUsername = username.toLowerCase();
        
        // Check if username is already taken
        const foundUsername = await User.findOne({ username: lowercaseUsername });
        if(foundUsername) {
            return res.status(409).json({err: "Username already taken"});
        }
        
        const createdUser = await User.create({
            username: lowercaseUsername,
            hashedPassword: bcrypt.hashSync(password, 12)
        });
        
        const convertedObject = createdUser.toObject();
        delete convertedObject.hashedPassword;
        res.status(201).json(convertedObject);
    }
    catch(error) {
        console.error("Sign-up error:", error);
        if (error.code === 11000) {
            return res.status(409).json({err: "Username already exists"});
        }
        res.status(500).json({error: error.message});
    }
});

router.post("/login", async(req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user by username (case-insensitive)
        const foundUser = await User.findOne({ 
            username: username.toLowerCase() 
        });
        if(!foundUser) {
            return res.status(401).json({err: "Username not found. Please sign up"});
        }

        // Verify password
        const isPasswordMatch = bcrypt.compareSync(password, foundUser.hashedPassword);
        if(!isPasswordMatch) {
            return res.status(401).json({err: "Username or password incorrect"});
        }

        // Create JWT token
        const payload = foundUser.toObject();
        delete payload.hashedPassword;
        const token = jwt.sign(payload, process.env.SESSION_SECRET, {expiresIn: "24h"});

        res.status(200).json({token});
    } catch(error) {
        console.error("Login error:", error);
        res.status(500).json({error: error.message});
    }
});

router.get("/verify", verifyToken, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router