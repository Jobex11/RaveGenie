// database.js
import mongoose from "mongoose";
import { config } from "dotenv";

// Load environment variables from .env file
config();

// Define User Schema
const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    username: { type: String },
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

export { User };
export { Session };
