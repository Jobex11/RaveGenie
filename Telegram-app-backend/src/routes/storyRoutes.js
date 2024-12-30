const express = require("express");
const router = express.Router();
const {
  updateStory,
  getStory,
  shareStory,
} = require("../controllers/storyController");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });
// Update story
router.put("/update", upload.single("image"), updateStory);

// Get story
router.get("/:telegram_id", getStory);

// Share story
router.put("/:telegram_id/share", shareStory);

module.exports = router;
