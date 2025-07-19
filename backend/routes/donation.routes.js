import express from "express";
import { protectRoute, adminOnly } from "../middlewares/auth.middleware.js";
import {
    getAllCampaigns,
    getCampaign,
    createCampaign,
    processDonation,
    getUserDonations,
    updateCampaign
} from "../controllers/donation.controller.js";

const router = express.Router();

// Public routes
router.get("/campaigns", getAllCampaigns);
router.get("/campaigns/:campaignId", getCampaign);

// Protected routes
router.post("/campaigns/:campaignId/donate", protectRoute, processDonation);
router.get("/my-donations", protectRoute, getUserDonations);

// Admin only routes
router.post("/campaigns", protectRoute, adminOnly, createCampaign);
router.put("/campaigns/:campaignId", protectRoute, adminOnly, updateCampaign);

export default router;