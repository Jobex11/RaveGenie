const crypto = require("crypto");

exports.createUser = async (req, res) => {
  const { telegram_id, accountName } = req.body;

  try {
    const existingUser = await User.findOne({ telegram_id });
    if (existingUser) return res.status(400).send("User already exists.");

    // Generate a unique referral code
    const referralCode = crypto.randomBytes(4).toString("hex") + telegram_id;

    const newUser = new User({
      telegram_id,
      accountName,
      referralCode,
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      referralCode: newUser.referralCode,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while creating the user.");
  }
};

exports.registerWithReferral = async (req, res) => {
  const { telegram_id, accountName, referralCode } = req.body;

  try {
    // Check if referral code is valid
    const referringUser = await User.findOne({ referralCode });
    if (!referringUser) return res.status(400).send("Invalid referral code.");

    // Check if the user already exists
    const existingUser = await User.findOne({ telegram_id });
    if (existingUser) return res.status(400).send("User already exists.");

    // Create new user
    const newUser = new User({
      telegram_id,
      accountName,
      referred_by: referringUser.telegram_id, // Set who referred this user
      referralCode: crypto.randomBytes(4).toString("hex") + telegram_id, // Generate new referral code
    });

    await newUser.save();

    // Update the referring user's referrals list
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
