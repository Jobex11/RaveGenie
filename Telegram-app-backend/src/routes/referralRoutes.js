const express = require("express");
const router = express.Router();
const referral = require("../controllers/referralController");

router.post("/create", referral.createUser); // Create a new user
router.post("/register", referral.registerWithReferral); // Register with a referral code
router.get("/:telegram_id", referral.getUserDetails); // Get user details
router.get("/:telegram_id/referrals", referral.getNumberOfReferrals); // Get referral info

module.exports = router;
