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
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  // User details from Telegram message
  const userData = {
    telegram_id: msg.from.id,
    username: msg.from.username,
    first_name: msg.from.first_name,
    last_name: msg.from.last_name,
    is_bot: msg.from.is_bot,
    language_code: msg.from.language_code,
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

module.exports = bot;
/*
web_app: {
              url: "https://zenstreet-telegram-bot-front-git-13eacb-ptdesigns2022s-projects.vercel.app/",
            },
*/
