// database.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Define User Schema
const userSchema = new mongoose.Schema(
  {
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

    shares: { type: Number, default: 10000 },

    referred_by: { type: String, default: null },
    referrals: { type: [String], default: [] },
    referralCode: { type: String, unique: true },
    referralLink: {
      type: String,
    },

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
