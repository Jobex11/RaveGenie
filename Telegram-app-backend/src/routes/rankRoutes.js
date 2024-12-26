const express = require("express");
const { getRanks, updateRank } = require("../controllers/ranksController");

const router = express.Router();

router.get("/", getRanks);
router.put("/:id", updateRank);

module.exports = router;
