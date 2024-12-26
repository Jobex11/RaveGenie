const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Ranks = require("../models/ranks.js");

// Load environment variables
dotenv.config();

// Connect to the database
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connected successfully.");
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });

// Complete rank data
const rankData = [
  { rank: "Nobody", rankRange: { min: 0, max: 9999 } },
  { rank: "Maze Rat", rankRange: { min: 10000, max: 19999 } },
  { rank: "Street Runner", rankRange: { min: 20000, max: 29999 } },
  { rank: "Intern", rankRange: { min: 30000, max: 39999 } },
  { rank: "Analyst", rankRange: { min: 40000, max: 49999 } },
  { rank: "Senior Analyst", rankRange: { min: 50000, max: 59999 } },
  { rank: "Broker", rankRange: { min: 60000, max: 69999 } },
  { rank: "Associate", rankRange: { min: 70000, max: 79999 } },
  { rank: "Senior Associate", rankRange: { min: 80000, max: 89999 } },
  { rank: "Director", rankRange: { min: 90000, max: 99999 } },
  { rank: "Senior Director", rankRange: { min: 100000, max: 109999 } },
  { rank: "Managing Director (MD)", rankRange: { min: 110000, max: 119999 } },
  { rank: "Senior Managing Director", rankRange: { min: 120000, max: 129999 } },
  { rank: "Partner", rankRange: { min: 130000, max: 139999 } },
  { rank: "Senior Partner", rankRange: { min: 140000, max: 149999 } },
  { rank: "Group Head", rankRange: { min: 150000, max: 159999 } },
  { rank: "Managing Partner", rankRange: { min: 160000, max: 169999 } },
  { rank: "Regional Head", rankRange: { min: 170000, max: 179999 } },
  { rank: "Division Head", rankRange: { min: 180000, max: 189999 } },
  { rank: "Chief Executive Officer (CEO)", rankRange: { min: 190000, max: 199999 } },
  { rank: "Chairperson of the Board", rankRange: { min: 200000, max: 209999 } },
  { rank: "Wall Street Tycoon", rankRange: { min: 210000, max: 219999 } },
  { rank: "Investor", rankRange: { min: 220000, max: 229999 } },
  { rank: "Venture Capitalist", rankRange: { min: 230000, max: 239999 } },
  { rank: "Financial Mogul", rankRange: { min: 240000, max: 249999 } },
  { rank: "Market Tycoon", rankRange: { min: 250000, max: 259999 } },
  { rank: "Master of Wealth", rankRange: { min: 260000, max: 269999 } },
  { rank: "Portfolio Pharaoh", rankRange: { min: 270000, max: 279999 } },
  { rank: "Global Financier", rankRange: { min: 280000, max: 289999 } },
  { rank: "Investment Overlord", rankRange: { min: 290000, max: 299999 } },
  { rank: "WEF Chairman", rankRange: { min: 300000, max: 309999 } },
  { rank: "Master of the Market", rankRange: { min: 310000, max: 319999 } },
  { rank: "Sovereign Lord", rankRange: { min: 320000, max: 329999 } },
  { rank: "Omniarch", rankRange: { min: 330000, max: 339999 } },
];

// Seed function
const seedRanks = async () => {
  try {
    await Ranks.deleteMany(); // Clear existing data
    console.log("Existing rank data cleared.");

    await Ranks.insertMany(rankData); // Insert new data
    console.log("Ranks seeded successfully.");
    process.exit(); // Exit the process after seeding
  } catch (error) {
    console.error("Error seeding ranks:", error);
    process.exit(1); // Exit with error code
  }
};

// Run the seed function
seedRanks();
