const { User } = require("../models/database");

// Update a user's shares based on telegram_id
exports.updateUserShares = async (req, res) => {
  const { telegram_id } = req.params;
  const { shares, shareType } = req.body; // Include `shareType` in the request

  if (!telegram_id || shares === undefined || !shareType) {
    return res
      .status(400)
      .json({ error: "telegram_id, shares, and shareType are required." });
  }

  try {
    const user = await User.findOne({ telegram_id });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (user.claimedShares.get(shareType)) {
      return res
        .status(400)
        .json({ error: `Shares of type '${shareType}' already claimed.` });
    }

    // Update the user's shares and claim status for the specific share type
    user.shares += shares;
    user.claimedShares.set(shareType, true);
    await user.save();

    res.status(200).json({
      message: `Hey gamer, you have recieved ${shares} shares for ${shareType} 🎉`,
      user,
    });
  } catch (err) {
    console.error("Error updating shares:", err);
    res.status(500).json({
      success: false,
      message: "An error occured while updating shares",
      error: err.message,
    });
  }
};

// Fetch shares of a specific user based on telegram_id
exports.getUserShares = async (req, res) => {
  const { telegram_id } = req.params; // Get telegram_id from route params

  try {
    // Find the user by telegram_id
    const user = await User.findOne({ telegram_id });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({
      telegram_id: user.telegram_id,
      shares: user.shares,
      claimedShares: user.claimedShares,
      ranks: user.ranks,
      collectedCard: user.collectedCards,
    });
  } catch (err) {
    console.error("Error fetching user shares:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Fetch total shares from all users
exports.getTotalShares = async (req, res) => {
  try {
    // Aggregate the total shares across all users
    const totalShares = await User.aggregate([
      { $group: { _id: null, total: { $sum: "$shares" } } },
    ]);

    const total = totalShares[0]?.total || 0; // Default to 0 if no users

    res.status(200).json({ totalShares: total });
  } catch (err) {
    console.error("Error fetching total shares:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};
