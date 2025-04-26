const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Authorization token missing or invalid"
        });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_SECRET_KEY, (err, decoded) => {
        if (err) {
            const message = err.name === "TokenExpiredError" 
                ? "Token expired, please log in again" 
                : "Invalid token";

            return res.status(403).json({
                success: false,
                message
            });
        }
        
        req.user = decoded;
        next();
    });
};

module.exports = verifyJWT;