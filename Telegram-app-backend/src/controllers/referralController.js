require("dotenv").config();

const { User } = require("../models/database");

exports.registerWithReferral = async (req, res) => {
  const { telegram_id, accountName, referralCode } = req.body;

  try {
    // Check if referral code is valid
    const referringUser = await User.findOne({ referralCode });
    if (!referringUser) return res.status(400).send("Invalid referral code.");

    // Check if the user already exists
    const existingUser = await User.findOne({ telegram_id });
    if (existingUser) return res.status(400).send("User already exists.");

    // Create new user
    const newUser = new User({
      telegram_id,
      accountName,
      referred_by: referringUser.telegram_id, // Set who referred this user
      referralCode: crypto.randomBytes(4).toString("hex") + telegram_id, // Generate new referral code
    });

    await newUser.save();

    // Update the referring user's referrals list
    referringUser.referrals.push(telegram_id);
    await referringUser.save();

    res.status(201).json({
      message: "User registered successfully with referral.",
      referralCode: newUser.referralCode,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred during registration.");
  }
};

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

    // Use deep linking format
    const referralLink = `https://t.me/RaveGenieBot?start=${user.referralCode}`;
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
