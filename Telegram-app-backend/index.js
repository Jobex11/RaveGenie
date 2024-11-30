// Import required modules
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

//MONGODB connection

const connectDB = require("./src/config/db");
connectDB();
// Initialize the Express app
const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS

// Example Routes

// Import your API routes
const userAuthRoutes = require("./src/routes/userAuthRoutes");
app.use("/auth", userAuthRoutes);

// Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running 🚀" });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Set the port
const PORT = process.env.PORT || 4000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} 🟢`);
});
