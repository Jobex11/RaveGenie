// database.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Define User Schema
const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    username: { type: String },
    additional_details: { type: Object },
    accountName: { type: String },
    firstContact: { type: Date },
    accountAge: { type: Number },
    activityLevel: { type: Number },
    isPremium: { type: Number },
    ogLevel: { type: Number },
    socials: { type: String, default: false },
    shares: { type: Number },
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
