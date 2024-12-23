const express = require("express");
const {
    createCards,
    // getUnlockedCards,
    // getCurrentCard,
    getUserCards,
    deleteCards
} = require("../controllers/admin/cardController.js");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();

router.post("/create", upload.single("image"), createCards);
// router.get("/unlocked-cards/:telegram_id", getUnlockedCards);
// router.get("/current-card/:telegram_id", getCurrentCard);
router.get("/users/:telegram_id", getUserCards);
router.post("/delete", deleteCards)

module.exports = router;
