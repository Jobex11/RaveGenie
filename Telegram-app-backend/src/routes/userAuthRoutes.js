const express = require("express");
const { authenticateUser } = require("../controllers/authController");

const router = express.Router();

// Authentication route
router.post("/", authenticateUser);

module.exports = router;
