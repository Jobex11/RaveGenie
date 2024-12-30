const { User } = require("../models/database");
const Cards = require("../models/cards");

//==> GET DETAILS OF USER AT FIRST LOGIN
exports.authenticateUser = async (req, res) => {
  const {
    telegram_id,
    username,
    first_name,
    last_name,
    is_bot,
    chat_id,
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
      const referralCode = telegram_id; // Generate referral code
      user = new User({
        telegram_id,
        username,
        first_name,
        last_name,
        is_bot,
        chat_id,
        language_code,
        referralCode,
        referred_by: req.body.referred_by || null,
      });

      await user.save();

      // Set initial card if none exists. This assumes there is a default card in the database.
      const initialCard = await Cards.findOne();
      if (!user.currentCard) {
        user.currentCard = initialCard ? initialCard._id : null;
        await user.save();
      }

      const referralLink = `https://t.me/RaveGenie_Bot/game?start=${user.referralCode}`;
      return res.status(201).json({
        message: "New user created successfully 🎉",
        user: {
          ...user.toObject(),
          referralLink,
        },
      });
    }

    if (!user.referralCode) {
      user.referralCode = telegram_id;

      await user.save();
    }

    const referralLink = `https://t.me/RaveGenie_Bot/game?start=${user.referralCode}`;

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

//=>GET ALL USERS
exports.getAllUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const users = await User.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments();

    // Map users to include additional fields dynamically
    const usersWithDetails = users.map((user) => {
      const unlockedCardsCount = user.unlockedCards
        ? user.unlockedCards.length
        : 0;

      // Calculate referrals and related fields dynamically
      const referralCount = user.referrals ? user.referrals.length : 0;
      const claimReferrals_shares = user.claimReferrals_shares || 0;
      const tier1 = user.tier1 || 0;
      const tier2 = user.tier2 || 0;

      return {
        ...user._doc, // Spread the user document fields
        unlockedCardsCount,
        referrals: user.referrals || [], // Default to an empty array if not present
        claimReferrals_shares,
        tier1,
        tier2,
        referralCount,
      };
    });

    res.status(200).json({
      users: usersWithDetails,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

//==> GETSERBYID
exports.getUsersById = async (req, res) => {
  const { telegram_id } = req.params;
  try {
    const user = await User.findOne({ telegram_id });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Ensure the current card is set
    const initialCard = await Cards.findOne();
    if (!user.currentCard) {
      user.currentCard = initialCard ? initialCard._id : null;
      await user.save();
    }

    // Dynamically update the referrals array
    const referredUsers = await User.find({ referred_by: telegram_id });
    const referredIds = referredUsers.map((refUser) => refUser.telegram_id);

    // Calculate new referrals
    const newReferrals = referredIds.filter(id => !user.referrals.includes(id));

    if (newReferrals.length > 0) {
      // Add new referrals to the array
      user.referrals.push(...newReferrals);

      // Calculate additional shares for new referrals
      const newTier1Shares = newReferrals.length * 100; // 100 shares per new referral

      // Calculate Tier 2 shares for new referrals
      const newTier2Shares = await User.aggregate([
        {
          $match: { referred_by: { $in: newReferrals } },
        },
        {
          $group: { _id: null, count: { $sum: 1 } },
        },
      ]);

      const newTier2SharesCount = newTier2Shares.length > 0 ? newTier2Shares[0].count * 50 : 0;

      // Update claimReferrals_shares with new shares only
      user.claimReferrals_shares += (newTier1Shares + newTier2SharesCount);

      await user.save();
    }

    // Respond with the updated user data
    res.status(200).json({
      user,
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};





// ==> DELETE CHAT HISTROY
exports.deleteUserByChatId = async (req, res) => {
  const { chat_id } = req.params;

  try {
    const user = await User.findOneAndDelete({ chat_id });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "User data deleted successfully." });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};
