const express = require('express');
const User = require('../models/User');
// Server-side fix (in your controller file)
const userLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email })
        console.log(user);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        
        // Generate a token (you might want to use a proper JWT solution)
        const token = generateToken(user._id); // You'll need to implement this function
        
        return res.status(200).json({ 
            user: user,
            token: token, 
            message: 'Login successful' 
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// Simple token generation function (for demonstration)
// In production, use a proper JWT library
function generateToken(userId) {
    // This is a simple example - use a proper JWT library in production
    return Buffer.from(`${userId}-${Date.now()}`).toString('base64');
}

// Similarly update the userDetails function to return a token on registration
const userDetails = async (req, res) => {
    const { firstName, email, lastName, password, domains, education_level } = req.body;

    try {
        const newUser = await User.create({
            email,
            password,
            domains,
            education_level,
            firstName,
            lastName
        });
        
        // Generate a token for the new user
        const token = generateToken(newUser._id);
        
        return res.status(201).json({ 
            user: newUser,
            token: token,
            message: 'User created successfully' 
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
module.exports = { userDetails, userLogin };