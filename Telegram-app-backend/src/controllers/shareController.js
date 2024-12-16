const { User } = require("../models/database");

// Update a user's shares based on telegram_id
exports.updateUserShares = async (req, res) => {
  const { telegram_id } = req.params; // Get telegram_id from route params
  const { shares } = req.body;

  if (!telegram_id || shares === undefined) {
    return res
      .status(400)
      .json({ error: "telegram_id and shares are required." });
  }

  try {
    // Find the user by telegram_id
    const user = await User.findOne({ telegram_id });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Update the user's shares
    user.shares += shares; // Add the given shares to the user's total
    await user.save();

    res.status(200).json({
      success: true,
      message: `Shares updated successfully. User now has ${user.shares} shares.`,
      user,
    });
  } catch (err) {
    console.error("Error updating shares:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update shares",
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
