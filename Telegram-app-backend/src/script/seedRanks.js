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
  { rank: "Nobody", rankRange: { min: 0, max: 149999 } },
  { rank: "Maze Rat", rankRange: { min: 150000, max: 159999 } },
  { rank: "Street Runner", rankRange: { min: 160000, max: 169999 } },
  { rank: "Intern", rankRange: { min: 170000, max: 179999 } },
  { rank: "Analyst", rankRange: { min: 180000, max: 189999 } },
  { rank: "Senior Analyst", rankRange: { min: 190000, max: 199999 } },
  { rank: "Broker", rankRange: { min: 200000, max: 209999 } },
  { rank: "Associate", rankRange: { min: 210000, max: 219999 } },
  { rank: "Senior Associate", rankRange: { min: 220000, max: 229999 } },
  { rank: "Director", rankRange: { min: 230000, max: 239999 } },
  { rank: "Senior Director", rankRange: { min: 240000, max: 249999 } },
  { rank: "Managing Director (MD)", rankRange: { min: 250000, max: 259999 } },
  { rank: "Senior Managing Director", rankRange: { min: 260000, max: 269999 } },
  { rank: "Partner", rankRange: { min: 270000, max: 279999 } },
  { rank: "Senior Partner", rankRange: { min: 280000, max: 289999 } },
  { rank: "Group Head", rankRange: { min: 290000, max: 299999 } },
  { rank: "Managing Partner", rankRange: { min: 300000, max: 309999 } },
  { rank: "Regional Head", rankRange: { min: 310000, max: 319999 } },
  { rank: "Division Head", rankRange: { min: 320000, max: 329999 } },
  { rank: "Chief Executive Officer (CEO)", rankRange: { min: 330000, max: 339999 } },
  { rank: "Chairperson of the Board", rankRange: { min: 340000, max: 349999 } },
  { rank: "Wall Street Tycoon", rankRange: { min: 350000, max: 359999 } },
  { rank: "Investor", rankRange: { min: 360000, max: 369999 } },
  { rank: "Venture Capitalist", rankRange: { min: 370000, max: 379999 } },
  { rank: "Financial Mogul", rankRange: { min: 380000, max: 389999 } },
  { rank: "Market Tycoon", rankRange: { min: 390000, max: 399999 } },
  { rank: "Master of Wealth", rankRange: { min: 400000, max: 409999 } },
  { rank: "Portfolio Pharaoh", rankRange: { min: 410000, max: 419999 } },
  { rank: "Global Financier", rankRange: { min: 420000, max: 429999 } },
  { rank: "Investment Overlord", rankRange: { min: 430000, max: 439999 } },
  { rank: "WEF Chairman", rankRange: { min: 440000, max: 449999 } },
  { rank: "Master of the Market", rankRange: { min: 450000, max: 459999 } },
  { rank: "Sovereign Lord", rankRange: { min: 460000, max: 469999 } },
  { rank: "Omniarch", rankRange: { min: 470000, max: 479999 } },
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
