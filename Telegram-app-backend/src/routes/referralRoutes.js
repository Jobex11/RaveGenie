const express = require("express");
const router = express.Router();
const referral = require("../controllers/referralController");

router.post("/register", referral.registerWithReferral); // Register with a referral code
router.get("/:telegram_id/referrals", referral.getNumberOfReferrals); // Get referral info
router.get("/:telegram_id/ref-details", referral.getUserRef); // Get detailed referral info

module.exports = router;
