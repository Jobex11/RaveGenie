require("dotenv").config();

const { User } = require("../models/database");

//==>> REGISTER NEW USER
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

//==>> GET TIER1
exports.tier1 = async (req, res) => {
  const { telegram_id } = req.params;

  try {
    const user = await User.findOne({ telegram_id });
    if (!user) return res.status(404).send("User not found.");

    const tier1 = await User.find({ referred_by: user.referralCode });

    const referralDetails = tier1.map((referral) => ({
      telegram_id: referral.telegram_id, //==> to get avatar_url of referrals
      username: referral.username || "N/A",
      referralCode: referral.referralCode || "N/A",
      shares: referral.shares || 0,
      accountName: referral.accountName || "N/A",
      dateJoined: referral.createdAt
        ? referral.createdAt.toISOString().split("T")[0]
        : "Unknown",
    }));

    user.tier1 = referralDetails.map((referral) => referral.telegram_id); // Store only telegram IDs in `referrals` array
    await user.save();
    res.status(200).json({
      message: "Tier1: Your immediate referrals retrieved successfully",
      tier1: referralDetails,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("An error occurred while fetching and updating referral data.");
  }
};

//==>> GET TIER2
exports.tier2 = async (req, res) => {
  const { telegram_id } = req.params;

  try {
    const user = await User.findOne({ telegram_id });
    if (!user) return res.status(404).send("User not found.");

    const tier1 = await User.find({ referred_by: user.referralCode });
    if (tier1.length === 0) {
      return res.status(200).json({
        message:
          "Tier2: No Tier 1 referrals found, so no Tier 2 referrals exist.",
        tier2: [],
      });
    }

    const tier2 = await User.find({
      referred_by: { $in: tier1.map((referral) => referral.referralCode) },
    });

    const tier2Details = tier2.map((referral) => ({
      telegram_id: referral.telegram_id, // Get avatar_url or Telegram ID
      username: referral.username || "N/A",
      referralCode: referral.referralCode || "N/A",
      shares: referral.shares || 0,
      accountName: referral.accountName || "N/A",
      dateJoined: referral.createdAt
        ? referral.createdAt.toISOString().split("T")[0]
        : "Unknown",
    }));

    user.tier2 = tier2.map((referral) => referral.telegram_id);
    await user.save();

    res.status(200).json({
      message: "Tier2: Referrals of your referrals retrieved successfully",
      tier2: tier2Details,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send(
        "An error occurred while fetching and updating Tier 2 referral data."
      );
  }
};

//==>> GET USERS NUMBER OF REFERRALS
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

//==>>  GET REFERRALS DETAILS
exports.getUserRef = async (req, res) => {
  const { telegram_id } = req.params;

  try {
    const user = await User.findOne({ telegram_id });
    if (!user) return res.status(404).send("User not found.");

    const referrals = await User.find({ referred_by: user.referralCode });

    const referralDetails = referrals.map((referral) => ({
      telegram_id: referral.telegram_id, //==> to get avatar_url of referrals
      username: referral.username || "N/A",
      referralCode: referral.referralCode || "N/A",
      shares: referral.shares || 0,
      accountName: referral.accountName || "N/A",
      dateJoined: referral.createdAt
        ? referral.createdAt.toISOString().split("T")[0]
        : "Unknown",
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

//==> GET REFERRALCODE
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

//==>> GET REFERRAL LINK
exports.getReferralLink = async (req, res) => {
  const { telegram_id } = req.params;

  try {
    const user = await User.findOne({ telegram_id });
    if (!user) return res.status(404).send("User not found.");

    // Generate the referral link
    const referralLink = `https://t.me/RaveGenieBot?start=${user.referralCode}`;

    // Save the referral link to the database if not already saved
    if (user.referralLink !== referralLink) {
      user.referralLink = referralLink;
      await user.save();
    }

    res.status(200).json({
      message: "Referral link retrieved and saved successfully.",
      referralLink,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("An error occurred while retrieving and saving the referral link.");
  }
};

// ==>>> CLAIM REFERRAL SHARES
exports.claimReferralShares = async (req, res) => {
  const { telegram_id } = req.params;

  try {
    // Find the user by telegram_id
    const user = await User.findOne({ telegram_id });
    if (!user) return res.status(404).send("User not found.");

    // Calculate the number of new referrals
    const currentReferralCount = user.referrals ? user.referrals.length : 0;
    const claimedReferralCount = user.referralCount || 0; // Previously claimed referrals
    const newReferrals = currentReferralCount - claimedReferralCount;

    // Update claimable shares based on new referrals
    if (newReferrals > 0) {
      const newClaimableShares = newReferrals * 1000;
      user.claimReferrals_shares =
        (user.claimReferrals_shares || 0) + newClaimableShares;

      // Update the stored referral count
      user.referralCount = currentReferralCount;

      // Save the updated user document
      await user.save();
    }

    // Check if the user has claimable shares
    const claimableShares = user.claimReferrals_shares || 0;
    if (claimableShares > 0) {
      // Add claimable shares to the total shares
      user.shares += claimableShares;

      // Reset claimable shares after claiming
      user.claimReferrals_shares = 0;

      // Save the updated user document
      await user.save();

      res.status(200).json({
        message: "Referral shares claimed successfully.",
        telegram_id,
        addedShares: claimableShares,
        totalShares: user.shares,
        currentReferralCount,
      });
    } else {
      res.status(400).send("No claimable referral shares at the moment.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while claiming referral shares.");
  }
};
