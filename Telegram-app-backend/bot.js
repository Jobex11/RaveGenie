const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");
dotenv.config();
// Replace with your Telegram bot token
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Initialize Telegram bot
const bot = new TelegramBot(TOKEN, { polling: true });

// Express setup
const app = express();

// Bot command to send welcome message
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.first_name || msg.from.username;
  const premiumMessage = msg.from.is_premium ? "Yes" : "No";

  const message = `Hey ${username}, 🚀  Welcome to RaveGenie! Get ready to earn shares for completing specific tasks! 🎉`;

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
              url: "https://zenstreet-telegram-bot-front-git-13eacb-ptdesigns2022s-projects.vercel.app/",
            },
          },
        ],
      ],
    },
  };

  bot.sendMessage(chatId, message, options);
});

module.exports = bot;
