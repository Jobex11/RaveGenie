const express = require("express");
const router = express.Router();
const referral = require("../controllers/referralController");

router.post("/register", referral.registerWithReferral); // Register with a referral code
router.get("/referrals/:telegram_id", referral.getNumberOfReferrals); // Get referral info
router.get("/ref-details/:telegram_id", referral.getUserRef); // Get detailed referral info
router.get("/referral-code/:telegram_id", referral.getReferralCode); // Get referral code
router.get("/referral-link/:telegram_id", referral.getReferralLink); // Get referral link

module.exports = router;
