const { User } = require("../models/database");

// Set or Update Preferred Username
exports.setPreferredUsername = async (req, res) => {
  const { telegram_id, preferred_username } = req.body;

  if (!telegram_id || !preferred_username) {
    return res
      .status(400)
      .json({ error: "telegram_id and preferred_username are required." });
  }

  try {
    // Find the user by telegram_id
    const user = await User.findOne({ telegram_id });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Update the preferred username
    user.accountName = preferred_username;
    await user.save();

    res.status(200).json({
      message: "Preferred username updated successfully.",
      user,
    });
  } catch (err) {
    console.error("Error updating preferred username:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Get Preferred Username
exports.getPreferredUsername = async (req, res) => {
  const { telegram_id } = req.params;

  try {
    const user = await User.findOne({ telegram_id });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({
      message: "Preferred username retrieved successfully.",
      preferred_username: user.accountName,
    });
  } catch (err) {
    console.error("Error retrieving preferred username:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};
