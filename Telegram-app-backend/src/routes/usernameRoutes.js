const express = require("express");
const { setPreferredUsername } = require("../controllers/usernameController");

const router = express.Router();

// Route to set or update preferred username
router.post("/set", setPreferredUsername);

module.exports = router;
