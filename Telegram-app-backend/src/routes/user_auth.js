const userSchema = require("../../mongoose/schemas/database.mjs");

app.post("/auth", async (req, res) => {
  const { userId, username, additional_details } = req.body;

  if (!telegram_id || !telegram_username) {
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
        telegram_username,
        additional_details: additional_details || {}, // Optional additional details
      });
      await user.save();
      return res
        .status(201)
        .json({ message: "New user created successfully.", user });
    }

    // If user exists, return their data
    res.status(200).json({ message: "User authenticated successfully.", user });
  } catch (err) {
    console.error("Error during authentication:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});
