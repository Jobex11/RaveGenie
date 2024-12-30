const { User } = require("../../models/database"); // Your user model
const cloudinary = require("../../bucket/cloudinary.js");
const multer = require("multer");
const TelegramBot = require("node-telegram-bot-api");
const Tasks = require("../../models/tasks.js");
const Cards = require("../../models/cards");
const dotenv = require("dotenv");
dotenv.config();
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Initialize Telegram bot
const bot = new TelegramBot(TOKEN, { polling: true });

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
exports.createOneTimeTasks = async (req, res) => {
  const {
    title,
    taskUrl,
    taskType,
    category,
    diminishingRewards,
    diminishingPoints,
    diminishingPercentage,
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

  let parsedDiminishingPoints = [];
  if (diminishingRewards === "Yes" && diminishingPoints) {
    try {
      // Parse diminishingPoints string into an array of numbers
      parsedDiminishingPoints = JSON.parse(diminishingPoints);
      if (!Array.isArray(parsedDiminishingPoints)) {
        throw new Error("diminishingPoints must be an array.");
      }

      // Ensure all elements are numbers
      parsedDiminishingPoints = parsedDiminishingPoints.map((point) =>
        parseInt(point, 10)
      );

      // Validate the points
      if (parsedDiminishingPoints.some((point) => isNaN(point))) {
        throw new Error("All diminishingPoints must be valid numbers.");
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid diminishingPoints format. Provide a JSON array of numbers.",
        error: error.message,
      });
    }
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
      diminishingPoints: parsedDiminishingPoints,
      diminishingPercentage: diminishingPercentage || 0,
      image: imageUrl,
      countdown: countdown || 0,
      baseReward: baseReward || 100,
    });

    await newTask.save();
    const users = await User.find({});
    const taskMessage = ` Hey ${
      users.username || "there"
    } a New 📝 Task is available ${title}\n\nComplete this task to earn your rewards! 🎉`;
    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Perform The Tasks  🚀",
              web_app: {
                url: "https://zeenstreet-ten.vercel.app/tasks",
              },
            },
          ],
        ],
      },
    };
    // users.forEach((user) => {
    //   if (user.chat_id) {
    //     bot.sendMessage(user.chat_id, taskMessage, options).catch((err) => {
    //       console.error(
    //         `Failed to send message to chat ID ${user.chat_id}:`,
    //         err.message
    //       );
    //     });
    //   }
    // });
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

