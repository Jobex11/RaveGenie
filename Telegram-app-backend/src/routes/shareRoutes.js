const express = require("express");
const {
  updateUserShares,
  getTotalShares,
} = require("../controllers/shareController");

const router = express.Router();

// Route to update user shares
router.post("/update", updateUserShares);

// Route to get total shares
router.get("/total", getTotalShares);

module.exports = router;
