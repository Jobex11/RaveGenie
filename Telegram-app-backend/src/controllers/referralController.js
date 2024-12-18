require("dotenv").config();

const { User } = require("../models/database");

exports.registerWithReferral = async (req, res) => {
  const { telegram_id, accountName, referralCode } = req.body;

  try {
    const referringUser = await User.findOne({ referralCode });
    if (!referringUser) return res.status(400).send("Invalid referral code.");

    const existingUser = await User.findOne({ telegram_id });
    if (existingUser) return res.status(400).send("User already exists.");

    const newUser = new User({
      telegram_id,
      accountName,
      referred_by: referringUser.telegram_id,
      referralCode: crypto.randomBytes(4).toString("hex") + telegram_id,
    });

    await newUser.save();

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

    user.referralCount = referralCount;
    await user.save();

    res.status(200).json({
      telegram_id,
      referralCount,
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

    const referrals = await User.find({ referred_by: user.referralCode });

    const referralDetails = referrals.map((referral) => ({
      telegram_id: referral.telegram_id,
      username: referral.username || "N/A",
      referralCode: referral.referralCode || "N/A",
      shares: referral.shares || 0,
      telegramImage: referral.additional_details?.photo_url || "N/A", // Adjust field based on schema
      accountName: referral.accountName || "N/A",
    }));

    user.referrals = referralDetails.map((referral) => referral.telegram_id); // Store only telegram IDs in `referrals` array
    await user.save();
    res.status(200).json({
      message: "Referral details retrieved and updated successfully",
      referrals: referralDetails,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("An error occurred while fetching and updating referral data.");
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
