const Cards = require("../../models/cards");
const { User } = require("../../models/database"); // Your user model
const cloudinary = require("../../bucket/cloudinary.js");
const multer = require("multer");
const TelegramBot = require("node-telegram-bot-api");
const Tasks = require("../../models/tasks.js");

const TOKEN = process.env.TELEGRAM_BOT_TOKEN; // Your Telegram Bot Token
const bot = new TelegramBot(TOKEN);

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadImageToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "cards" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(new Error("Failed to upload image to Cloudinary"));
        } else {
          resolve(result);
        }
      }
    );
    stream.end(file.buffer);
  });
};
exports.createCards = async (req, res) => {
  const {
    title,
    totalUnlockPoints,
    basePoint,
    taskPoint,
    associatedWealthClass,
  } = req.body;

  if (
    !title ||
    !totalUnlockPoints ||
    !basePoint ||
    !taskPoint ||
    !req.file ||
    !associatedWealthClass
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required (including an image)",
    });
  }

  try {
    // Upload image to Cloudinary
    const cloudinaryResult = await uploadImageToCloudinary(req.file);
    const imageUrl = cloudinaryResult.secure_url;

    // Save task in the database
    const newCard = new Cards({
      title,
      totalUnlockPoints,
      basePoint,
      taskPoint,
      image: imageUrl,
      associatedWealthClass,
    });

    await newCard.save();
    return res.status(201).json({
      message: "Card created successfully",
      card: newCard,
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({
      error: error.message,
      message: "Failed to create card",
      success: false,
    });
  }
};
exports.getUserCards = async (req, res) => {
  const { telegram_id } = req.params;

  try {
    // Fetch user data
    const user = await User.findOne({ telegram_id }).populate("currentCard");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Fetch all cards from the database
    const allCards = await Cards.find().sort({ createdAt: 1 });
    if (!allCards || allCards.length === 0) {
      return res.status(404).json({ message: "No cards available." });
    }

    // Initialize variables
    const unlockedCards = user.unlockedCards || [];
    const unlockedPoints = user.unlockPoints || 0;
    let currentCard = user.currentCard;

    // Check if the current card has been fully completed
    if (currentCard && unlockedPoints >= currentCard.totalUnlockPoints) {
      // Save the current card to user's collectedCards (if applicable)
      user.collectedCards = user.collectedCards || [];
      user.collectedCards.push({
        _id: currentCard._id,
        title: currentCard.title,
        image: currentCard.image,
        wealthClass: currentCard.associatedWealthClass,
      });

      // Find the index of the current card in allCards
      const currentIndex = allCards.findIndex(
        (card) => card._id.toString() === currentCard._id.toString()
      );

      // Unlock the next card if available
      if (currentIndex + 1 < allCards.length) {
        const nextCard = allCards[currentIndex + 1];

        // Mark the next card as current and unlocked
        user.currentCard = nextCard._id;
        unlockedCards.push({
          _id: nextCard._id,
          title: nextCard.title,
          image: nextCard.image,
          wealthClass: nextCard.associatedWealthClass,
        });
      } else {
        // No more cards to unlock
        user.currentCard = null;
      }

      // Save the updated unlockedCards to user
      user.unlockedCards = unlockedCards;
      user.unlockedCardsCount = unlockedCards.length;
    }

    // Map over all cards to assign properties dynamically
    const responseCards = allCards.map((card) => {
      const isCurrent =
        card._id.toString() === (user.currentCard?._id.toString() || "");
      const isUnlocked =
        unlockedPoints >= card.totalUnlockPoints ||
        unlockedCards.some(
          (unlockedCard) => unlockedCard._id.toString() === card._id.toString()
        );

      const progress = isCurrent
        ? {
          unlockedPoints,
          progressInPercentage: Math.min(
            Math.floor(
              (unlockedPoints.toFixed() / card.totalUnlockPoints) * 100
            ),
            100
          ),
          progressDisplay: `${unlockedPoints.toFixed()}/${card.totalUnlockPoints
            }`,
        }
        : null;

      return {
        id: card._id,
        title: card.title,
        image: card.image,
        wealthClass: card.associatedWealthClass,
        totalUnlockPoints: card.totalUnlockPoints,
        basePoint: card.basePoint,
        taskPoint: card.taskPoint,
        isUnlocked,
        isCurrent,
        progress,
      };
    });
    // Save user changes
    await user.save();

    res.status(200).json({
      message: "Cards fetched successfully.",
      unlockedCards,
      cards: responseCards,
      unlockedCardsCount: user.unlockedCards ? user.unlockedCards.length : 0,
    });
  } catch (error) {
    console.error("Error fetching user cards:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user cards",
      error: error.message,
    });
  }
};

exports.getNumberOfUnlockedCards = async (req, res) => {
  const { telegram_id } = req.params;

  try {
    const user = await User.findOne({ telegram_id });
    if (!user) return res.status(404).send("User not found.");

    const unlockedCardCount = user.unlockedCards
      ? user.unlockedCards.length
      : 0;

    user.unlockedCardsCount = unlockedCardCount;
    await user.save();

    res.status(200).json({
      telegram_id,
      unlockedCardCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while number of unlocked card");
  }
};

exports.deleteCards = async (req, res) => {
  const { cardId } = req.body;
  try {
    await Cards.findOneAndDelete(cardId);
    res.status(200).json({ message: "Card deleted successfully" });
  } catch (error) {
    console.error("Error deleting tasks:", error);
    res.status(500).json({ message: "An error occurred while deleting tasks" });
  }
};
