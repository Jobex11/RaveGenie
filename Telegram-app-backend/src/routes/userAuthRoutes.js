const express = require("express");
const {
  authenticateUser,
  getAllUsers,
} = require("../controllers/authController");

const router = express.Router();

// ===> Route for user authentication
router.post("/", authenticateUser);

// ====> Route to fetch all users
router.get("/all-users", getAllUsers);

module.exports = router;
