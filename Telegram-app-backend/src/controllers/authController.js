const crypto = require("crypto");
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
      .json({ error: "telegram_id and username are required." });
  }

  try {
    let user = await User.findOne({ telegram_id });

    if (!user) {
      const referralCode = crypto.randomBytes(4).toString("hex") + telegram_id; // Generate referral code
      user = new User({
        telegram_id,
        username,
        first_name,
        last_name,
        is_bot,
        language_code,
        referralCode,
        referred_by: req.body.referred_by || null,
      });

      await user.save();

      const referralLink = `https://t.me/RaveGenieBot?start=${user.referralCode}`;
      return res.status(201).json({
        message: "New user created successfully 🎉",
        user: {
          ...user.toObject(),
          referralLink,
        },
      });
    }

    if (!user.referralCode) {
      //user.referralCode = crypto.randomBytes(4).toString("hex") + telegram_id;
      user.referralCode = `ref_${telegram_id}_${Date.now()}`;

      await user.save();
    }

    const referralLink = `https://t.me/RaveGenieBot?start=${user.referralCode}`;

    res.status(200).json({
      message: "We are glad to have you back 😊",
      user: {
        ...user.toObject(),
        referralLink,
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
const crypto = require("crypto");
const { User } = require("../models/database");

exports.authenticateUser = async (req, res) => {
  const {
    telegram_id,
    username,
    first_name,
    last_name,
    is_bot,
    language_code,
    referralCode, 
  } = req.body;

  if (!telegram_id || !username) {
    return res
      .status(400)
      .json({ error: "telegram_id and username are required." });
  }

  try {
    let user = await User.findOne({ telegram_id });

    if (!user) {
      const generatedReferralCode =
        crypto.randomBytes(4).toString("hex") + telegram_id; 

      let referredBy = null;
      if (referralCode) {
        const referrer = await User.findOne({ referralCode });
        if (referrer) {
          referredBy = {
            telegram_id: referrer.telegram_id,
            username: referrer.username,
            referralCode: referrer.referralCode,
          };

          referrer.referrals.push(telegram_id);
          await referrer.save();
        } else {
          console.warn(`Referral code ${referralCode} is invalid.`);
        }
      }

      user = new User({
        telegram_id,
        username,
        first_name,
        last_name,
        is_bot,
        language_code,
        referralCode: generatedReferralCode,
        referred_by: referredBy,
      });

      await user.save();

      const referralLink = `https://t.me/RaveGenieBot?start=${user.referralCode}`;
      return res.status(201).json({
        message: "New user created successfully 🎉",
        user: {
          ...user.toObject(),
          referralLink,
        },
      });
    }

    if (!user.referralCode) {
      user.referralCode = crypto.randomBytes(4).toString("hex") + telegram_id;
      await user.save();
    }

    const referralLink = `https://t.me/RaveGenieBot?start=${user.referralCode}`;

    res.status(200).json({
      message: "We are glad to have you back 😊",
      user: {
        ...user.toObject(),
        referralLink,
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

*/
