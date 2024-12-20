const express = require("express");
const {
  authenticateUser,
  getAllUsers,
  getUsersById,
} = require("../controllers/authController");

const router = express.Router();

// ===> Route for user authentication
router.post("/", authenticateUser);

// ====> Route to fetch all users
router.get("/all-users", getAllUsers);
router.get("/:telegram_id/user", getUsersById);
router.delete("/:chat_id", deleteUserByChatId);

module.exports = router;
