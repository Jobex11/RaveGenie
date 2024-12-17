const crypto = require("crypto");
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
      .json({ error: "telegram_id and username are required." });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ telegram_id });

    if (!user) {
      // Create a new user if not found
      const referralCode = crypto.randomBytes(4).toString("hex") + telegram_id; // Generate referral code
      user = new User({
        telegram_id,
        username,
        first_name,
        last_name,
        is_bot,
        language_code,
        referralCode, // Add referral code
      });

      await user.save();

      //const referralLink = `${process.env.APP_URL}/register?ref=${referralCode}`;
      // // Generate referral link

      const referralLink = `https://t.me/RaveGenieBot?start=${user.referralCode}`;
      return res.status(201).json({
        message: "New user created successfully 🎉",
        user: {
          ...user.toObject(),
          referralLink, // Include referral link in response
        },
      });
    }

    // If user exists and doesn't have a referral code, generate one
    if (!user.referralCode) {
      user.referralCode = crypto.randomBytes(4).toString("hex") + telegram_id;
      await user.save();
    }

    // Generate referral link
    const referralLink = `${process.env.APP_URL}/register?ref=${user.referralCode}`;

    res.status(200).json({
      message: "We are glad to have you back 😊",
      user: {
        ...user.toObject(),
        referralLink, // Include referral link in response
      },
    });
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
/*
const { User } = require("../models/database");

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
    let user = await User.findOne({ telegram_id });

    if (!user) {
      user = new User({
        telegram_id,
        username,
        first_name,
        last_name,
        is_bot,
        language_code,
      });
      await user.save();
      return res
        .status(201)
        .json({ message: "New user created successfully 🎉. ", user });
    }

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

*/
