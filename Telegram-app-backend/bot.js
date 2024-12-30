const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

// Replace with your Telegram bot token
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Initialize Telegram bot
const bot = new TelegramBot(TOKEN, { polling: true });

// Express setup
const app = express();

// Bot command to send welcome message
bot.onText(/\/start(?: (.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;

  // Extract the referred_by code if present
  const referredBy = match[1]; // Captures the optional parameter after /start

  // User details from Telegram message
  const userData = {
    telegram_id: msg.from.id,
    username: msg.from.username,
    first_name: msg.from.first_name,
    last_name: msg.from.last_name,
    is_bot: msg.from.is_bot,
    language_code: msg.from.language_code,
    chat_id: chatId,
    referred_by: referredBy || null, // Include referred_by if provided
  };

  try {
    // Send user details to your API
    const response = await axios.post(
      "https://ravegenie-vgm7.onrender.com/api/auth",
      userData
    );

    // Handle success response
    bot.sendMessage(chatId, response.data.message);
  } catch (error) {
    console.error("Error authenticating user:", error.message);

    // Handle error response
    bot.sendMessage(chatId, "An error occurred while authenticating.");
  }

  const message = `Hey ${
    msg.from.first_name || msg.from.username
  }, 🚀  Welcome to RaveGenie! Get ready to earn shares for completing specific tasks! 🎉`;

  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Join Group",
            url: "https://www.youtube.com/watch?v=UQrcOj63S2o",
          },
          { text: "Join Channel", url: "https://t.me/ravegeniegames" },
        ],
        [
          {
            text: "View RaveGenie Games",
            web_app: {
              url: "https://zeenstreet-ten.vercel.app/",
            },
          },
        ],
      ],
    },
  };

  bot.sendMessage(chatId, message, options);
});

bot.on("callback_query", async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;

  // Check if the user is already created
  const user = await axios.get(
    `https://ravegenie-vgm7.onrender.com/api/auth/${callbackQuery.from.id}/user`
  );

  if (!user.data) {
    const referredBy = callbackQuery.data; // This will be the referral code from the start= parameter

    // Send user data to your API for user creation and referral handling
    const userData = {
      telegram_id: callbackQuery.from.id,
      username: callbackQuery.from.username,
      first_name: callbackQuery.from.first_name,
      last_name: callbackQuery.from.last_name,
      is_bot: callbackQuery.from.is_bot,
      language_code: callbackQuery.from.language_code,
      chat_id: chatId,
      referred_by: referredBy, // Capture the referral code
    };

    try {
      // Send to your API for user creation and referral processing
      await axios.post("https://ravegenie-vgm7.onrender.com/api/auth", userData);
      bot.sendMessage(chatId, "Welcome! You have been successfully registered and your referral has been recorded.");
    } catch (error) {
      console.error("Error processing referral:", error.message);
      bot.sendMessage(chatId, "There was an error processing your referral.");
    }
  }   
  // else {
  //   bot.sendMessage(chatId, "You have already started the bot!");
  // }
});

bot.on("message", async (msg) => {
  if (msg?.service_message?.type === "delete_chat_history") {
    const chatId = msg.chat.id;

    try {
      // Remove user from database based on `chat_id` or `telegram_id`
      await axios.delete(
        `https://ravegenie-vgm7.onrender.com/api/auth/${chatId}`
      );
      console.log(`Cleared user data for chatId: ${chatId}`);
    } catch (error) {
      console.error("Error clearing user data:", error.message);
    }
  }
});

module.exports = bot;
