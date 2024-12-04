const express = require("express");
const {
  updateUserShares,
  getUserShares,
  getTotalShares,
} = require("../controllers/shareController");

const router = express.Router();

router.post("/update/:telegram_id", updateUserShares);

router.get("/:telegram_id", getUserShares);

router.get("/total", getTotalShares);

module.exports = router;
