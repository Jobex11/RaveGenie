const  mongoose  = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    taskUrl: { type: String, required: true },
    image: { type: String, required: true },
    taskType: {
      type: String,
      enum: ["one-time", "recurring"], // Type of task
      required: true,
    },
    category: {
      type: String,
      enum: ["Special", "Daily", "Events", "Referral", "Partners", "Social"],
      required: true,
    },
    diminishingRewards: {
      type: String,
      enum: ["No", "Yes"],
      required: true,
    },
    countdown: {
      type: Number, // Countdown in seconds
      default: 0, // 0 means no countdown for this task
    },
    baseReward: {
      type: Number,
      default: 100,
    },
    createdAt: { type: Date, default: Date.now },
    isExpired: {
      type: Boolean,
      default: false, // Task expires after countdown
    },
  },
  {
    timestamps: true,
  }
);

const Tasks = mongoose.model("Tasks", taskSchema);
module.exports = Tasks;
