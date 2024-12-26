const mongoose = require("mongoose");
const WealthClass = require("../models/wealthclass");
const { User } = require("../models/database");
require("dotenv").config();

const wealthClasses = [
  {
    name: "Bottom Feeders",
    minRank: 0,
    maxRank: 9999,
    requiredCards: 29,
    sharesReward: 50,
    additionalRewards: { shares: 50, USDT: "5", SOL: "0.1" },
  },
  {
    name: "The Aspirers",
    minRank: 10000,
    maxRank: 19999,
    requiredCards: 25,
    sharesReward: 100,
    additionalRewards: { shares: 100, USDT: "10", SOL: "0.2" },
  },
  {
    name: "Stable Earners",
    minRank: 20000,
    maxRank: 29999,
    requiredCards: 30,
    sharesReward: 150,
    additionalRewards: { shares: 150, USDT: "15", SOL: "0.3" },
  },
  {
    name: "High Achievers",
    minRank: 30000,
    maxRank: 39999,
    requiredCards: 30,
    sharesReward: 200,
    additionalRewards: { shares: 200, USDT: "20", SOL: "0.4" },
  },
  {
    name: "Elite Circle",
    minRank: 40000,
    maxRank: 49999,
    requiredCards: 35,
    sharesReward: 300,
    additionalRewards: { shares: 300, USDT: "25", SOL: "0.5" },
  },
  {
    name: "Legacy Wealth",
    minRank: 50000,
    maxRank: 59999,
    requiredCards: 35,
    sharesReward: 400,
    additionalRewards: { shares: 400, USDT: "30", SOL: "0.6" },
  },
  {
    name: "Titans",
    minRank: 60000,
    maxRank: 69999,
    requiredCards: 40,
    sharesReward: 500,
    additionalRewards: { shares: 500, USDT: "40", SOL: "0.8" },
  },
  {
    name: "Planet Shakers",
    minRank: 70000,
    maxRank: 79999,
    requiredCards: 45,
    sharesReward: 600,
    additionalRewards: { shares: 600, USDT: "50", SOL: "1.0" },
  },
  {
    name: "Sovereign Wealth",
    minRank: 80000,
    maxRank: 89999,
    requiredCards: 50,
    sharesReward: 1000,
    additionalRewards: { shares: 1000, USDT: "100", SOL: "2.0" },
  },
];

const seedWealthClasses = async () => {
    try {
      // Connect to the database
      await mongoose.connect(process.env.MONGO_URI);
  
      console.log("Connected to MongoDB");
      await WealthClass.deleteMany(); // Clear existing data
      console.log("Existing rank data cleared.");
  
      // Update the unlockedCards with the wealthClass field
      await WealthClass.insertMany(wealthClasses); 
  
      console.log("Wealth classes updated successfully");
  
      // Close connection
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
    } catch (error) {
      console.error("Error updating wealth classes:", error);
      process.exit(1); // Exit with failure
    }
  };
  
  // Run the seeding function
  seedWealthClasses();
