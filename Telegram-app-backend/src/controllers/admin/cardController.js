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
      const allCards = await Cards.find().sort({ createdAt: 1 }); // Sorted by creation date
      if (!allCards || allCards.length === 0) {
        return res.status(404).json({ message: "No cards available." });
      }
  
      // Initialize variables
      const unlockedCards = user.unlockedCards || [];
      const unlockedPoints = user.unlockPoints || 0;
      let currentCard = user.currentCard;
  
      // Check if the current card has been fully completed
      if (
        currentCard &&
        unlockedPoints >= currentCard.totalUnlockPoints
      ) {
        // Save the current card to user's collectedCards (if applicable)
        user.collectedCards = user.collectedCards || [];
        user.collectedCards.push({
          _id: currentCard._id,
          title: currentCard.title,
          image: currentCard.image,
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
          });
        } else {
          // No more cards to unlock
          user.currentCard = null;
        }
  
        // Save the updated unlockedCards to user
        user.unlockedCards = unlockedCards;
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
                Math.floor((unlockedPoints.toFixed() / card.totalUnlockPoints) * 100),
                100
              ),
              progressDisplay: `${unlockedPoints.toFixed()}/${card.totalUnlockPoints}`,
            }
          : null;
  
        return {
          id: card._id,
          title: card.title,
          image: card.image,
          totalUnlockPoints: card.totalUnlockPoints,
          basePoint: card.basePoint,
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
  
  

// exports.getUnlockedCards = async (req, res) => {
//   const { telegram_id } = req.params;

//   if (!telegram_id) {
//     return res.status(400).json({
//       success: false,
//       message: "User ID is required",
//     });
//   }

//   try {
//     const user = await User.findById(telegram_id).populate("unlockedCards");
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Unlocked cards fetched successfully",
//       unlockedCards: user.unlockedCards,
//     });
//   } catch (error) {
//     console.error("Error:", error.message);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch unlocked cards",
//       error: error.message,
//     });
//   }
// };

// exports.getCurrentCard = async (req, res) => {
//   const { telegram_id } = req.params;

//   if (!telegram_id) {
//     return res.status(400).json({
//       success: false,
//       message: "User ID is required",
//     });
//   }

//   try {
//     const user = await User.findOne({ telegram_id }).populate("currentCard");
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }
//     const initialCard = await Cards.findOne();
//     if (!user.currentCard) {
//       user.currentCard = initialCard ? initialCard._id : null;
//       await user.save();
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Current card fetched successfully",
//       userName: user.username,
//       currentCard: user.currentCard,
//     });
//   } catch (error) {
//     console.error("Error:", error.message);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch current card",
//       error: error.message,
//     });
//   }
// };


exports.deleteCards = async (req, res) => {
    try {
        await Cards.deleteMany({});
        res.status(200).json({ message: "All Cards deleted successfully" });
      } catch (error) {
        console.error("Error deleting tasks:", error);
        res.status(500).json({ message: "An error occurred while deleting tasks" });
      }
}
