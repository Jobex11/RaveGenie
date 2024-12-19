const express = require("express");
const {
  createNotification,
  getNotifications,
  deleteNotification,
} = require("../controllers/admin/notificationController");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();

// router.get("/", getTasks);
router.post("/create", upload.single("logo"), createNotification);
router.get("/notifications", getNotifications);
router.post("/del", deleteNotification);

module.exports = router;
