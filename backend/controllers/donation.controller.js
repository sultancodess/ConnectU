import Campaign from "../models/campaign.model.js";
import Donation from "../models/donation.model.js";
import User from "../models/user.model.js";

// Get all campaigns
export const getAllCampaigns = async (req, res) => {
    try {
        const { category, status = "active", page = 1, limit = 10 } = req.query;
        
        const filter = { status };
        if (category && category !== "all") {
            filter.category = category;
        }

        const campaigns = await Campaign.find(filter)
            .populate("createdBy", "firstName lastName profileImage")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Campaign.countDocuments(filter);

        res.status(200).json({
            success: true,
            campaigns,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalCampaigns: total
            }
        });
    } catch (error) {
        console.error("Error in getAllCampaigns:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get single campaign
export const getCampaign = async (req, res) => {
    try {
        const { campaignId } = req.params;
        
        const campaign = await Campaign.findById(campaignId)
            .populate("createdBy", "firstName lastName profileImage userName");

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: "Campaign not found"
            });
        }

        // Get recent donations for this campaign
        const recentDonations = await Donation.find({ 
            campaign: campaignId,
            paymentStatus: "completed",
            isAnonymous: false
        })
        .populate("donor", "firstName lastName profileImage")
        .sort({ createdAt: -1 })
        .limit(10);

        res.status(200).json({
            success: true,
            campaign,
            recentDonations
        });
    } catch (error) {
        console.error("Error in getCampaign:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Create new campaign (Admin only)
export const createCampaign = async (req, res) => {
    try {
        const {
            title,
            description,
            targetAmount,
            college,
            category,
            endDate,
            beneficiaryDetails,
            images = []
        } = req.body;

        const campaign = new Campaign({
            title,
            description,
            targetAmount,
            college,
            category,
            endDate,
            beneficiaryDetails,
            images,
            createdBy: req.user._id
        });

        await campaign.save();
        await campaign.populate("createdBy", "firstName lastName profileImage");

        res.status(201).json({
            success: true,
            message: "Campaign created successfully",
            campaign
        });
    } catch (error) {
        console.error("Error in createCampaign:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Process donation
export const processDonation = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const {
            amount,
            paymentId,
            paymentMethod,
            message = "",
            isAnonymous = false
        } = req.body;

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: "Campaign not found"
            });
        }

        if (campaign.status !== "active") {
            return res.status(400).json({
                success: false,
                message: "Campaign is not active"
            });
        }

        // Create donation record
        const donation = new Donation({
            donor: req.user._id,
            campaign: campaignId,
            amount,
            paymentId,
            paymentMethod,
            message,
            isAnonymous,
            paymentStatus: "completed" // In real app, verify payment first
        });

        await donation.save();

        // Update campaign
        campaign.raisedAmount += amount;
        campaign.donorCount += 1;
        
        if (campaign.raisedAmount >= campaign.targetAmount) {
            campaign.status = "completed";
        }

        await campaign.save();

        res.status(201).json({
            success: true,
            message: "Donation processed successfully",
            donation
        });
    } catch (error) {
        console.error("Error in processDonation:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Get user's donation history
export const getUserDonations = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10 } = req.query;

        const donations = await Donation.find({ donor: userId })
            .populate("campaign", "title college targetAmount raisedAmount")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const totalDonated = await Donation.aggregate([
            { $match: { donor: userId, paymentStatus: "completed" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        res.status(200).json({
            success: true,
            donations,
            totalDonated: totalDonated[0]?.total || 0
        });
    } catch (error) {
        console.error("Error in getUserDonations:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Update campaign (Admin only)
export const updateCampaign = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const updates = req.body;

        const campaign = await Campaign.findByIdAndUpdate(
            campaignId,
            updates,
            { new: true, runValidators: true }
        ).populate("createdBy", "firstName lastName profileImage");

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: "Campaign not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Campaign updated successfully",
            campaign
        });
    } catch (error) {
        console.error("Error in updateCampaign:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};