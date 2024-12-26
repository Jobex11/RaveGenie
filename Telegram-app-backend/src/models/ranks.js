const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const rankSchema = new mongoose.Schema(
  {
    rank: {
      type: String,
      required: true,
      enum: [
        "Nobody",
        "Maze Rat",
        "Street Runner",
        "Intern",
        "Analyst",
        "Senior Analyst",
        "Broker",
        "Associate",
        "Senior Associate",
        "Director",
        "Senior Director",
        "Managing Director (MD)",
        "Senior Managing Director",
        "Partner",
        "Senior Partner",
        "Group Head",
        "Managing Partner",
        "Regional Head",
        "Division Head",
        "Chief Executive Officer (CEO)",
        "Chairperson of the Board",
        "Wall Street Tycoon",
        "Investor",
        "Venture Capitalist",
        "Financial Mogul",
        "Market Tycoon",
        "Master of Wealth",
        "Portfolio Pharaoh",
        "Global Financier",
        "Investment Overlord",
        "WEF Chairman",
        "Master of the Market",
        "Sovereign Lord",
        "Omniarch",
      ],
    },
    rankRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Define the model
const Ranks = mongoose.model("Ranks", rankSchema);

module.exports = Ranks;