exports.getOneTimeTasks = async (req, res) => {
  try {
    const tasks = await Tasks.find({ taskType: "one-time" }).sort({
      createdAt: -1,
    });

    const tasksWithCountdown = tasks.map((task) => {
      const now = Date.now();
      const taskCreatedTime = new Date(task.createdAt).getTime();

      // Calculate remaining countdown
      let remainingTime =
        task.countdown - Math.floor((now - taskCreatedTime) / 1000);
      remainingTime = remainingTime > 0 ? remainingTime : 0;

      let reward = task.baseReward;

      if (task.diminishingRewards === "Yes" && remainingTime > 0) {
        // Apply diminishing logic
        const passedPoints = task.diminishingPoints.filter(
          (point) => remainingTime <= point
        );

        const totalReduction =
          passedPoints.length * (task.diminishingPercentage / 100);
        reward = Math.floor(task.baseReward * (1 - totalReduction));
      }

      return {
        ...task._doc,
        remainingTime, // Add remaining time to the response
        reward: remainingTime > 0 ? reward : 0, // Ensure reward is 0 when expired
        isExpired: remainingTime <= 0,
      };
    });

    res.status(200).json({ tasks: tasksWithCountdown });

    // Update expired status in the database
    tasksWithCountdown.forEach(async (task) => {
      if (task.remainingTime <= 0 && !task.isExpired) {
        await Tasks.findByIdAndUpdate(task._id, { isExpired: true });
      }
    });
  } catch (error) {
    console.error("Error fetching tasks:", error.message);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

exports.completedTasks = async (req, res) => {
  const { telegram_id } = req.body; // User identification
  const { taskId } = req.params; // Task ID from request parameters

  try {
    // Fetch the task
    const task = await Tasks.findById(taskId);
    if (!task || task.isExpired) {
      return res
        .status(400)
        .json({ message: "Task has expired or doesn't exist." });
    }

    // Calculate task reward
    const now = Date.now();
    const elapsedTime = Math.floor(
      (now - new Date(task.createdAt).getTime()) / 1000
    );
    const remainingTime = task.countdown - elapsedTime;
    const reward = Math.floor(
      (task.baseReward * remainingTime) / task.countdown
    );

    // Fetch the user
    const user = await User.findOne({ telegram_id });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Ensure completedTasks is an array
    if (!user.completedTasks) {
      user.completedTasks = [];
    }

    // Check if the task is already completed
    if (user.completedTasks.includes(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Task already completed.",
      });
    }

    // Add task to the user's completed tasks
    user.completedTasks.push(taskId);

    // Update taskShares for the user
    user.taskShares += reward;

    // Handle card progress
    let currentCard = null;
    if (user.currentCard) {
      currentCard = await Cards.findById(user.currentCard);
    }

    if (currentCard) {
      // Dynamically calculate taskPoints using the formula
      const taskPoints =
        (reward / currentCard.basePoint) * currentCard.taskPoint;

      // Add points to the user's unlockPoints
      user.unlockPoints += taskPoints;

      // Log for debugging
      console.log("Calculated taskPoints:", taskPoints);
      console.log("Updated unlockPoints:", user.unlockPoints);

      // Check if the user has enough points to unlock the card
      if (user.unlockPoints >= currentCard.totalUnlockPoints) {
        // Add the current card to unlockedCards
        user.unlockedCards.push({
          _id: currentCard._id,
          title: currentCard.title,
          image: currentCard.image,
          wealthClass: currentCard.associatedWealthClass,
        });

        // Add the points to the user's main shares
        user.shares += user.unlockPoints;

        // Reset unlockPoints and taskShares
        user.unlockPoints = 0;
        user.taskShares = 0;

        // Find the next available card
        const nextCard = await Cards.findOne({
          _id: { $nin: user.unlockedCards.map((c) => c._id) },
        });

        // Set the new currentCard
        user.currentCard = nextCard ? nextCard._id : null;
        await Cards.findByIdAndDelete(currentCard._id);
        // Save the user
        await user.save();

        return res.status(200).json({
          message:
            "Task completed, card collected successfully! Next card unlocked.",
          reward,
          taskShares: user.taskShares,
          userShares: user.shares,
          nextCard: nextCard || "No more cards available.",
        });
      }

      // Save the progress if card not yet completed
      await user.save();

      return res.status(200).json({
        message: "Task completed successfully",
        reward,
        taskShares: user.taskShares,
        userShares: user.shares,
        remainingPoints: currentCard.totalUnlockPoints - user.unlockPoints,
        unlockedPoints: user.unlockPoints,
        progressInPercentage: Math.min(
          Math.floor((user.unlockPoints / currentCard.totalUnlockPoints) * 100),
          100
        ),
        progressDisplay: `${user.unlockPoints}/${currentCard.totalUnlockPoints}`,
      });
    }

    // If no currentCard, set the first available card as currentCard
    const firstCard = await Cards.findOne({
      _id: { $nin: user.unlockedCards.map((c) => c._id) },
    });
    if (firstCard) {
      user.currentCard = firstCard._id;
      await user.save();
    }

    res.status(200).json({
      message: "Task completed successfully",
      reward,
      taskShares: user.taskShares,
      userShares: user.shares,
      completedTasks: user.completedTasks,
      unlockPoints: user.unlockPoints,
    });
  } catch (error) {
    console.error("Error completing task:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to complete task",
      error: error.message,
    });
  }
};

exports.deleteTasks = async (req, res) => {
  try {
    // Specify the user and the number of points to add
    const userId = "67696efe4a2133702e491d3d"; // Replace with the appropriate user ID
    const taskPoints = 500; // Example points to add, use actual calculated value if needed

    // Update the user with the new unlockPoints
    const updatedUser = await User.updateOne(
      { _id: userId }, // Find the user by their ID
      { $unset: { completedTasks: 1 } } // Increment the unlockPoints field by taskPoints
    );

    if (updatedUser.nModified === 0) {
      return res
        .status(400)
        .json({ message: "No user found or unlockPoints were not updated." });
    }

    // Delete all tasks (if that's still required)
    await Tasks.deleteMany({});

    res.status(200).json({
      message: "All tasks deleted successfully and unlockPoints updated.",
    });
  } catch (error) {
    console.error("Error deleting tasks:", error);
    res.status(500).json({ message: "An error occurred while deleting tasks" });
  }
};

// Send Telegram notification
// const users = await User.find({});

// users.forEach((user) => {
//   if (user.chat_id) {
//     const notificationMessage = `Hey ${
//       user.username || "there"
//     }, a new Task is available! 🎉 Go and perform the tasks to claim your reward! 🚀`;
//     bot.sendMessage(
//       user.chat_id,
//       notificationMessage,
//       (options = {
//         reply_markup: {
//           inline_keyboard: [
//             [
//               {
//                 text: "Perfom Task",
//                 web_app: {
//                   url: "https://zeenstreet-ten.vercel.app/tasks",
//                 },
//               },
//             ],
//           ],
//         },
//       })
//     );
//   }
// });
