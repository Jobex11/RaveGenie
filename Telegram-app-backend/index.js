const express = require("express");
const bot = require("./bot");
const dotenv = require("dotenv");
const cors = require("cors");
require("./src/cron/taskScheduler.js"); //cron job
dotenv.config();
//https://ravegenie-vgm7.onrender.com
//https://zeenstreet-ten.vercel.app/
// tg_id 5519602535

const userAuthRoutes = require("./src/routes/userAuthRoutes");
const usernameRoutes = require("./src/routes/usernameRoutes");
const shareRoutes = require("./src/routes/shareRoutes");
const socialhandleRoutes = require("./src/routes/socialHandleRoutes");
const referralRoutes = require("./src/routes/referralRoutes");
const taskRoutes = require("./src/routes/taskRoutes");
// ==> MONGODB connection
const connectDB = require("./src/config/db");
connectDB();
// ==> Initialize the Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// ==> YOUR API ROUTES
app.use("/api/auth", userAuthRoutes);
app.use("/api/username", usernameRoutes);
app.use("/api/shares", shareRoutes);
app.use("/api/socialhandle", socialhandleRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/tasks", taskRoutes);
// Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running 🚀" });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});
const PORT = process.env.PORT || 4000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} 🟢`);
});
