const express = require("express");
const {
  recordClickX,
  checkClickX,
  recordClickYoutube,
  checkMembership,
  checkClickYoutube,
} = require("../controllers/socialHandleController");

const router = express.Router();

router.post("/record-clickX", recordClickX);

router.post("/check-clickX", checkClickX);

router.post("/record-clickYoutube", recordClickYoutube);

router.post("/check-clickYoutube", checkClickYoutube);

router.post("/check-membershipTelegram", checkMembership);

module.exports = router;
