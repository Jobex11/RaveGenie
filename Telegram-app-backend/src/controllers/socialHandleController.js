const {
  recordButtonClickX,
  checkButtonClickX,
  recordButtonClickYoutube,
  checkButtonClickYoutube,
  checkTelegramMembership,
} = require("../services/socialHandleService");

// Controller to handle Telegram membership check
const checkMembership = async (req, res) => {
  const { telegramUserId } = req.body;

  if (!telegramUserId) {
    return res.status(400).json({ error: "Telegram user ID is required." });
  }

  try {
    const isMember = await checkTelegramMembership(telegramUserId);

    if (isMember) {
      res.json({
        isMember: true,
        message: "User is a member of the Telegram channel.",
      });
    } else {
      res.json({
        isMember: false,
        message: "User is not a member of the Telegram channel.",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const recordClickX = (req, res) => {
  const { userId, action } = req.body;

  if (!userId || !action) {
    return res.status(400).json({ error: "User ID and action are required." });
  }

  try {
    recordButtonClickX(userId, action);
    res.json({
      success: true,
      message: `${action} button click recorded for user ${userId}.`,
    });
  } catch (error) {
    console.error("Error recording button click:", error.message);
    res.status(500).json({ error: "Failed to record button click." });
  }
};

// Check if a user has clicked a button
const checkClickX = (req, res) => {
  const { userId, action } = req.body;

  if (!userId || !action) {
    return res.status(400).json({ error: "User ID and action are required." });
  }

  try {
    const hasClicked = checkButtonClickX(userId, action);
    res.json({ success: true, hasClicked });
  } catch (error) {
    console.error("Error checking button click:", error.message);
    res.status(500).json({ error: "Failed to check button click." });
  }
};

const recordClickYoutube = (req, res) => {
  const { userId, action } = req.body;

  if (!userId || !action) {
    return res.status(400).json({ error: "User ID and action are required." });
  }

  try {
    recordButtonClickX(userId, action);
    res.json({
      success: true,
      message: `${action} button click recorded for user ${userId}.`,
    });
  } catch (error) {
    console.error("Error recording button click:", error.message);
    res.status(500).json({ error: "Failed to record button click." });
  }
};

// Check if a user has clicked a button
const checkClickYoutube = (req, res) => {
  const { userId, action } = req.body;

  if (!userId || !action) {
    return res.status(400).json({ error: "User ID and action are required." });
  }

  try {
    const hasClicked = checkButtonClickX(userId, action);
    res.json({ success: true, hasClicked });
  } catch (error) {
    console.error("Error checking button click:", error.message);
    res.status(500).json({ error: "Failed to check button click." });
  }
};

module.exports = {
  recordClickX,
  checkClickX,
  recordClickYoutube,
  checkClickYoutube,
  checkMembership,
};
