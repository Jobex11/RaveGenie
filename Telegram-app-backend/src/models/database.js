const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Define User Schema
const userSchema = new mongoose.Schema(
  {
    chat_id: { type: String, required: true, unique: true },
    chat_id: { type: String },
    telegram_id: { type: String, required: true, unique: true },
    username: { type: String },
    additional_details: { type: Object },
    accountName: { type: String },
    first_name: { type: String },
    last_name: { type: String },
    is_bot: { type: Boolean, default: false },
    language_code: { type: String },
    accountName: { type: String },

    firstContact: { type: Date },
    accountAge: { type: Number },
    activityLevel: { type: Number },
    isPremium: { type: Number },
    ogLevel: { type: Number },
    socials: { type: String, default: false },
    shares: { type: Number, default: 0 },
    claimedShares: {
      // Object to track share claims by type
      type: Map,
      of: Boolean,
      default: {},
    },
    completedTasks: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Tasks",
      default: [],
    },
    collectedCards: {
      type: [String],
      default: [],
    },
    ranks: {
      type: Map,
      of: String,
      default: {},
    },
    taskShares: { type: Number, default: 0 },
    unlockPoints: { type: Number, default: 0 },
    currentCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cards",
    },
    unlockedCards: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: "Cards" },
        title: String,
        image: String,
        wealthClass: String,
      },
    ],
    unlockedCardsCount: { type: Number, default: 0 },
    //referral schemas
    referred_by: { type: String, default: null },
    referrals: { type: [String], default: [] },
    referralCount: { type: Number, default: 0 },
    referralCode: { type: String, unique: true },
    referralLink: {
      type: String,
    },
    claimReferrals_shares: { type: Number, default: 0 }, // Claimable referral shares
    tier1: { type: [String], default: [] },
    tier2: { type: [String], default: [] },

    //social schemas
    has_joined_telegram: { type: Boolean, default: false },
    has_followed_youtube: { type: Boolean, default: false },
    has_followed_x: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// User Session Schema
const sessionSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  sessionToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Session Model
const Session = mongoose.model("Session", sessionSchema);

// Create User Model
const User = mongoose.model("User", userSchema);

module.exports = { User, Session };
