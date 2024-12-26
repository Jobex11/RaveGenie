const express = require("express");
const {
    createCards,
    getUserCards,
    deleteCards,
    getNumberOfUnlockedCards
} = require("../controllers/admin/cardController.js");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();

router.post("/create", upload.single("image"), createCards);
router.get("/users/:telegram_id", getUserCards);
router.post("/delete", deleteCards)
router.get("/unlocked-cards/:telegram_id", getNumberOfUnlockedCards)

module.exports = router;
