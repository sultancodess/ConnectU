import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    campaign: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campaign",
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 1
    },
    paymentId: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed", "refunded"],
        default: "pending"
    },
    paymentMethod: {
        type: String,
        enum: ["razorpay", "stripe"],
        required: true
    },
    message: {
        type: String,
        default: ""
    },
    isAnonymous: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Donation = mongoose.model("Donation", donationSchema);
export default Donation;