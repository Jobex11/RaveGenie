const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

// Function to check Telegram membership
const checkTelegramMembership = async (telegramUserId) => {
  try {
    const response = await axios.get(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getChatMember`,
      {
        params: {
          chat_id: process.env.TELEGRAM_CHANNEL_ID,
          user_id: telegramUserId,
        },
      }
    );

    const memberStatus = response.data.result?.status;

    // Return true if the user is a member
    return ["member", "administrator", "creator"].includes(memberStatus);
  } catch (error) {
    console.error("Error in Telegram Service:", error.message);
    throw new Error("Failed to check Telegram membership.");
  }
};

// In-memory storage for user actions
const userActions = {};

// Save user's action
const recordButtonClickYoutube = (userId, action) => {
  if (!userActions[userId]) {
    userActions[userId] = {};
  }
  userActions[userId][action] = true;
};

// Check if the user has performed an action
const checkButtonClickYoutube = (userId, action) => {
  return userActions[userId]?.[action] || false;
};

// Save user's action
const recordButtonClickX = (userId, action) => {
  if (!userActions[userId]) {
    userActions[userId] = {};
  }
  userActions[userId][action] = true;
};

// Check if the user has performed an action
const checkButtonClickX = (userId, action) => {
  return userActions[userId]?.[action] || false;
};

module.exports = {
  recordButtonClickX,
  checkButtonClickX,
  recordButtonClickYoutube,
  checkButtonClickYoutube,
  checkTelegramMembership,
};
