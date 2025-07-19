import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()
const isAuth=async (req,res,next)=>{
    try {
        // Check for token in cookies (try both 'jwt' and 'token')
        let token = req.cookies.jwt || req.cookies.token;

        if(!token){
            return res.status(401).json({
                success: false,
                message: "Unauthorized - No token provided"
            });
        }
        
        let verifyToken = jwt.verify(token, process.env.JWT_SECRET);
        if(!verifyToken){
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Invalid token"
            });
        }
        
        req.userId = verifyToken.userId;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Invalid token"
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Token expired"
            });
        }
        
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export default isAuth