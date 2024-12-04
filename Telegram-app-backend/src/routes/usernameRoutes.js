const express = require("express");
const {
  setPreferredUsername,
  getPreferredUsername,
  hasPreferredUsername,
} = require("../controllers/usernameController");

const router = express.Router();

// Route to set or update preferred username
router.post("/set", setPreferredUsername);

// Route to get the preferred username
router.get("/:telegram_id", getPreferredUsername);

// Route to check if a user has a preferred username
router.get("/has/:telegram_id", hasPreferredUsername);

module.exports = router;
