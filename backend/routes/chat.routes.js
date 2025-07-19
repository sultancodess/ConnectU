import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
    getUserChats,
    getOrCreateChat,
    getChatMessages,
    sendMessage,
    markMessagesAsRead
} from "../controllers/chat.controller.js";

const router = express.Router();

// Get all chats for user
router.get("/", protectRoute, getUserChats);

// Get or create chat with specific user
router.get("/user/:userId", protectRoute, getOrCreateChat);

// Get messages for specific chat
router.get("/:chatId/messages", protectRoute, getChatMessages);

// Send message to chat
router.post("/:chatId/messages", protectRoute, sendMessage);

// Mark messages as read
router.patch("/:chatId/read", protectRoute, markMessagesAsRead);

export default router;