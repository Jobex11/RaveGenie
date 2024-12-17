const express = require("express");
const router = express.Router();
const referral = require("../controllers/referralController");

router.get("/referrals/:telegram_id", referral.getNumberOfReferrals);
router.get("/ref-details/:telegram_id", referral.getUserRef);
router.get("/referral-code/:telegram_id", referral.getReferralCode);
router.get("/referral-link/:telegram_id", referral.getReferralLink);

module.exports = router;
