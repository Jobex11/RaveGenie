const express = require("express");
const {
  getOneTimeTasks,
  createOneTimeTasks,
  deleteTasks,
  completedTasks,
} = require("../controllers/admin/taskContoller");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();

router.get("/", getOneTimeTasks);
router.post("/create", upload.single("image"), createOneTimeTasks);
router.post("/:taskId/complete", completedTasks);
router.post("/delete", deleteTasks);

module.exports = router;
