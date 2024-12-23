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
     default:"one-time"
    },
    category: {
      type: String,
      enum: ["Special", "Daily", "Events", "Referral", "Partners", "Social"],
      required: true,
    },
    diminishingRewards: {
      type: String,
      enum: ["No", "Yes"],
      required: false,
    },
    diminishingPoints: {
      type: [Number], // Array of time points in seconds
      default: [],
    },
    diminishingPercentage: {
      type: Number, // Percentage of reward to diminish
      default: 0,
      min: 0,
      max: 100,
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
      default: false, 
    },
  },
  {
    timestamps: true,
  }
);

const Tasks = mongoose.model("Tasks", taskSchema);
module.exports = Tasks;
