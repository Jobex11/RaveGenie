const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const cardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    totalUnlockPoints: {
      type: Number,
      default: 0,
    },
    taskPoint: {
      type: Number,
      default: 0,
    },
    basePoint: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isUnlocked: {
      type: Boolean,
      default: false,
    },
    associatedWealthClass: {
      type: String,
      enum: [
        "Bottom Feeders",
        "The Aspirers",
        "Stable Money",
        "High Achievers",
        "Elite Circle",
        "Legacy Wealth",
        "Titans",
        "Planet Shakers",
        "Sovereign Wealth",
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Define the model
const Cards = mongoose.model("Cards", cardSchema);

module.exports = Cards;
