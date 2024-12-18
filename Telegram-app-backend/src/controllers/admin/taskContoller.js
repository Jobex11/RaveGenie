const cloudinary = require("../../bucket/cloudinary.js");
const multer = require("multer");
const { User } = require("../../models/database.js");
const Tasks = require("../../models/tasks");

// Multer configuration
const storage = multer.memoryStorage();
const uploadImageToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "tasks" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(new Error("Failed to upload image to Cloudinary"));
        }
        resolve(result);
      }
    );
    stream.end(file.buffer);
  });
};

// Admin uploads a new task
exports.createTasks = async (req, res) => {
  const {
    title,
    taskUrl,
    taskType,
    category,
    diminishingRewards,
    countdown,
    baseReward,
  } = req.body;

  console.log("Request Body:", req.body);
  console.log("Uploaded File:", req.file);

  // Validate input fields
  if (!title || !taskUrl || !req.file || !baseReward) {
    return res.status(400).json({
      success: false,
      message: "All fields are required (including an image)",
    });
  }

  if (!["one-time", "recurring"].includes(taskType)) {
    return res.status(400).json({ error: "Invalid task type" });
  }

  if (
    !["Special", "Daily", "Events", "Referral", "Partners", "Social"].includes(
      category
    )
  ) {
    return res.status(400).json({ error: "Invalid category" });
  }

  try {
    // Upload image to Cloudinary
    console.log("Uploading image to Cloudinary...");
    const cloudinaryResult = await uploadImageToCloudinary(req.file);
    const imageUrl = cloudinaryResult.secure_url;
    console.log("Cloudinary Upload Success:", imageUrl);

    // Create and save the new task
    const newTask = new Tasks({
      title,
      taskUrl,
      taskType,
      category,
      diminishingRewards,
      image: imageUrl,
      countdown: countdown || 0, // Optional countdown
      baseReward: baseReward || 100,
    });

    console.log("Saving task to database:", newTask);

    await newTask.save();
    return res
      .status(201)
      .json({ message: "Task created successfully", task: newTask });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({
      error: error.message,
      message: "Failed to create task",
      success: false,
    });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Tasks.find();

    const tasksWithCountdown = tasks.map((task) => {
      const now = Date.now();
      const taskCreatedTime = new Date(task.createdAt).getTime();

      // Calculate remaining countdown
      let remainingTime =
        task.countdown - Math.floor((now - taskCreatedTime) / 1000);
      remainingTime = remainingTime > 0 ? remainingTime : 0;

      // Dynamically calculate reward based on time left
      const reward = Math.floor(
        (task.baseReward * remainingTime) / task.countdown
      );

      return {
        ...task._doc,
        remainingTime, // Add remaining time to the response
        reward: remainingTime > 0 ? reward : 0, // Reward decreases over time
        isExpired: remainingTime <= 0,
      };
    });

    res.status(200).json({ tasks: tasksWithCountdown });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

exports.completedTasks = async (req, res) => {
  const { telegram_id } = req.body; // Assuming telegram_id is a string
  const { taskId } = req.params;

  try {
    const task = await Tasks.findById(taskId);
    if (!task || task.isExpired) {
      return res
        .status(400)
        .json({ message: "Task has expired or doesn't exist." });
    }

    // Calculate remaining reward
    const now = Date.now();
    const elapsedTime = Math.floor(
      (now - new Date(task.createdAt).getTime()) / 1000
    );
    const remainingTime = task.countdown - elapsedTime;
    const reward = Math.floor(
      (task.baseReward * remainingTime) / task.countdown
    );

    // Fetch user by telegram_id
    const user = await User.findOne({ telegram_id }); // Use findOne if telegram_id is a string
    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    // Ensure completedTasks is an array
    if (!user.completedTasks) {
      user.completedTasks = []; // Initialize as empty array if not set
    }

    if (user.completedTasks.includes(taskId)) {
      return res.status(400).json({
        success: "not-allowed but went true",
        message: "Task already completed.",
      });
    }

    user.completedTasks.push(taskId);
    user.shares += reward; // Add dynamic reward
    await user.save();

    res.status(200).json({
      message: "Task completed successfully",
      reward,
      userShares: user.shares,
      completedTasks: user.completedTasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to complete task",
      error: error.message,
    });
  }
};

exports.deleteTasks = async (req, res) => {
  try {
    await Tasks.deleteMany({});
    res.status(200).json({ message: "All tasks deleted successfully" });
  } catch (error) {
    console.error("Error deleting tasks:", error);
    res.status(500).json({ message: "An error occurred while deleting tasks" });
  }
};
