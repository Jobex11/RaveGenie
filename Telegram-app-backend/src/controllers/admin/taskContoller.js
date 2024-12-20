const { User } = require("../../models/database"); // Your user model
const cloudinary = require("../../bucket/cloudinary.js");
const multer = require("multer");
const TelegramBot = require("node-telegram-bot-api");
const Tasks = require("../../models/tasks.js");


const TOKEN = process.env.TELEGRAM_BOT_TOKEN; // Your Telegram Bot Token
const bot = new TelegramBot(TOKEN);

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadImageToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "tasks" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(new Error("Failed to upload image to Cloudinary"));
        } else {
          resolve(result);
        }
      }
    );
    stream.end(file.buffer);
  });
};

exports.createTasks = async (req, res) => {
  const {
    title,
    taskUrl,
    taskType,
    category,
    diminishingRewards,
    baseReward,
  } = req.body;

  if (!title || !taskUrl || !req.file || !baseReward) {
    return res.status(400).json({
      success: false,
      message: "All fields are required (including an image)",
    });
  }
  if (!req.body.countdown) {
    return res.status(400).json({ error: "Countdown is required" });
  }
  
  const countdown = parseInt(req.body.countdown, 10);
  if (isNaN(countdown)) {
    return res.status(400).json({ error: "Countdown must be a number" });
  }

  try {
    // Upload image to Cloudinary
    const cloudinaryResult = await uploadImageToCloudinary(req.file);
    const imageUrl = cloudinaryResult.secure_url;

    // Save task in the database
    const newTask = new Tasks({
      title,
      taskUrl,
      taskType,
      category,
      diminishingRewards,
      image: imageUrl,
      countdown: countdown || 0,
      baseReward: baseReward || 100,
    });

    await newTask.save();
    // Send Telegram notification
    const users = await User.find({});

    users.forEach((user) => {
      if (user.chat_id) {
        const notificationMessage = `Hey ${
          user.username || "there"
        }, a new Task is available! 🎉 Go and perform the tasks to claim your reward! 🚀`;
        bot.sendMessage(
          user.chat_id,
          notificationMessage,
          (options = {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Perfom Task",
                    web_app: {
                      url: "https://zeenstreet-ten.vercel.app/tasks",
                    },
                  },
                ],
              ],
            },
          })
        );
      }
    });

    return res.status(201).json({
      message: "Task created successfully, and users have been notified.",
      task: newTask,
    });
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
    const tasks = await Tasks.find().sort({ createdAt: -1 });

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
