import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - No token provided"
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            console.error("JWT verification error:", jwtError.message);
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Invalid token"
            });
        }
        
        if (!decoded || !decoded.userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Invalid token payload"
            });
        }

        // Add timeout to database query
        const user = await Promise.race([
            User.findById(decoded.userId).select("-password"),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Database query timeout')), 5000)
            )
        ]);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Error in protectRoute middleware:", error.message);
        
        if (error.message === 'Database query timeout') {
            return res.status(503).json({
                success: false,
                message: "Service temporarily unavailable"
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const adminOnly = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied - Admin only"
            });
        }
        next();
    } catch (error) {
        console.error("Error in adminOnly middleware:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};