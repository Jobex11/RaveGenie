const { User } = require("../models/database");

// Update a user's shares
exports.updateUserShares = async (req, res) => {
  const { telegram_id, shares } = req.body;

  if (!telegram_id || shares === undefined) {
    return res
      .status(400)
      .json({ error: "telegram_id and shares are required." });
  }

  try {
    const user = await User.findOne({ telegram_id });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Update the user's shares
    user.shares += shares; // Add the given shares to the user's total
    await user.save();

    res.status(200).json({
      message: `Shares updated successfully. User now has ${user.shares} shares.`,
      user,
    });
  } catch (err) {
    console.error("Error updating shares:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Fetch total shares from all users
exports.getTotalShares = async (req, res) => {
  try {
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
