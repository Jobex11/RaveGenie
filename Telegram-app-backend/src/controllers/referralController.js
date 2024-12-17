require("dotenv").config();

const { User } = require("../models/database");

exports.getNumberOfReferrals = async (req, res) => {
  const { telegram_id } = req.params;

  try {
    const user = await User.findOne({ telegram_id });
    if (!user) return res.status(404).send("User not found.");

    const referralCount = user.referrals ? user.referrals.length : 0;

    res.status(200).json({
      telegram_id,
      referralCount,
      referrals: user.referrals,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching referral data.");
  }
};

exports.getUserRef = async (req, res) => {
  const { telegram_id } = req.params;

  try {
    const user = await User.findOne({ telegram_id });
    if (!user) return res.status(404).send("User not found.");

    const referrer = await User.findOne({ telegram_id: user.referred_by });

    const referrals = await User.find({ referred_by: telegram_id });

    const referralDetails = referrals.map((referral) => ({
      telegram_id: referral.telegram_id,
      gameusername: referral.accountName || "N/A",
      shares: referral.shares || 0,
      referralCode: referral.referralCode,
    }));

    res.status(200).json({
      message: "Referral details retrieved successfully",
      referrer: referrer
        ? {
            telegram_id: referrer.telegram_id,
            gameusername: referrer.accountName || "N/A",
            shares: referrer.shares || 0,
            referralCode: referrer.referralCode,
          }
        : null,
      referrals: referralDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching referral data.");
  }
};

exports.getReferralCode = async (req, res) => {
  const { telegram_id } = req.params;

  try {
    const user = await User.findOne({ telegram_id });
    if (!user) return res.status(404).send("User not found.");

    res.status(200).json({
      message: "Referral code retrieved successfully.",
      referralCode: user.referralCode,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("An error occurred while retrieving the referral code.");
  }
};

exports.getReferralLink = async (req, res) => {
  const { telegram_id } = req.params;

  try {
    const user = await User.findOne({ telegram_id });
    if (!user) return res.status(404).send("User not found.");

    const referralLink = `${process.env.APP_URL}/register?referralCode=${user.referralCode}`;
    res.status(200).json({
      message: "Referral link retrieved successfully.",
      referralLink,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("An error occurred while retrieving the referral link.");
  }
};
