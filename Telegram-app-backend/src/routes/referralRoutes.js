const express = require("express");
const router = express.Router();

const referral = require("../controllers/referralController");

router.post("/register", referral.registerWithReferral); // Register with a referral code
router.get("/referrals/:telegram_id", referral.getNumberOfReferrals);
router.get("/ref-details/:telegram_id", referral.getUserRef);
router.get("/referral-code/:telegram_id", referral.getReferralCode);
router.get("/referral-link/:telegram_id", referral.getReferralLink);
router.get("/tier1/:telegram_id", referral.tier1);
router.get("/tier2/:telegram_id", referral.tier2);
router.post("/referralsclaim/:telegram_id", referral.claimReferralShares);

module.exports = router;
