import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import userRouter from "./routes/user.routes.js"
import postRouter from "./routes/post.routes.js"
import connectionRouter from "./routes/connection.routes.js"
import http from "http"
import { Server } from "socket.io"
import notificationRouter from "./routes/notification.routes.js"
import chatRouter from "./routes/chat.routes.js"
import donationRouter from "./routes/donation.routes.js"

// Load environment variables
dotenv.config()

// Create Express app
const app = express()
const server = http.createServer(app)

// Configure Socket.IO with better error handling
export const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENVIRONMENT === "production" 
            ? process.env.CLIENT_URL 
            : ["http://localhost:5173", "http://localhost:5175"],
        credentials: true,
        methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
})

// Middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())
app.use(cors({
    origin: process.env.NODE_ENVIRONMENT === "production" 
        ? process.env.CLIENT_URL 
        : ["http://localhost:5173", "http://localhost:5175"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    })
})

// API Routes
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/post", postRouter)
app.use("/api/connection", connectionRouter)
app.use("/api/notification", notificationRouter)
app.use("/api/chat", chatRouter)
app.use("/api/donation", donationRouter)

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error)
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENVIRONMENT === "production" 
            ? "Internal server error" 
            : error.message
    })
})

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    })
})

const port = process.env.PORT || 8000
export const userSocketMap = new Map();
export const onlineUsers = new Set();

io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    
    socket.on("register", (userId) => {
        try {
            if (!userId) {
                console.log('Invalid userId provided for registration');
                return;
            }
            
            // Store socket mapping
            userSocketMap.set(userId, socket.id);
            onlineUsers.add(userId);
            
            // Join user to their personal room
            socket.join(userId);
            
            // Broadcast to all clients that this user is online
            socket.broadcast.emit("userOnline", userId);
            
            // Send current online users to the newly connected user
            socket.emit("onlineUsers", Array.from(onlineUsers));
            
            console.log(`User ${userId} connected with socket ${socket.id}`);
            console.log(`Online users: ${onlineUsers.size}`);
        } catch (error) {
            console.error('Error in socket register:', error);
        }
    });
    
    // Join chat room
    socket.on("joinChat", (chatId) => {
        try {
            if (chatId) {
                socket.join(chatId);
                console.log(`Socket ${socket.id} joined chat ${chatId}`);
            }
        } catch (error) {
            console.error('Error joining chat:', error);
        }
    });
    
    // Leave chat room
    socket.on("leaveChat", (chatId) => {
        try {
            if (chatId) {
                socket.leave(chatId);
                console.log(`Socket ${socket.id} left chat ${chatId}`);
            }
        } catch (error) {
            console.error('Error leaving chat:', error);
        }
    });
    
    // Handle typing indicators
    socket.on("typing", ({ chatId, userId }) => {
        try {
            if (chatId && userId) {
                socket.to(chatId).emit("userTyping", { chatId, userId });
            }
        } catch (error) {
            console.error('Error handling typing:', error);
        }
    });
    
    socket.on("stopTyping", ({ chatId, userId }) => {
        try {
            if (chatId && userId) {
                socket.to(chatId).emit("userStoppedTyping", { chatId, userId });
            }
        } catch (error) {
            console.error('Error handling stop typing:', error);
        }
    });
    
    // Handle connection status updates
    socket.on("getOnlineStatus", (userIds) => {
        try {
            if (Array.isArray(userIds)) {
                const onlineStatus = {};
                userIds.forEach(userId => {
                    onlineStatus[userId] = onlineUsers.has(userId);
                });
                socket.emit("onlineStatus", onlineStatus);
            }
        } catch (error) {
            console.error('Error getting online status:', error);
        }
    });
    
    socket.on("disconnect", (reason) => {
        try {
            // Find which user this socket belongs to
            let disconnectedUserId = null;
            for (let [userId, socketId] of userSocketMap.entries()) {
                if (socketId === socket.id) {
                    disconnectedUserId = userId;
                    userSocketMap.delete(userId);
                    onlineUsers.delete(userId);
                    break;
                }
            }
            
            if (disconnectedUserId) {
                // Broadcast that user went offline
                socket.broadcast.emit("userOffline", disconnectedUserId);
                console.log(`User ${disconnectedUserId} disconnected (${reason})`);
            }
            
            console.log(`Socket disconnected: ${socket.id} (${reason})`);
        } catch (error) {
            console.error('Error handling disconnect:', error);
        }
    });
    
    // Handle errors
    socket.on("error", (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
    });
});


// Start server with proper error handling
const startServer = async () => {
    try {
        // Connect to database first
        await connectDb();
        
        // Start the server
        server.listen(port, () => {
            console.log(`🚀 Server running on port ${port}`);
            console.log(`🌐 Environment: ${process.env.NODE_ENVIRONMENT || 'development'}`);
            console.log(`📡 Socket.IO server ready`);
        });
        
        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${port} is already in use`);
                process.exit(1);
            } else {
                console.error('❌ Server error:', error);
            }
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the server
startServer();


