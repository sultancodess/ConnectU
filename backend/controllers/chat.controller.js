import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { io, userSocketMap } from "../index.js";

// Get all chats for a user
export const getUserChats = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const chats = await Chat.find({
            participants: userId
        })
        .populate("participants", "firstName lastName profileImage userName")
        .populate("lastMessage")
        .sort({ lastMessageTime: -1 });

        res.status(200).json({
            success: true,
            chats
        });
    } catch (error) {
        console.error("Error in getUserChats:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get or create a chat between two users
export const getOrCreateChat = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        // Check if users are connected
        const currentUser = await User.findById(currentUserId);
        if (!currentUser.connection.includes(userId)) {
            return res.status(403).json({
                success: false,
                message: "You can only chat with connected users"
            });
        }

        // Find existing chat
        let chat = await Chat.findOne({
            participants: { $all: [currentUserId, userId] }
        }).populate("participants", "firstName lastName profileImage userName");

        // Create new chat if doesn't exist
        if (!chat) {
            chat = new Chat({
                participants: [currentUserId, userId]
            });
            await chat.save();
            await chat.populate("participants", "firstName lastName profileImage userName");
        }

        res.status(200).json({
            success: true,
            chat
        });
    } catch (error) {
        console.error("Error in getOrCreateChat:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get messages for a specific chat
export const getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        
        const messages = await Message.find({ chat: chatId })
            .populate("sender", "firstName lastName profileImage userName")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        res.status(200).json({
            success: true,
            messages: messages.reverse()
        });
    } catch (error) {
        console.error("Error in getChatMessages:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Send a message
export const sendMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { content, messageType = "text" } = req.body;
        const senderId = req.user._id;

        // Verify chat exists and user is participant
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.includes(senderId)) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Create message
        const message = new Message({
            chat: chatId,
            sender: senderId,
            content,
            messageType,
            readBy: [{ user: senderId }]
        });

        await message.save();
        await message.populate("sender", "firstName lastName profileImage userName");

        // Update chat's last message
        chat.lastMessage = message._id;
        chat.lastMessageTime = new Date();
        await chat.save();

        // Send real-time message to participants
        chat.participants.forEach(participantId => {
            if (participantId.toString() !== senderId.toString()) {
                const socketId = userSocketMap.get(participantId.toString());
                if (socketId) {
                    io.to(socketId).emit("newMessage", {
                        message,
                        chatId
                    });
                }
            }
        });

        res.status(201).json({
            success: true,
            message
        });
    } catch (error) {
        console.error("Error in sendMessage:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

        await Message.updateMany(
            { 
                chat: chatId,
                "readBy.user": { $ne: userId }
            },
            { 
                $push: { 
                    readBy: { 
                        user: userId,
                        readAt: new Date()
                    }
                }
            }
        );

        res.status(200).json({
            success: true,
            message: "Messages marked as read"
        });
    } catch (error) {
        console.error("Error in markMessagesAsRead:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};