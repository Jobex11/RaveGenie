const { User } = require("../models/database");

// Authenticate User
exports.authenticateUser = async (req, res) => {
  const {
    telegram_id,
    username,
    first_name,
    last_name,
    is_bot,
    language_code,
  } = req.body;

  if (!telegram_id || !username) {
    return res
      .status(400)
      .json({ error: "telegram_id and telegram_username are required." });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ telegram_id });

    if (!user) {
      // Create a new user if not found
      user = new User({
        telegram_id,
        username,
        first_name,
        last_name,
        is_bot,
        language_code,
        // Optional additional details
      });
      await user.save();
      return res
        .status(201)
        .json({ message: "New user created successfully 🎉. ", user });
    }

    // If user exists, return their data
    res.status(200).json({ message: "We are glad to have you back 😊", user });
  } catch (err) {
    console.error("Error during authentication:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};
