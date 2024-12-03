const express = require("express");
const {
  setPreferredUsername,
  getPreferredUsername,
} = require("../controllers/usernameController");

const router = express.Router();

// Route to set or update preferred username
router.post("/set", setPreferredUsername);

// Route to get the preferred username
router.get("/:telegram_id", getPreferredUsername);

module.exports = router;
