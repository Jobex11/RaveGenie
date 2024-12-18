const { User } = require("../models/database");
const { default: Tasks } = require("../models/tasks");

exports.completeTask = async (req, res) => {
  const { telegramId } = req.body; // User ID from session or request
  const { taskId } = req.params;

  try {
    // Find the user
    const user = await User.findById(telegramId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the task is already marked as completed
    if (user.completedTasks.includes(taskId)) {
      return res.status(400).json({ message: "Task already completed" });
    }

    // Add task ID to completedTasks
    user.completedTasks.push(taskId);
    await user.save();
    res.status(200).json({
      message: "Tasks marked as completed",
      completedTasks: user.completedTasks,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark task as completed" });
  }
};

exports.completedTasks = async (req, res) => {
  const { telegramId } = req.params;

  try {
    const user = await User.findById(telegramId).populate("completedTasks"); // Populate task details
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ completedTasks: user.completedTasks });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch completed tasks" });
  }
};

// Fetch all tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Tasks.find();
    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};
