const express = require("express");
const {
  getTasks,
  createTasks,
  deleteTasks,
  completedTasks,
} = require("../controllers/admin/taskContoller");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();

router.get("/", getTasks);
router.post("/create", upload.single("image"), createTasks);
router.post("/:taskId/complete", completedTasks);
router.post("/delete", deleteTasks);

module.exports = router;
