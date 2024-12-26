const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const WealthClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  minRank: {
    type: Number,
    required: true,
  },
  maxRank: {
    type: Number,
    required: true,
  },
  requiredCards: {
    type: Number,
    required: true,
  },
  sharesReward: {
    type: Number,
    default: 0,
  },
  additionalRewards: {
    type: Map,
    of: String, // Dynamic rewards like USDT, SOL, etc. (key-value pairs)
    default: {}, // e.g., { "USDT": "50", "SOL": "0.5" }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
// Define the model
const WealthClasses = mongoose.model("WealthClasses", WealthClassSchema);

module.exports = WealthClasses;
