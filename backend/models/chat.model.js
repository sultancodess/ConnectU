import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    ],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    lastMessageTime: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;