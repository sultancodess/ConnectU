import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    targetAmount: {
        type: Number,
        required: true,
        min: 1
    },
    raisedAmount: {
        type: Number,
        default: 0
    },
    college: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ["scholarship", "infrastructure", "research", "events", "emergency", "other"],
        required: true
    },
    images: [
        {
            type: String
        }
    ],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["active", "completed", "paused", "cancelled"],
        default: "active"
    },
    endDate: {
        type: Date,
        required: true
    },
    beneficiaryDetails: {
        name: String,
        contact: String,
        description: String
    },
    donorCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const Campaign = mongoose.model("Campaign", campaignSchema);
export default Campaign;