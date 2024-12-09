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

exports.getNumberOfReferrals = async (req, res) => {
  const { telegram_id } = req.params;

  try {
    const user = await User.findOne({ telegram_id });
    if (!user) return res.status(404).send("User not found.");

    // Assuming `referrals` is an array in the user's schema
    const referralCount = user.referrals ? user.referrals.length : 0;

    res.status(200).json({
      telegram_id,
      referralCount,
      referrals: user.referrals, // Optional: Include detailed referral information
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching referral data.");
  }
};

exports.getUserDetails = async (req, res) => {
  const { telegram_id } = req.params;

  try {
    const user = await User.findOne({ telegram_id });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      telegram_id: user.telegram_id,
      accountName: user.accountName,
      referralCode: user.referralCode,
      referred_by: user.referred_by || null,
      referrals: user.referrals || [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching user details.");
  }
};
